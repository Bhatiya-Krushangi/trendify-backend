import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, trim: true }],
    author: { type: String, default: "Admin" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

postSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.models.Post.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

postSchema.index({ title: "text", excerpt: "text", tags: "text" });

export default mongoose.model("Post", postSchema);
