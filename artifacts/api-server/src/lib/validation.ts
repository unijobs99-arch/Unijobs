import { z } from "zod";

export const WorkerRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  fatherName: z.string().min(1, "Father's name is required").min(2, "Father's name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  uan: z.string().min(1, "UAN is required"),
  address: z.string().min(1, "Address is required").min(3, "Address must be at least 3 characters"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  education: z.string().min(1, "Education is required"),
  experience: z.string().min(1, "Experience is required"),
  category: z.enum([
    "Picker",
    "Scanner",
    "Delivery",
    "Packing",
    "Warehouse Helper",
    "Loader",
    "Tagging",
  ]),
});

export const CompanyRegisterSchema = z.object({
  companyName: z.string().min(1, "Company name is required").min(2, "Company name must be at least 2 characters"),
  ownerName: z.string().min(1, "Owner name is required").min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
});

export const RequirementSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  description: z.string().optional().default(""),
  category: z.enum([
    "Picker",
    "Scanner",
    "Delivery",
    "Packing",
    "Warehouse Helper",
    "Loader",
    "Tagging",
  ]),
  city: z.string().min(1, "City is required"),
  vacancies: z.number().int().min(1, "Vacancies must be at least 1"),
});

export const UpdateWorkerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters").optional(),
  address: z.string().min(3, "Address must be at least 3 characters").optional(),
  state: z.string().min(1, "State is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  area: z.string().min(1, "Area is required").optional(),
  education: z.string().min(1, "Education is required").optional(),
  experience: z.string().min(1, "Experience is required").optional(),
  category: z.enum([
    "Picker",
    "Scanner",
    "Delivery",
    "Packing",
    "Warehouse Helper",
    "Loader",
    "Tagging",
  ]).optional(),
}).strict().readonly();

export const EmploymentUpdateSchema = z.object({
  employmentStatus: z.enum(["available", "working"]),
  companyId: z.string().nullable(),
  companyName: z.string().nullable(),
});

export const AvailabilitySchema = z.object({
  availability: z.enum(["available", "notAvailable"]),
});

export type WorkerRegister = z.infer<typeof WorkerRegisterSchema>;
export type CompanyRegister = z.infer<typeof CompanyRegisterSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;
export type UpdateWorker = z.infer<typeof UpdateWorkerSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
