const API_BASE = "http://localhost:8000";

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

    // ✅ Salvar token e tipo corretamente
    localStorage.setItem("access_token", json.access_token);
    localStorage.setItem("token_type", json.token_type);

    // ✅ Redirecionar para o chat
    window.location.href = "chat.html";
  } catch (err) {
    showAlert(err.message);
  }
}


async function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const apiKey = document.getElementById("apiKey").value;

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, open_router_api_key: apiKey })
    });

    if (!res.ok) throw new Error("Erro ao registrar usuário.");
    showAlert("Usuário registrado com sucesso!", "success");
  } catch (err) {
    showAlert(err.message);
  }
}

async function updateUser() {
  const apiKey = document.getElementById("apiKey").value.trim();
  const token = localStorage.getItem("access_token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";

  try {
    const res = await fetch(`${API_BASE}/users/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${tokenType} ${token}`
      },
      body: JSON.stringify({ open_router_api_key: apiKey })
    });

    if (!res.ok) throw new Error("Erro ao atualizar o usuário.");
    showAlert("API Key atualizada com sucesso!", "success");
  } catch (err) {
    showAlert(err.message);
  }
}


