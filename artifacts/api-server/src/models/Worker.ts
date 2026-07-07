import mongoose, { Schema, Document, Types } from "mongoose";

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
  employmentStatus: "available" | "working";
  currentCompanyId?: Types.ObjectId | null;
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
    employmentStatus: {
      type: String,
      enum: ["available", "working"],
      default: "available",
    },
    currentCompanyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    currentCompanyName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

WorkerSchema.index({ city: 1, category: 1, availability: 1, employmentStatus: 1 });
WorkerSchema.index({ phone: 1 });
WorkerSchema.index({ aadhaar: 1 });

export default mongoose.model<IWorker>("Worker", WorkerSchema);
