import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

if (!API_URL) {
  API_URL = window.location.port === '5173' ? 'http://localhost:8000' : '';
}

// Helper to get auth header from Supabase session in localStorage
const getAuthHeaders = () => {
  const sessionStr = localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`);
  if (!sessionStr) return {};
  try {
    const session = JSON.parse(sessionStr);
    return { 'Authorization': `Bearer ${session.access_token}` };
  } catch (e) {
    return {};
  }
};

export async function analyseDeck(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_URL}/analyse`,
    formData,
    { 
      headers: { 
        'Content-Type': 'multipart/form-data',
        ...getAuthHeaders()
      },
      timeout: 300000 
    }
  );

  return response.data;
}

export async function getReport(reportId) {
  const response = await axios.get(`${API_URL}/report/${reportId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function chatWithDeal(message, history, rawText) {
  const response = await axios.post(`${API_URL}/chat`, {
    message,
    history,
    raw_text: rawText
  }, {
    headers: getAuthHeaders()
  });
  return response.data;
}

// Dashboard API calls
export async function getDeals() {
  const response = await axios.get(`${API_URL}/deals/`, {
    headers: getAuthHeaders()
  });
  return response.data.deals;
}

export async function updateDealStatus(dealId, status) {
  const response = await axios.patch(`${API_URL}/deals/${dealId}/status`, { status }, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function deleteDeal(dealId) {
  const response = await axios.delete(`${API_URL}/deals/${dealId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getPreferences() {
  const response = await axios.get(`${API_URL}/deals/preferences`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function savePreferences(interested, disqualified) {
  const response = await axios.post(`${API_URL}/deals/preferences`, {
    interested_categories: interested,
    disqualified_categories: disqualified
  }, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function sendInvite(dealId) {
  const response = await axios.post(`${API_URL}/deals/${dealId}/invite`, {}, {
    headers: getAuthHeaders()
  });
  return response.data;
}
