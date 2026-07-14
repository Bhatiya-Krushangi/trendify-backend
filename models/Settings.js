import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "NexTrendX" },
    tagline: { type: String, default: "Your trusted source for breaking news, in-depth analysis, and trending stories from around the world." },
    logoText: { type: String, default: "NexTrendX" },
    contactEmail: { type: String, default: "nextrendx.contact@gmail.com" },
    adsenseClientId: { type: String, default: "" }, // e.g. ca-pub-XXXXXXXXXXXXXXXX
    adsenseEnabled: { type: Boolean, default: false },
    adSlots: {
      leaderboardTop: { type: String, default: "" },
      leaderboardMid: { type: String, default: "" },
      rectangle: { type: String, default: "" },
      skyscraper: { type: String, default: "" },
    },
    social: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
