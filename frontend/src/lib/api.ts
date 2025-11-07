import axios from "axios";

const API_URL: string = import.meta.env.VITE_API_URL as string;

export interface ApiResponse {
  message?: string;
  status?: string;
  account_id?: number;
  new_count?: number;
  updated_count?: number;

}

export const syncTrades = async (accountId: number, days = 90): Promise<ApiResponse> => {
  const res = await axios.post<ApiResponse>(`${API_URL}/sync_trades/${accountId}?days=${days}`);
  return res.data;
};

export const getStatus = async (): Promise<ApiResponse> => {
  const res = await axios.get<ApiResponse>(`${API_URL}/`);
  return res.data;
};
