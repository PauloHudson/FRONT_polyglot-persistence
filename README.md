# FRONT_polyglot-persistence

Frontend simples (HTML/CSS/JS) para consumir a API [API_polyglot-persistence](https://github.com/VitorMonteiroVianna/API_polyglot-persistence/tree/mergem_sem_cache).

## Requisitos
- API rodando localmente em `http://localhost:8000` (padrão do projeto FastAPI incluso em `app/main.py`).
- Navegador moderno.

## Estrutura
- `login.html` – Login via `/users/login` (form-urlencoded). Salva o token no `localStorage`.
- `register.html` – Cadastro via `/users/register`. Aceita `email`, `password` e `open_router_api_key`.
- `update.html` – Atualiza a API Key do usuário via `/users/update` (autenticado).
- `chat.html` – Envio de mensagens para `/api/chat/send` (autenticado). Permite escolher modelo, temperatura, max tokens e uso de embedding.
- `js/auth.js` – `API_BASE`, helpers de autenticação e chamadas (`loginUser`, `registerUser`, `updateUser`).
- `js/chat.js` – Lógica de chat e controle de conversa.

## Como usar
1. Abra `index.html` no navegador. Ele redireciona para `login.html` ou `chat.html` dependendo do token.
2. (Opcional) Registre um usuário em `register.html` e volte ao login.
3. Faça login. Você será redirecionado ao `chat.html`.
4. No chat, selecione o modelo, ajuste temperatura e max tokens se quiser, marque “Usar embedding” quando desejar “enriquecer” o prompt.
5. Envie sua mensagem.

## Configuração
Se a API estiver em outro host/porta, altere `API_BASE` em `js/auth.js`:

```js
const API_BASE = "http://localhost:8000";
```

## Notas
- O endpoint de chat utilizado é `POST /api/chat/send`, que recebe JSON no formato:
  ```json
  {
    "chat_id": "opcional",
    "genai_model": "google/gemini-2.5-flash" | "openai/gpt-4.1-mini",
    "prompt": "sua pergunta",
    "max_tokens": 300,
    "use_embedding": false,
    "temperature": 0.7
  }
  ```
- A resposta traz `conversation_id` e `messages`. O frontend mantém o `conversation_id` no `localStorage` para continuar a conversa.
- O histórico não é carregado no início pois a API não expõe um endpoint de GET para isso no router. Se você adicionar, posso integrar.

## Troubleshooting
- 401 ao enviar mensagem: o token expirou. Faça login de novo.
- Erros de CORS: habilite CORS na API ou sirva os arquivos via server no mesmo host/porta usados pela API.
