const domain = process.env.EXPO_PUBLIC_DOMAIN;

// Determine API base URL
// For local development: Must set EXPO_PUBLIC_DOMAIN to your machine's IP (e.g. "192.168.1.100:4001")
// For Replit: EXPO_PUBLIC_DOMAIN is auto-set via replit.dev domain
// For production: Use your API domain
const isLocalOrIP = /^(localhost|127\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/.test(domain || "");
const protocol = domain
  ? domain.startsWith("http")
    ? ""
    : isLocalOrIP ? "http://" : "https://"
  : "";
const BASE = domain ? `${protocol}${domain}/api` : null;

const REQUEST_TIMEOUT_MS = 15000; // 15 second timeout

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
    // Handle abort/timeout
    if (error.name === "AbortError") {
      throw new Error(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. ` +
        "Cannot connect to server. Check if backend is running and EXPO_PUBLIC_DOMAIN is correct."
      );
    }
    
    // Handle network errors
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
  // Optional employment tracking fields (may be absent for existing workers)
  employmentStatus?: "available" | "working";
  currentCompanyId?: string | null;
  currentCompanyName?: string | null;
  createdAt: string;
}

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
  registerWorker: (body: Omit<Worker, "_id" | "createdAt">) =>
    req<Worker>("/workers/register", { method: "POST", body: JSON.stringify(body) }),

  getWorker: (id: string) => req<Worker>(`/workers/${id}`),

  updateWorker: (id: string, body: Partial<Worker>) =>
    req<Worker>(`/workers/${id}`, { method: "PUT", body: JSON.stringify(body) }),

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

  toggleWorkerAvailability: (id: string, availability: "available" | "notAvailable") =>
    req<Worker>(`/workers/${id}/availability`, {
      method: "PUT",
      body: JSON.stringify({ availability }),
    }),

  loginWorker: (phone: string) =>
    req<Worker>(`/workers/login?phone=${encodeURIComponent(phone)}`),

  registerCompany: (body: Omit<Company, "_id" | "status" | "createdAt">) =>
    req<Company>("/companies/register", { method: "POST", body: JSON.stringify(body) }),

  getCompany: (id: string) => req<Company>(`/companies/${id}`),

  loginCompany: (email: string) =>
    req<Company>(`/companies/login?email=${encodeURIComponent(email)}`),

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

  // Record that a company contacted a worker
  recordContact: (companyId: string, workerId: string, body?: { job?: string; location?: string }) =>
    req<any>(`/companies/${companyId}/contact/${workerId}`, { method: "POST", body: JSON.stringify(body || {}) }),

  adminLogin: (secret: string) =>
    req<{ ok: boolean }>("/admin/login", { method: "POST", body: JSON.stringify({ secret }) }),

  adminGetCompanies: (secret: string, status?: string) => {
    const q = status ? `?status=${status}` : "";
    return req<Company[]>(`/admin/companies${q}`, {
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    });
  },

  adminUpdateStatus: (secret: string, id: string, status: "approved" | "rejected" | "pending") =>
    req<Company>(`/admin/companies/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    }),

  adminGetWorkers: (secret: string) =>
    req<Worker[]>("/admin/workers", {
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    }),

  // Get contacts for a worker
  getWorkerContacts: (workerId: string) => req<any[]>(`/workers/${workerId}/contacts`),
};
