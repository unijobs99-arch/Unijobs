import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  domain: string;
  password: string;
  status: "pending" | "approved" | "rejected";
}

const CompanySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    domain: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

CompanySchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    return ret;
  },
});

CompanySchema.index({ status: 1 });
CompanySchema.index({ email: 1 });
CompanySchema.index({ phone: 1 });

export default mongoose.model<ICompany>("Company", CompanySchema);