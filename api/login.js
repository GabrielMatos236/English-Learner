import { checkPassword, createToken } from './_lib/auth.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { password } = req.body ?? {}
    if (!checkPassword(password)) {
      await wait(600) // atrasa tentativas de força bruta
      return res.status(401).json({ error: 'Senha incorreta' })
    }
    return res.status(200).json({ token: createToken() })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
