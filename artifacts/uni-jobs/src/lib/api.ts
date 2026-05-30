const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  registerWorker: (body: object) =>
    request("/workers/register", { method: "POST", body: JSON.stringify(body) }),

  getWorker: (id: string) => request(`/workers/${id}`),

  updateWorker: (id: string, body: object) =>
    request(`/workers/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  registerCompany: (body: object) =>
    request("/companies/register", { method: "POST", body: JSON.stringify(body) }),

  getCompany: (id: string) => request(`/companies/${id}`),

  getCompanyWorkers: (id: string, params?: { category?: string; city?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.city) q.set("city", params.city);
    return request(`/companies/${id}/workers?${q.toString()}`);
  },

  getRequirements: () => request("/requirements"),

  getCompanyRequirements: (id: string) => request(`/requirements/company/${id}`),

  postRequirement: (body: object) =>
    request("/requirements", { method: "POST", body: JSON.stringify(body) }),

  adminLogin: (secret: string) =>
    request("/admin/login", { method: "POST", body: JSON.stringify({ secret }) }),

  adminGetCompanies: (secret: string, status?: string) => {
    const q = status ? `?status=${status}` : "";
    return request(`/admin/companies${q}`, {
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    });
  },

  adminUpdateCompanyStatus: (secret: string, id: string, status: string) =>
    request(`/admin/companies/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    }),

  adminGetWorkers: (secret: string) =>
    request("/admin/workers", {
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    }),

  loginWorker: (phone: string) => request(`/workers/login?phone=${phone}`),

  loginCompany: (email: string) => request(`/companies/login?email=${email}`),
};
