import axios from "axios";

const API_URL: string = import.meta.env.VITE_API_URL as string;

export interface ApiResponse {
  message?: string;
  status?: string;
}

export const syncTrades = async (): Promise<ApiResponse> => {
  const res = await axios.post<ApiResponse>(`${API_URL}/sync_trades`);
  return res.data;
};

export const getStatus = async (): Promise<ApiResponse> => {
  const res = await axios.get<ApiResponse>(`${API_URL}/`);
  return res.data;
};
