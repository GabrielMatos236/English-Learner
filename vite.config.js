import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin só de desenvolvimento: faz o `npm run dev` servir as funções da pasta /api
// do mesmo jeito que a Vercel faz em produção. Assim você não precisa do `vercel dev`.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const routeName = url.pathname.replace(/^\/+|\/+$/g, '')
        if (!/^[a-z-]+$/.test(routeName)) return next()

        let handler
        try {
          handler = (await server.ssrLoadModule(`/api/${routeName}.js`)).default
        } catch {
          return next()
        }

        let rawBody = ''
        for await (const chunk of req) rawBody += chunk
        try {
          req.body = rawBody ? JSON.parse(rawBody) : undefined
        } catch {
          req.body = undefined
        }
        req.query = Object.fromEntries(url.searchParams)

        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(data))
          return res
        }

        try {
          await handler(req, res)
        } catch (error) {
          console.error(error)
          res.statusCode = 500
          res.end('Erro interno')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Carrega o .env (inclusive variáveis sem prefixo VITE_) pro process.env das funções locais.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), localApi()],
  }
})
