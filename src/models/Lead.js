import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    full_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    secondaryPhone: {
      type: String,
      trim: true,
      default: "",
    },
    project: {
      type: String,
      default: "Kyra Farmlands",
      trim: true,
    },
    project_name: {
      type: String,
      default: "Kyra Farmlands",
      trim: true,
    },
    source: {
      type: String,
      default: "KYRA_GROUP_INDIA",
      trim: true,
    },
    campaign_name: {
      type: String,
      default: "Landing Page Enquiry",
      trim: true,
    },
    budget_range: {
      type: String,
      default: "₹35L - ₹50L",
      trim: true,
    },
    purpose: {
      type: String,
      default: "farmhouse",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    intent: {
      type: String,
      default: "site_visit",
    },
    visit_date: {
      type: String,
      default: null,
    },
    page_url: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "Coimbatore",
    },
    region: {
      type: String,
      default: "Tamil Nadu",
    },
    country: {
      type: String,
      default: "India",
    },
    status: {
      type: String,
      default: "new",
    },
    mailStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "leads",
  }
);

// Pre-save hook to keep name and full_name in sync
LeadSchema.pre("save", function (next) {
  if (this.name && !this.full_name) {
    this.full_name = this.name;
  } else if (this.full_name && !this.name) {
    this.name = this.full_name;
  }
  if (this.project && !this.project_name) {
    this.project_name = this.project;
  } else if (this.project_name && !this.project) {
    this.project = this.project_name;
  }
  next();
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
export default Lead;
