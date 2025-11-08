const API_BASE = "http://localhost:8000";

// ========== Helpers de autenticação ==========
function getToken() {
  return localStorage.getItem("access_token") || localStorage.getItem("token");
}

function getTokenType() {
  return localStorage.getItem("token_type") || "Bearer";
}

function isAuthenticated() {
  return Boolean(getToken());
}

function getAuthHeaders(extra = {}) {
  const token = getToken();
  const type = getTokenType();
  const headers = { ...extra };
  if (token) headers["Authorization"] = `${type} ${token}`;
  return headers;
}

function requireAuth(redirectTo = "login.html") {
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const data = new URLSearchParams();
    data.append("username", email);
    data.append("password", password);

    const res = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Falha no login: ${errorText}`);
    }

    const json = await res.json();

    // Salvar token e tipo
    if (json?.access_token) localStorage.setItem("access_token", json.access_token);
    if (json?.token_type) localStorage.setItem("token_type", json.token_type);

    // Redirecionar para o chat
    window.location.href = "chat.html";
  } catch (err) {
    showAlert(err.message);
  }
}


async function registerUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const apiKey = document.getElementById("apiKey").value.trim();

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, open_router_api_key: apiKey })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Erro ao registrar usuário.");
    }
    showAlert("Usuário registrado com sucesso!", "success");
    // Pequeno atraso e volta ao login
    setTimeout(() => (window.location.href = "login.html"), 800);
  } catch (err) {
    showAlert(err.message);
  }
}

async function updateUser() {
  const apiKey = document.getElementById("apiKey").value.trim();
  const token = getToken();
  const tokenType = getTokenType();

  try {
    const res = await fetch(`${API_BASE}/users/update`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ open_router_api_key: apiKey })
    });

    if (!res.ok) {
      if (res.status === 401) {
        showAlert("Sessão expirada. Faça login novamente.");
        setTimeout(() => logout(), 800);
        return;
      }
      const txt = await res.text();
      throw new Error(txt || "Erro ao atualizar o usuário.");
    }
    showAlert("API Key atualizada com sucesso!", "success");
  } catch (err) {
    showAlert(err.message);
  }
}

// Disponibiliza funções utilitárias globalmente para as páginas
window.auth = {
  getToken,
  getTokenType,
  isAuthenticated,
  getAuthHeaders,
  requireAuth,
  logout,
};


