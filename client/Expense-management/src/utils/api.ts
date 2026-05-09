import axios, { type AxiosInstance } from "axios";
import type { AuthResponse, Expense, Group, Settlement, User, GroupInvitation, Notification, DebtPayment } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),
  getProfile: () => api.get<User>("/auth/profile"),
  updateProfile: (data: Partial<User>) =>
    api.put<{ message: string; user: User }>("/auth/profile", data),
  searchUsers: (query: string) => api.get<User[]>(`/auth/search?query=${encodeURIComponent(query)}`),
};

// Group APIs
export const groupAPI = {
  createGroup: (data: { name: string; description?: string; inviteUserIds?: string[] }) =>
    api.post<Group>("/group", data),
  getMyGroups: () => api.get<Group[]>("/group"),
  getGroupById: (groupId: string) => api.get<Group>(`/group/${groupId}`),
  addMember: (data: { groupId: string; userId: string }) =>
    api.post("/group/member/add", data),
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/group/${groupId}/member/${userId}`),
  updateGroup: (groupId: string, data: Partial<Group>) =>
    api.put(`/group/${groupId}`, data),
};

// Invitation APIs
export const invitationAPI = {
  getMyInvitations: () => api.get<GroupInvitation[]>("/invitation"),
  acceptInvitation: (invitationId: string) =>
    api.post(`/invitation/${invitationId}/accept`, {}),
  rejectInvitation: (invitationId: string) =>
    api.post(`/invitation/${invitationId}/reject`, {}),
  sendInvitation: (data: { groupId: string; userId: string }) =>
    api.post("/invitation", data),
};

export const notificationAPI = {
  getMyNotifications: () => api.get<Notification[]>("/notification"),
  markNotificationRead: (notificationId: string) =>
    api.post(`/notification/${notificationId}/read`, {}),
};

// Expense APIs
export const expenseAPI = {
  addExpense: (data: {
    amount: number;
    description?: string;
    groupId: string;
    paidBy: string;
    splitAmongUserIds: string[];
  }) => api.post<Expense>("/expense", data),
  payDebt: (groupId: string, data: { toUserId: string; amount: number }) =>
    api.post<DebtPayment>(`/expense/${groupId}/pay`, data),

  getGroupExpenses: (groupId: string) =>
    api.get<Expense[]>(`/expense/${groupId}`),
  updateExpense: (expenseId: string, data: Partial<Expense>) =>
    api.put(`/expense/${expenseId}`, data),
  deleteExpense: (expenseId: string) =>
    api.delete(`/expense/${expenseId}`),
  getSettlement: (groupId: string) =>
    api.get<{
      balances: Record<string, number>;
      settlements: Settlement[];
    }>(`/expense/${groupId}/settlement`),
};

export default api;
