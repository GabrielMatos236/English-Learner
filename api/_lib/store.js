// Armazenamento dos resultados.
// Em produção: Upstash Redis (integração da Vercel Marketplace).
// Sem as variáveis do Redis (rodando local), cai num Map em memória, só pra desenvolvimento.
//
// Estrutura no Redis:
//   result:<id>  → JSON do resultado
//   results      → sorted set com os ids, ordenado pela data de término

import { Redis } from '@upstash/redis'

// A integração da Vercel pode criar as variáveis com prefixo (ex.: STORAGE_KV_REST_API_URL),
// então aceitamos o nome puro ou qualquer um terminando em _<nome>.
function findEnv(names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name]
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (value && names.some((name) => key.endsWith(`_${name}`))) return value
  }
  return undefined
}

const url = findEnv(['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'])
const token = findEnv(['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN'])

const redis = url && token ? new Redis({ url, token }) : null
export const isRedisConfigured = Boolean(redis)

// Na Vercel cada função roda separada, então memória NÃO serve: o teste salvaria numa função
// e o Practice procuraria em outra. Lá, sem Redis, é erro com mensagem clara.
const isOnVercel = Boolean(process.env.VERCEL)

if (!redis) {
  console.warn(
    isOnVercel
      ? '[store] Redis não configurado na Vercel! Conecte o Upstash Redis ao projeto e faça redeploy.'
      : '[store] Redis não configurado: usando memória (os dados somem ao reiniciar).'
  )
}

export class StoreNotConfiguredError extends Error {
  constructor() {
    super('Banco de dados não configurado: conecte o Upstash Redis ao projeto na Vercel e faça redeploy.')
    this.expose = true
  }
}

// true = usar memória (dev local); lança erro se estiver na Vercel sem Redis.
function useMemory() {
  if (redis) return false
  if (isOnVercel) throw new StoreNotConfiguredError()
  return true
}

const memoryStore = globalThis.__placementMemoryStore ?? new Map()
globalThis.__placementMemoryStore = memoryStore

export async function saveResult(result) {
  if (useMemory()) {
    memoryStore.set(result.id, result)
    return
  }
  await redis.set(`result:${result.id}`, result)
  await redis.zadd('results', { score: Date.parse(result.finishedAt), member: result.id })
}

export async function listResults() {
  if (useMemory()) {
    return [...memoryStore.values()].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
  }
  const ids = await redis.zrange('results', 0, -1, { rev: true })
  if (!ids.length) return []
  const results = await redis.mget(...ids.map((id) => `result:${id}`))
  return results.filter(Boolean)
}

export async function deleteResult(id) {
  if (useMemory()) {
    memoryStore.delete(id)
    return
  }
  await redis.del(`result:${id}`)
  await redis.zrem('results', id)
}

export async function getResult(id) {
  if (useMemory()) return memoryStore.get(id) ?? null
  return (await redis.get(`result:${id}`)) ?? null
}

// Lê, aplica a função de atualização e grava de volta. Devolve o registro novo (ou null se não existe).
// Não é transacional, mas pra um professor e poucas alunas não tem disputa real.
export async function updateResult(id, updater) {
  const current = await getResult(id)
  if (!current) return null
  const updated = updater(structuredClone(current))
  if (useMemory()) memoryStore.set(id, updated)
  else await redis.set(`result:${id}`, updated)
  return updated
}

// Trava simples por tempo: devolve true se conseguiu (não havia trava ativa), false se ainda está esperando.
// Usada pra não deixarem a cota do Gemini acabar apertando o botão sem parar.
const memoryCooldowns = globalThis.__placementCooldowns ?? new Map()
globalThis.__placementCooldowns = memoryCooldowns

export async function acquireCooldown(key, seconds) {
  if (useMemory()) {
    const until = memoryCooldowns.get(key) ?? 0
    if (until > Date.now()) return false
    memoryCooldowns.set(key, Date.now() + seconds * 1000)
    return true
  }
  const result = await redis.set(`cooldown:${key}`, 1, { nx: true, ex: seconds })
  return result === 'OK'
}