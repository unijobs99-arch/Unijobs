import mongoose, { Schema, Document } from "mongoose";

export interface IWorker extends Document {
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
  category:
    | "Picker"
    | "Scanner"
    | "Delivery"
    | "Packing"
    | "Warehouse Helper"
    | "Loader"
    | "Tagging";
  availability: "available" | "notAvailable";
  // Employment status tracking (optional)
  employmentStatus?: "available" | "working";
  currentCompanyId?: string | null;
  currentCompanyName?: string | null;
}

const WorkerSchema = new Schema<IWorker>(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    aadhaar: { type: String, required: true, unique: true },
    uan: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Picker",
        "Scanner",
        "Delivery",
        "Packing",
        "Warehouse Helper",
        "Loader",
        "Tagging",
      ],
    },
    availability: {
      type: String,
      enum: ["available", "notAvailable"],
      default: "available",
    },
    // Track whether a worker is currently employed by a company
    employmentStatus: {
      type: String,
      enum: ["available", "working"],
      default: "available",
    },
    // If employed, optionally reference the company (stored as string id)
    currentCompanyId: {
      type: String,
      default: null,
    },
    currentCompanyName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

WorkerSchema.index({ city: 1, category: 1, availability: 1 });
WorkerSchema.index({ phone: 1 });
WorkerSchema.index({ aadhaar: 1 });

export default mongoose.model<IWorker>("Worker", WorkerSchema);
