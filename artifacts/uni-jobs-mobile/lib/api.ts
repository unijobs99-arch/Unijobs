const domain = process.env.EXPO_PUBLIC_DOMAIN;
const BASE = domain ? `https://${domain}/api` : "/api";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed: ${res.status}`);
  return data as T;
}

export interface Worker {
  _id: string;
  name: string;
  fatherName: string;
  phone: string;
  aadhaar: string;
  uan: string;
  address: string;
  city: string;
  education: string;
  experience: string;
  category: string;
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

  loginWorker: (phone: string) =>
    req<Worker>(`/workers/login?phone=${encodeURIComponent(phone)}`),

  registerCompany: (body: Omit<Company, "_id" | "status" | "createdAt">) =>
    req<Company>("/companies/register", { method: "POST", body: JSON.stringify(body) }),

  getCompany: (id: string) => req<Company>(`/companies/${id}`),

  loginCompany: (email: string) =>
    req<Company>(`/companies/login?email=${encodeURIComponent(email)}`),

  searchWorkers: (companyId: string, category?: string, city?: string) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (city) q.set("city", city);
    return req<Worker[]>(`/companies/${companyId}/workers?${q}`);
  },

  getRequirements: () => req<Requirement[]>("/requirements"),

  getCompanyRequirements: (id: string) => req<Requirement[]>(`/requirements/company/${id}`),

  postRequirement: (body: Omit<Requirement, "_id" | "createdAt">) =>
    req<Requirement>("/requirements", { method: "POST", body: JSON.stringify(body) }),

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
};
