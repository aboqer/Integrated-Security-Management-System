const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000/api`;

type ApiOptions = RequestInit & {
  token?: string | null;
};

export interface AuthApiUser {
  id: string;
  username: string;
  fullName?: string;
  roleCode?: string;
  departmentId?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken() {
  return localStorage.getItem("auth_token");
}

export function setStoredToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("auth_token");
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const token = options.token ?? getStoredToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.message || "حدث خطأ أثناء الاتصال بالخادم",
    );
  }

  return payload?.data as T;
}

export const api = {
  login: (username: string, password: string) =>
    apiRequest<{ token: string; user: AuthApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      token: null,
    }),

  dashboardSummary: () => apiRequest("/dashboard/summary"),

  reference: {
    departments: () => apiRequest("/reference/departments"),
    locations: () => apiRequest("/reference/locations"),
    violationTypes: () => apiRequest("/reference/violationTypes"),
    reportCategories: () => apiRequest("/reference/reportCategories"),
    commitmentTypes: () => apiRequest("/reference/commitmentTypes"),
  },

  people: {
    list: (search = "") => apiRequest(`/people?search=${encodeURIComponent(search)}`),
    create: (payload: unknown) =>
      apiRequest("/people", { method: "POST", body: JSON.stringify(payload) }),
    get: (id: string) => apiRequest(`/people/${id}`),
  },

  vehicles: {
    list: (search = "") => apiRequest(`/vehicles?search=${encodeURIComponent(search)}`),
    create: (payload: unknown) =>
      apiRequest("/vehicles", { method: "POST", body: JSON.stringify(payload) }),
  },

  violations: {
    list: (params = "") => apiRequest(`/violations${params ? `?${params}` : ""}`),
    create: (payload: unknown) =>
      apiRequest("/violations", { method: "POST", body: JSON.stringify(payload) }),
    setStatus: (id: string, payload: unknown) =>
      apiRequest(`/violations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },

  custody: {
    list: (params = "") => apiRequest(`/custody-records${params ? `?${params}` : ""}`),
    create: (payload: unknown) =>
      apiRequest("/custody-records", { method: "POST", body: JSON.stringify(payload) }),
    deliver: (id: string, payload: unknown) =>
      apiRequest(`/custody-records/${id}/deliver`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  reports: {
    list: (params = "") => apiRequest(`/reports${params ? `?${params}` : ""}`),
    create: (payload: unknown) =>
      apiRequest("/reports", { method: "POST", body: JSON.stringify(payload) }),
    setStatus: (id: string, payload: unknown) =>
      apiRequest(`/reports/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },

  detainees: {
    list: (params = "") => apiRequest(`/detainees${params ? `?${params}` : ""}`),
    create: (payload: unknown) =>
      apiRequest("/detainees", { method: "POST", body: JSON.stringify(payload) }),
    addEvent: (id: string, payload: unknown) =>
      apiRequest(`/detainees/${id}/events`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    release: (id: string, payload: unknown) =>
      apiRequest(`/detainees/${id}/release`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  commitments: {
    list: (params = "") => apiRequest(`/commitments${params ? `?${params}` : ""}`),
    create: (payload: unknown) =>
      apiRequest("/commitments", { method: "POST", body: JSON.stringify(payload) }),
    setStatus: (id: string, payload: unknown) =>
      apiRequest(`/commitments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },
};
