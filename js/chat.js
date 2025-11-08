/* Chat básico integrando com a API */
const CHAT_ENDPOINT = `${API_BASE}/api/chat/send`;
const DEFAULT_MODELS = [
  { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
  { label: 'GPT-4.1 Mini', value: 'openai/gpt-4.1-mini' },
];

let currentConversationId = localStorage.getItem('conversation_id') || null;

function initChatPage() {
  if (!auth.requireAuth()) return;
  const input = document.getElementById('userInput');
  const btn = document.getElementById('sendBtn');
  const messages = document.getElementById('messages');
  const modelSelect = ensureModelSelect();
  const maxTokensEl = ensureMaxTokens();
  const temperatureEl = ensureTemperature();
  const embeddingEl = ensureEmbeddingToggle();

  // Enviar com botão e Enter
  btn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function appendMessage(text, role = 'user') {
    const item = document.createElement('div');
    item.className = `message ${role}`;
    item.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Mostra mensagem do usuário
    appendMessage(text, 'user');

    // Estado de carregamento
    const thinkingId = `thinking-${Date.now()}`;
    const thinking = document.createElement('div');
    thinking.id = thinkingId;
    thinking.className = 'message bot';
    thinking.innerHTML = '<div class="bubble"><span class="text-secondary">Pensando…</span></div>';
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    try {
      const payload = {
        chat_id: currentConversationId,
        genai_model: modelSelect.value,
        prompt: text,
        max_tokens: parseInt(maxTokensEl.value || '300', 10),
        use_embedding: Boolean(embeddingEl.checked),
        temperature: parseFloat(temperatureEl.value || '0.7'),
      };

      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: auth.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      // Remove indicador de carregamento
      thinking.remove();

      if (!res.ok) {
        if (res.status === 401) {
          showAlert('Sessão expirada. Faça login novamente.');
          setTimeout(() => auth.logout(), 800);
          return;
        }
        const errTxt = await res.text();
        showAlert(errTxt || 'Erro ao enviar mensagem.');
        return;
      }

      const j = await res.json();
      if (j?.conversation_id) {
        currentConversationId = j.conversation_id;
        localStorage.setItem('conversation_id', currentConversationId);
      }
      const last = Array.isArray(j?.messages) && j.messages.length > 0
        ? j.messages[j.messages.length - 1]
        : null;
      const replyText = last?.text || '(sem conteúdo)';
      appendMessage(replyText, 'bot');
    } catch (err) {
      try { thinking.remove(); } catch {}
      showAlert(err.message || 'Erro inesperado ao enviar mensagem.');
    }
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureModelSelect() {
  let el = document.getElementById('modelSelect');
  if (!el) return { value: DEFAULT_MODELS[0].value };
  if (!el.options.length) {
    DEFAULT_MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.value;
      opt.textContent = m.label;
      el.appendChild(opt);
    });
  }
  el.value = el.value || DEFAULT_MODELS[0].value;
  return el;
}

function ensureMaxTokens() {
  return document.getElementById('maxTokens') || { value: '300' };
}

function ensureTemperature() {
  return document.getElementById('temperature') || { value: '0.7' };
}

function ensureEmbeddingToggle() {
  return document.getElementById('useEmbedding') || { checked: false };
}
