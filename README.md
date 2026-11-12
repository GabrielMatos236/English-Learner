# English Learner

Webapp de teste de nivelamento adaptativo (A1 → B2), com duas entradas:

- **`/teste`**: a aluna coloca o nome e faz o teste. No fim, ela só vê "Pronto!".
- **`/professor`**: área com senha. Lá aparecem todos os resultados, cada um com o nível estimado, o mapa por tópico, a trilha sugerida e as questões erradas.

Stack: React + Vite no front, Vercel Functions (`/api`) no back e Upstash Redis pra guardar os resultados.

---

## Como o teste funciona

### 1. Currículo em tópicos (`src/data/curriculum.js`)
São 4 níveis (A1, A2, B1, B2), cada um com tópicos na ordem em que normalmente se aprende, e cada tópico com 3 questões. O último tópico de cada nível é uma **leitura** (um texto + 3 perguntas).
Nas questões, a **opção correta é sempre a primeira** do array. Na tela elas aparecem embaralhadas.

### 2. Motor adaptativo (`src/lib/engine.js`)
Pra cada tópico:

| Respostas | Resultado |
|---|---|
| ✅✅ | domina (para nas 2) |
| ❌❌ | não sabe (para nas 2) |
| ✅❌ ou ❌✅ | faz a 3ª de desempate: 2/3 = instável, 1/3 = não sabe |
| Leitura | sempre 3: 3/3 domina, 2/3 instável, ≤1 não sabe |

No fim de cada nível, conta a "fraqueza": cada *não sabe* vale 1 e cada *instável* vale 0,5. Se isso der **50% ou mais do nível**, o teste para ali e o resto vira "não testado".
O botão **"Não sei"** conta como erro. É ele que evita que chute vire falso positivo.

### 3. Relatório (`src/lib/report.js`)
- **Nível estimado**: o último nível, em sequência, com pelo menos 70% de domínio (domina = 1, instável = 0,5).
- **Trilha**: pula o que ela domina. Os tópicos instáveis **antes** do primeiro buraco viram *revisões rápidas*. Do primeiro "não sabe" em diante, tudo vira *aula*, na ordem do currículo.

Com 300 alunos simulados por perfil, deu isto:

| Perfil | Média de perguntas | Nível mais comum |
|---|---|---|
| Zero | ~19 | Pré-A1 |
| Básica | ~43 | A1 |
| Intermediária | ~66 | A2 |
| Fluente | ~68 | B2 |

Quer ajustar a régua? Mexa em `STOP_THRESHOLD` (engine) e `REACHED_LEVEL_RATIO` (report).

---

## Segurança (resumo)
- A senha fica **só no servidor** (`ADMIN_PASSWORD`). O login devolve um token assinado com HMAC que vale 12h e fica no `sessionStorage`.
- `GET` e `DELETE` em `/api/results` exigem esse token. O `POST` é público, porque a aluna não tem senha, mas o servidor valida o formato e o tamanho do que chega.
- Senha errada tem um atraso de 600ms, pra dificultar força bruta.

---

## Rodando localmente

```bash
npm install
cp .env.example .env   # e coloca uma senha em ADMIN_PASSWORD
npm run dev
```

O `vite.config.js` tem um pluginzinho que serve as funções de `/api` no `npm run dev`, então não precisa de `vercel dev`. Sem as variáveis do Redis, os resultados ficam em memória e somem quando o servidor reinicia.

---

## Deploy na Vercel

1. Sobe o projeto num repositório do GitHub e importa na Vercel. Ela detecta Vite sozinha.
2. No projeto, vai em **Storage → Create Database → Upstash (Redis)**. O plano grátis dá e sobra. Conecta ao projeto, e ele injeta `KV_REST_API_URL` e `KV_REST_API_TOKEN` sozinho.
   - O código também aceita `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, caso as variáveis venham com esses nomes.
3. Em **Settings → Environment Variables**, adiciona:
   - `ADMIN_PASSWORD`: sua senha
   - `AUTH_SECRET`: um texto aleatório longo (dá pra gerar com `openssl rand -base64 32`)
4. Faz um **Redeploy** pra ele pegar as variáveis.
5. Manda `https://seu-app.vercel.app/teste` pra aluna e entra em `/professor` pra ver o resultado.

---

## Estrutura

```
api/
  _lib/auth.js      # senha + token HMAC
  _lib/store.js     # Redis (ou memória no dev)
  login.js          # POST /api/login
  results.js        # POST (público) / GET, DELETE (com token)
src/
  data/curriculum.js        # níveis, tópicos, questões, textos
  lib/engine.js             # motor adaptativo (funções puras)
  lib/report.js             # nível estimado, mapa, trilha, erros
  lib/api.js                # chamadas ao back + token
  pages/Home.jsx
  pages/StudentTest.jsx     # fluxo da aluna (salva progresso no localStorage)
  pages/TeacherArea.jsx     # login + lista de resultados
  components/ResultReport.jsx
```

---

## Practice (exercícios com IA)

**Como a aluna chega no Practice:** quando ela termina o teste, o navegador guarda o id do resultado dela no `localStorage`. Se ela trocar de aparelho, você copia o **link do Practice** (`/pratica/<id>`) no painel e manda pra ela. O id é um UUID impossível de adivinhar, então o link funciona como a chave dela.

**O que cai no Practice** (`src/lib/learning.js`): ela "já sabe" o que dominou no teste mais o que você marcou como **dei aula** na trilha. Cada rodada sorteia até 3 tópicos, nesta prioridade:
1. as 2 últimas aulas marcadas;
2. tópicos instáveis do teste;
3. o resto do que ela já sabe.

Se ela ainda não sabe nada, a rodada é uma prévia do primeiro tópico da trilha.

**Geração** (`api/practice.js` + `api/_lib/gemini.js`):
- O servidor pede 5 exercícios ao Gemini em JSON com schema fixo e valida tudo antes de mandar pra tela: 4 opções diferentes, índice válido etc.
- Só os tópicos e o nível vão pro Gemini. O nome dela não vai, porque no plano grátis o Google pode usar os dados enviados.
- Tem um intervalo de 20s entre gerações, pra ninguém torrar a cota.
- Sem `GEMINI_API_KEY`, o Practice roda em **modo exemplo**, com as questões do próprio teste. É útil pra desenvolver.

**Avisos de erro:** o botão "⚑ Acho que essa tá errada" salva o exercício no registro dela e aparece no seu painel (⚑ na lista de resultados).

**Configurando:**
1. Gera a chave em [aistudio.google.com](https://aistudio.google.com) → *Get API key*.
2. Na Vercel, adiciona `GEMINI_API_KEY` (e, se quiser, `GEMINI_MODEL`) nas Environment Variables e faz um redeploy.

### Rotas
| Rota | O que é |
|---|---|
| `/` | Home (English Learner) |
| `/aluno` | Escolha entre Test your Knowledge e Practice |
| `/teste` | Teste de nivelamento |
| `/pratica` (e `/pratica/:id`) | Practice |
| `/professor` | Painel com senha |

| API | Acesso |
|---|---|
| `POST /api/results` | público (envio do teste, devolve o id) |
| `GET / PATCH / DELETE /api/results` | professor (PATCH: `taughtTopics`, `clearFlags`) |
| `GET / POST /api/practice` | com o id da aluna |
| `POST /api/flags` | com o id da aluna |
