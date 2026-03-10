const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function registerUser(payload) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function analyzeBusiness(payload, token) {
  const formData = new FormData();
  formData.append("companyName", payload.companyName);
  formData.append("industry", payload.industry);
  formData.append("revenueChange", payload.revenueChange);
  formData.append("debt", payload.debt);
  formData.append("reviewTrend", payload.reviewTrend);

  if (payload.document) {
    formData.append("document", payload.document);
  }

  const response = await fetch(`${API_URL}/analyze-business`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(response);
}

export async function getAnalyses(token) {
  const response = await fetch(`${API_URL}/analyses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}
