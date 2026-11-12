// Armazenamento dos resultados.
// Em produção: Upstash Redis (integração da Vercel Marketplace).
// Sem as variáveis do Redis (rodando local), cai num Map em memória, só pra desenvolvimento.
//
// Estrutura no Redis:
//   result:<id>  → JSON do resultado
//   results      → sorted set com os ids, ordenado pela data de término

import { Redis } from '@upstash/redis'

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = url && token ? new Redis({ url, token }) : null

if (!redis) {
  console.warn('[store] Redis não configurado: usando memória (os dados somem ao reiniciar).')
}

const memoryStore = globalThis.__placementMemoryStore ?? new Map()
globalThis.__placementMemoryStore = memoryStore

export async function saveResult(result) {
  if (!redis) {
    memoryStore.set(result.id, result)
    return
  }
  await redis.set(`result:${result.id}`, result)
  await redis.zadd('results', { score: Date.parse(result.finishedAt), member: result.id })
}

export async function listResults() {
  if (!redis) {
    return [...memoryStore.values()].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
  }
  const ids = await redis.zrange('results', 0, -1, { rev: true })
  if (!ids.length) return []
  const results = await redis.mget(...ids.map((id) => `result:${id}`))
  return results.filter(Boolean)
}

export async function deleteResult(id) {
  if (!redis) {
    memoryStore.delete(id)
    return
  }
  await redis.del(`result:${id}`)
  await redis.zrem('results', id)
}
