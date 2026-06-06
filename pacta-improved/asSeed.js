// Run with:  node seed/categories.js
require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("./src/models/category.model");

const categories = [

  {
    slug: "religious",
    labelEn: "Religious Tourism",
    labelAr: "سياحة دينية",
    descEn: "Mosques, zawiyas, and sacred pilgrimage routes — Algeria is home to some of the Maghreb's most revered spiritual sites.",
    descAr: "مساجد وزوايا ومسارات حج مقدسة — الجزائر موطن لبعض أقدس المواقع الروحية في المغرب العربي.",
    iconName: "Moon",
    countString: "95+",
    bgClass: "bg-emerald-50 text-emerald-600",
    // Emir Abdelkader Mosque minaret in Constantine, Algeria ✅ actual Algeria photo
    // pexels.com/photo/minaret-tower-of-emir-abdelkader-mosque-in-constantine-in-algeria-24964989/
    image: "https://images.pexels.com/photos/24964989/pexels-photo-24964989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    displayOrder: 5,
    isActive: true,
  },

  // ── 6. سياحة تعليمية ──────────────────────────────
  {
    slug: "educational",
    labelEn: "Educational Tourism",
    labelAr: "سياحة تعليمية",
    descEn: "Language schools, research expeditions, and university exchange programs — come to learn, leave transformed.",
    descAr: "مدارس لغات ورحلات بحثية وبرامج تبادل جامعي — تعال لتتعلم وتغادر وقد نلت تجربة لا تُنسى.",
    iconName: "GraduationCap",
    countString: "45+",
    bgClass: "bg-purple-50 text-purple-600",
    // Diverse students engaged in university lecture hall
    // pexels.com/photo/students-sitting-inside-a-classroom-8199141/
    image: "https://images.pexels.com/photos/8199141/pexels-photo-8199141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    displayOrder: 6,
    isActive: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Category.insertMany(categories);
  console.log(`✅  ${categories.length} categories seeded successfully`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });