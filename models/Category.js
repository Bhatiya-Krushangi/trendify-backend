import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Globe" }, // lucide-react icon name
    color: { type: String, default: "#4f46e5" },
    image: { type: String, default: "" },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Category", categorySchema);
