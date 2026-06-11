require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("./src/models/user.model");
const Hotel = require("./src/models/hotel.model");
const Resort = require("./src/models/resort.model");
const Rental = require("./src/models/rental.model");
const Guide = require("./src/models/guide.model");
const Category = require("./src/models/category.model");
const Ad = require("./src/models/ad.model");

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  // =========================
  // 👤 OWNERS
  // =========================
  await User.deleteMany({});

  const owners = await User.create([
    {
      name: "Imam Ali Benyahia",
      email: "imam.alibenyahia@seed.com",
      password: hash("Pass@1234"),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "hotel_owner",
      approvalStatus: "approved",
      isActive: true,
      location: "Tlemcen",
    },
    {
      name: "Dr. Samira Kaci",
      email: "samira.kaci@seed.com",
      password: hash("Pass@1234"),
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      role: "resort_owner",
      approvalStatus: "approved",
      isActive: true,
      location: "Ghardaia",
    },
    {
      name: "Yacine Education Group",
      email: "yacine.edu@seed.com",
      password: hash("Pass@1234"),
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150",
      role: "rental_owner",
      approvalStatus: "approved",
      isActive: true,
      location: "Alger",
    },
    {
      name: "Prof. Abdelkader Guide",
      email: "abdelkader.guide@seed.com",
      password: hash("Pass@1234"),
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150",
      role: "guide",
      approvalStatus: "approved",
      isActive: true,
      location: "Constantine",
    },
  ]);

  const [hotelOwner, resortOwner, rentalOwner, guideOwner] = owners.map(o => o._id);

  // =========================
  // 📂 CATEGORIES (FULL YOUR DATA)
  // =========================

  // =========================
  // 📢 ADS (YOUR EXACT DATA FIXED)
  // =========================


  // =========================
  // 🏨 HOTELS (4 FULL)
  // =========================
  await Hotel.create([
    {
      owner: hotelOwner,
      titleEn: "Sidi Boumediene Spiritual Hotel",
      titleAr: "فندق سيدي بومدين الروحي",
      descEn: "Located near the historic Sufi shrine of Sidi Boumediene, offering spiritual tours and calm atmosphere.",
      descAr: "فندق بالقرب من ضريح سيدي بومدين مع أجواء روحانية هادئة.",
      wilaya: "Tlemcen",
      category: "religious",
      pricePerNight: 9500,
      roomsAvailable: 18,
      propertyClass: 4,
      images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"],
      rating: 4.7,
      reviewCount: 120,
      isActive: true,
    },
    {
      owner: hotelOwner,
      titleEn: "Emir Abdelkader University Hotel",
      titleAr: "فندق جامعة الأمير عبد القادر",
      descEn: "Hotel connected to academic complex, ideal for researchers and students.",
      descAr: "فندق داخل مجمع جامعي للباحثين والطلاب.",
      wilaya: "Constantine",
      category: "educational",
      pricePerNight: 8700,
      roomsAvailable: 25,
      propertyClass: 4,
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
      rating: 4.5,
      reviewCount: 98,
      isActive: true,
    },
    {
      owner: hotelOwner,
      titleEn: "El Qasr Islamic Heritage Hotel",
      titleAr: "فندق القصر الإسلامي التراثي",
      descEn: "Traditional Mozabite-style hotel in heritage city.",
      descAr: "فندق تقليدي في مدينة تراثية.",
      wilaya: "Ghardaia",
      category: "religious",
      pricePerNight: 8000,
      roomsAvailable: 20,
      propertyClass: 3,
      images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],
      rating: 4.6,
      reviewCount: 77,
      isActive: true,
    },
    {
      owner: hotelOwner,
      titleEn: "Medina Knowledge Hotel",
      titleAr: "فندق مدينة المعرفة",
      descEn: "Located near libraries and academic institutes in Algiers.",
      descAr: "فندق قرب المكتبات والمعاهد في الجزائر.",
      wilaya: "Alger",
      category: "educational",
      pricePerNight: 7800,
      roomsAvailable: 22,
      propertyClass: 3,
      images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"],
      rating: 4.4,
      reviewCount: 66,
      isActive: true,
    },
  ]);

  console.log("✅ FULL SEED COMPLETE");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});