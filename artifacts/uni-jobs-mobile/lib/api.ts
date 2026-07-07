import AsyncStorage from "@react-native-async-storage/async-storage";

const domain = process.env.EXPO_PUBLIC_DOMAIN;

const isLocalOrIP = /^(localhost|127\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/.test(domain || "");
const protocol = domain
  ? domain.startsWith("http")
    ? ""
    : isLocalOrIP ? "http://" : "https://"
  : "";
const BASE = domain ? `${protocol}${domain}/api` : null;

const REQUEST_TIMEOUT_MS = 15000;

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  if (!BASE) {
    throw new Error(
      "API not configured. Set EXPO_PUBLIC_DOMAIN environment variable. " +
      "For local Expo Go: export EXPO_PUBLIC_DOMAIN=YOUR_MACHINE_IP:5000"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
      ...options,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err: any = new Error((data as any).error || `Request failed: ${res.status}`);
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. ` +
        "Cannot connect to server. Check if backend is running and EXPO_PUBLIC_DOMAIN is correct."
      );
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to server. Check network connection and EXPO_PUBLIC_DOMAIN setting."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface Worker {
  _id: string;
  name: string;
  fatherName: string;
  phone: string;
  aadhaar: string;
  uan: string;
  address: string;
  state: string;
  city: string;
  area: string;
  education: string;
  experience: string;
  category: string;
  availability: "available" | "notAvailable";
  employmentStatus?: "available" | "working";
  currentCompanyId?: string | null;
  currentCompanyName?: string | null;
  createdAt: string;
}

export interface WorkerAuthResponse extends Worker {
  token: string;
}

export type WorkerRegistrationInput = Pick<
  Worker,
  "name" | "fatherName" | "phone" | "aadhaar" | "uan" | "address" | "state" | "city" | "area" | "education" | "experience" | "category"
>;

export interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Requirement {
  _id: string;
  companyId: any;
  title: string;
  description: string;
  category: string;
  city: string;
  vacancies: number;
  createdAt: string;
}

export const api = {
  registerWorker: (body: WorkerRegistrationInput) =>
    req<WorkerAuthResponse>("/workers/register", { method: "POST", body: JSON.stringify(body) }),

  getWorker: async (id: string, companyId?: string) => {
    const q = new URLSearchParams();
    if (companyId) q.set("companyId", companyId);

    const token = await AsyncStorage.getItem("worker_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token && !companyId) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const queryStr = q.toString();
    return req<Worker>(`/workers/${id}${queryStr ? `?${queryStr}` : ""}`, { headers });
  },

  updateWorker: async (id: string, body: Partial<Worker>) => {
    const token = await AsyncStorage.getItem("worker_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return req<Worker>(`/workers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    });
  },

  updateWorkerEmployment: (
    id: string,
    employmentStatus: "available" | "working",
    companyId: string | null,
    companyName: string | null,
  ) =>
    req<Worker>(`/workers/${id}/employment`, {
      method: "PATCH",
      body: JSON.stringify({ employmentStatus, companyId, companyName }),
    }),

  toggleWorkerAvailability: async (id: string, availability: "available" | "notAvailable") => {
    const token = await AsyncStorage.getItem("worker_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return req<Worker>(`/workers/${id}/availability`, {
      method: "PUT",
      body: JSON.stringify({ availability }),
      headers,
    });
  },

  loginWorker: (phone: string) =>
    req<WorkerAuthResponse>("/workers/login", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  registerCompany: (body: Omit<Company, "_id" | "status" | "createdAt"> & { password: string }) =>
    req<Company>("/companies/register", { method: "POST", body: JSON.stringify(body) }),

  getCompany: (id: string) => req<Company>(`/companies/${id}`),

  loginCompany: (email: string, password: string) =>
    req<Company>("/companies/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  searchWorkers: (companyId: string, category?: string, state?: string, city?: string, area?: string) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (state) q.set("state", state);
    if (city) q.set("city", city);
    if (area) q.set("area", area);
    return req<Worker[]>(`/companies/${companyId}/workers?${q}`);
  },

  getCompanyWorkforce: (companyId: string) =>
    req<Worker[]>(`/workers/company/${companyId}`),

  getRequirements: () => req<Requirement[]>("/requirements"),

  getCompanyRequirements: (id: string) => req<Requirement[]>(`/requirements/company/${id}`),

  postRequirement: (body: Omit<Requirement, "_id" | "createdAt">) =>
    req<Requirement>("/requirements", { method: "POST", body: JSON.stringify(body) }),

  recordContact: (companyId: string, workerId: string, body?: { job?: string; location?: string }) =>
    req<any>(`/companies/${companyId}/contact/${workerId}`, { method: "POST", body: JSON.stringify(body || {}) }),

  adminLogin: async (secret: string) => {
    const res = await req<{ token: string }>("/admin/login", { method: "POST", body: JSON.stringify({ secret }) });
    if (res.token) {
      await AsyncStorage.setItem("admin_token", res.token);
    }
    return res;
  },

  adminGetCompanies: async (status?: string, page?: number, limit?: number) => {
    const token = await AsyncStorage.getItem("admin_token");
    if (!token) {
      const err: any = new Error("Missing admin token");
      err.status = 401;
      throw err;
    }
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (page) q.set("page", page.toString());
    if (limit) q.set("limit", limit.toString());
    const queryStr = q.toString();
    const url = `/admin/companies${queryStr ? `?${queryStr}` : ""}`;
    return req<{ companies: Company[]; page: number; limit: number; total: number }>(url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  },

  adminUpdateStatus: async (id: string, status: "approved" | "rejected" | "pending") => {
    const token = await AsyncStorage.getItem("admin_token");
    if (!token) {
      const err: any = new Error("Missing admin token");
      err.status = 401;
      throw err;
    }
    return req<Company>(`/admin/companies/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  },

  adminGetWorkers: async (page?: number, limit?: number) => {
    const token = await AsyncStorage.getItem("admin_token");
    if (!token) {
      const err: any = new Error("Missing admin token");
      err.status = 401;
      throw err;
    }
    const q = new URLSearchParams();
    if (page) q.set("page", page.toString());
    if (limit) q.set("limit", limit.toString());
    const queryStr = q.toString();
    const url = `/admin/workers${queryStr ? `?${queryStr}` : ""}`;
    return req<{ workers: Worker[]; page: number; limit: number; total: number }>(url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  },

  getWorkerContacts: async (workerId: string) => {
    const token = await AsyncStorage.getItem("worker_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return req<any[]>(`/workers/${workerId}/contacts`, { headers });
  },
};
