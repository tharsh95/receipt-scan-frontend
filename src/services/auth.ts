import axios from 'axios';

const API_URL = import.meta.env.VITE_BE_URL

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/users/login`, credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/users/register`, credentials);
  return response.data;
}; 