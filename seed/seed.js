import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import Settings from "../models/Settings.js";

dotenv.config();

const categories = [
  { name: "World", icon: "Globe", color: "#4f46e5" },
  { name: "Business", icon: "Briefcase", color: "#0891b2" },
  { name: "Sports", icon: "Trophy", color: "#16a34a" },
  { name: "Entertainment", icon: "Clapperboard", color: "#db2777" },
  { name: "Lifestyle", icon: "Heart", color: "#ea580c" },
  { name: "Health", icon: "HeartPulse", color: "#dc2626" },
  { name: "Travel", icon: "Plane", color: "#0d9488" },
];

const run = async () => {
  await connectDB();

  // Admin
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@trendpluse.com").toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({
      name: "Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log("Admin already exists, skipping");
  }

  // Settings
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({});
    console.log("Default settings created");
  }

  // Categories
  const catDocs = {};
  for (const c of categories) {
    let doc = await Category.findOne({ name: c.name });
    if (!doc) doc = await Category.create(c);
    catDocs[c.name] = doc;
  }
  console.log("Categories ready");

  // Sample posts (only if none exist)
  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    const samplePosts = [
      {
        title: "Global Leaders Meet to Discuss Climate Change and Sustainable Future",
        excerpt: "World leaders gathered today to discuss urgent climate action plans and sustainable development goals for 2030.",
        content: "<p>World leaders gathered today to discuss urgent climate action plans and sustainable development goals for 2030. The summit, hosted in Geneva, brought together delegates from over 150 nations to negotiate binding emissions targets.</p><p>Discussions centered on renewable energy financing for developing nations, carbon pricing mechanisms, and a unified timeline for phasing out fossil fuel subsidies.</p>",
        category: catDocs["World"]._id,
        featured: true,
        coverImage: "",
        tags: ["climate", "summit", "policy"],
      },
      {
        title: "Stock Markets Surge as Inflation Cools Down",
        excerpt: "Major indices rallied today after new data showed inflation easing faster than economists expected.",
        content: "<p>Major indices rallied today after new data showed inflation easing faster than economists expected. Analysts point to cooling energy prices and stabilized supply chains as key drivers.</p>",
        category: catDocs["Business"]._id,
        tags: ["markets", "inflation", "economy"],
      },
      {
        title: "Local Team Wins Championship After Thrilling Final",
        excerpt: "A last-minute goal secured the title in one of the most dramatic finals in recent memory.",
        content: "<p>A last-minute goal secured the title in one of the most dramatic finals in recent memory, sending fans into celebration across the city.</p>",
        category: catDocs["Sports"]._id,
        tags: ["championship", "final"],
      },
      {
        title: "New Movie Breaks Box Office Records Worldwide",
        excerpt: "The latest blockbuster shattered opening weekend records across multiple international markets.",
        content: "<p>The latest blockbuster shattered opening weekend records across multiple international markets, cementing its place as one of the year's biggest releases.</p>",
        category: catDocs["Entertainment"]._id,
        tags: ["movies", "box office"],
      },
      {
        title: "New Study Reveals Benefits of Daily Walking",
        excerpt: "Researchers found that just 30 minutes of walking a day can significantly improve cardiovascular health.",
        content: "<p>Researchers found that just 30 minutes of walking a day can significantly improve cardiovascular health and reduce stress markers, according to a new peer-reviewed study.</p>",
        category: catDocs["Health"]._id,
        tags: ["health", "wellness"],
      },
      {
        title: "Peace Talks Resume Between Neighboring Countries",
        excerpt: "Diplomatic negotiations resumed this week after months of stalled dialogue.",
        content: "<p>Diplomatic negotiations resumed this week after months of stalled dialogue, with both sides expressing cautious optimism about reaching a lasting agreement.</p>",
        category: catDocs["World"]._id,
        tags: ["diplomacy", "peace"],
      },
      {
        title: "Oil Prices Drop as Global Supply Increases",
        excerpt: "Crude oil prices fell sharply this week following an increase in production from major exporters.",
        content: "<p>Crude oil prices fell sharply this week following an increase in production from major exporters, easing concerns about global energy costs.</p>",
        category: catDocs["Business"]._id,
        tags: ["oil", "energy"],
      },
      {
        title: "Star Player Set to Return After Injury Break",
        excerpt: "The star forward is expected to be back on the field this weekend after recovering from injury.",
        content: "<p>The star forward is expected to be back on the field this weekend after recovering from a hamstring injury sustained last month.</p>",
        category: catDocs["Sports"]._id,
        tags: ["football", "injury"],
      },
      {
        title: "Top 10 Travel Destinations for This Year",
        excerpt: "From hidden mountain towns to coastal getaways, here are the destinations travelers are flocking to.",
        content: "<p>From hidden mountain towns to coastal getaways, here are the destinations travelers are flocking to this year, according to booking data from major travel platforms.</p>",
        category: catDocs["Travel"]._id,
        tags: ["travel", "destinations"],
      },
    ];

    for (const p of samplePosts) {
      await Post.create(p);
    }
    console.log(`${samplePosts.length} sample posts created`);
  } else {
    console.log("Posts already exist, skipping sample data");
  }

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
