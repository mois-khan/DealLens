import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyseDeck(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_URL}/analyse`,
    formData,
    { 
      headers: { 'Content-Type': 'multipart/form-data' },
      // Optional timeout - backend can take up to 20-30s depending on Gemini
      timeout: 60000 
    }
  );

  return response.data;
}

export async function getReport(reportId) {
  const response = await axios.get(`${API_URL}/report/${reportId}`);
  return response.data;
}
