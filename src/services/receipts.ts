import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface UploadResponse {
  message: string;
  id: string;
}

export const uploadReceipt = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await axios.post<UploadResponse>(`${API_URL}/receipts/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}; 