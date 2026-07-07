import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompanyContact extends Document {
  workerId: Types.ObjectId;
  companyId: Types.ObjectId;
  companyName: string;
  job: string;
  location: string;
  phone: string;
}

const CompanyContactSchema = new Schema<ICompanyContact>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    companyName: { type: String, required: true },
    job: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true },
);

CompanyContactSchema.index({ workerId: 1, companyId: 1 }, { unique: true });
CompanyContactSchema.index({ createdAt: -1 });

export default mongoose.model<ICompanyContact>("CompanyContact", CompanyContactSchema);
