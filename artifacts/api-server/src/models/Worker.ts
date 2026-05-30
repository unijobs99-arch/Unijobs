import mongoose, { Schema, Document } from "mongoose";

export interface IWorker extends Document {
  name: string;
  fatherName: string;
  phone: string;
  aadhaar: string;
  uan: string;
  address: string;
  city: string;
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
}

const WorkerSchema = new Schema<IWorker>(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    aadhaar: { type: String, required: true, unique: true },
    uan: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
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
  },
  { timestamps: true },
);

export default mongoose.model<IWorker>("Worker", WorkerSchema);
