import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRequirement extends Document {
  companyId: Types.ObjectId;
  title: string;
  description: string;
  category:
    | "Picker"
    | "Scanner"
    | "Delivery"
    | "Packing"
    | "Warehouse Helper"
    | "Loader"
    | "Tagging";
  city: string;
  wage: string;
  vacancies: number;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
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
    city: { type: String, required: true },
    wage: { type: String, required: true },
    vacancies: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

RequirementSchema.index({ companyId: 1 });
RequirementSchema.index({ city: 1, category: 1 });
RequirementSchema.index({ createdAt: -1 });

export default mongoose.model<IRequirement>("Requirement", RequirementSchema);
