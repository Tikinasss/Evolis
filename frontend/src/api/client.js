const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

function withAuth(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function toQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

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

export async function registerFirebaseProfile(payload, token) {
  const response = await fetch(`${API_URL}/auth/firebase/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getMe(token) {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      ...withAuth(token),
    },
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
      ...withAuth(token),
    },
    body: formData,
  });

  return handleResponse(response);
}

export async function getAnalyses(token, filters = {}) {
  const response = await fetch(`${API_URL}/analyses${toQueryString(filters)}`, {
    headers: {
      ...withAuth(token),
    },
  });

  return handleResponse(response);
}

export async function getHealthTrend(token) {
  const response = await fetch(`${API_URL}/analyses/summary/health-trend`, {
    headers: {
      ...withAuth(token),
    },
  });

  return handleResponse(response);
}

export async function compareAnalyses(token, firstId, secondId) {
  const response = await fetch(
    `${API_URL}/analyses/compare${toQueryString({ firstId, secondId })}`,
    {
      headers: {
        ...withAuth(token),
      },
    }
  );

  return handleResponse(response);
}

export async function updateAnalysisStatus(token, analysisId, status) {
  const response = await fetch(`${API_URL}/analyses/${analysisId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ status }),
  });

  return handleResponse(response);
}

export async function getActionItems(token, analysisId) {
  const response = await fetch(`${API_URL}/analyses/${analysisId}/action-items`, {
    headers: {
      ...withAuth(token),
    },
  });

  return handleResponse(response);
}

export async function createActionItem(token, analysisId, title) {
  const response = await fetch(`${API_URL}/analyses/${analysisId}/action-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ title }),
  });

  return handleResponse(response);
}

export async function toggleActionItem(token, itemId, completed) {
  const response = await fetch(`${API_URL}/action-items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ completed }),
  });

  return handleResponse(response);
}

export async function getAnalysisNotes(token, analysisId) {
  const response = await fetch(`${API_URL}/analyses/${analysisId}/notes`, {
    headers: {
      ...withAuth(token),
    },
  });

  return handleResponse(response);
}

export async function createAnalysisNote(token, analysisId, content) {
  const response = await fetch(`${API_URL}/analyses/${analysisId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ content }),
  });

  return handleResponse(response);
}
