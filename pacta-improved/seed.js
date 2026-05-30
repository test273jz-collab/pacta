require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User     = require("./src/models/user.model");
const Hotel    = require("./src/models/hotel.model");
const Resort   = require("./src/models/resort.model");
const Rental   = require("./src/models/rental.model");
const Guide    = require("./src/models/guide.model");
const Reservation = require("./src/models/reservation.model");
const Review   = require("./src/models/review.model");

// ─── Unsplash image collections (Algeria / Mediterranean / travel themed) ────

const hotelImgs = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
];
const resortImgs = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
];
const rentalImgs = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
];
const guideImgs = [
  "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
];
const avatarImgs = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
];

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ── Wipe existing data ──────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    Resort.deleteMany({}),
    Rental.deleteMany({}),
    Guide.deleteMany({}),
    Reservation.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log("🗑  Cleared existing data");

  // ════════════════════════════════════════════════════════════════════════════
  // 1. USERS
  // ════════════════════════════════════════════════════════════════════════════

  const admin = await User.create({
    name: "Admin Pacta",
    email: "admin@pacta.dz",
    password: hash("Admin@123"),
    avatar: avatarImgs[0],
    role: "admin",
    approvalStatus: "approved",
    isActive: true,
    phone: "+213 550 000 000",
    location: "Alger, Algérie",
    bio: "Platform administrator",
  });

  // Hotel owners
  const hotelOwners = await User.create([
    {
      name: "Karim Benali",
      email: "karim.benali@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[1],
      role: "hotel_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 123 456",
      location: "Alger",
      bio: "Hôtelier passionné avec 15 ans d'expérience dans l'industrie hôtelière algérienne.",
    },
    {
      name: "Yasmine Khelil",
      email: "yasmine.khelil@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[3],
      role: "hotel_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 771 234 567",
      location: "Oran",
      bio: "Propriétaire d'hôtel boutique spécialisée dans l'accueil haut de gamme à Oran.",
    },
    {
      name: "Mourad Touati",
      email: "mourad.touati@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[2],
      role: "hotel_owner",
      approvalStatus: "pending",
      isActive: true,
      phone: "+213 550 345 678",
      location: "Constantine",
    },
  ]);

  // Resort owners
  const resortOwners = await User.create([
    {
      name: "Samir Hadj",
      email: "samir.hadj@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[6],
      role: "resort_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 456 789",
      location: "Tipaza",
      bio: "Propriétaire du complexe balnéaire Les Pins Maritimes. 20 ans dans le tourisme côtier.",
    },
    {
      name: "Nadia Bouzid",
      email: "nadia.bouzid@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[5],
      role: "resort_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 771 567 890",
      location: "Béjaïa",
      bio: "Resort manager with expertise in eco-tourism along the Kabyle coast.",
    },
  ]);

  // Rental owners
  const rentalOwners = await User.create([
    {
      name: "Rachid Meziane",
      email: "rachid.meziane@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[7],
      role: "rental_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 550 678 901",
      location: "Alger",
      bio: "Propriétaire de plusieurs appartements meublés haut de gamme à Alger.",
    },
    {
      name: "Amina Chabane",
      email: "amina.chabane@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[4],
      role: "rental_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 789 012",
      location: "Tlemcen",
      bio: "Traditional riad owner in Tlemcen — blending Andalusian heritage with modern comfort.",
    },
  ]);

  // Guides
  const guideOwners = await User.create([
    {
      name: "Tarek Oussama",
      email: "tarek.oussama@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[2],
      role: "guide",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 890 123",
      location: "Tamanrasset",
      bio: "Certified Sahara guide with 12 years exploring Tassili N'Ajjer and Hoggar Mountains.",
    },
    {
      name: "Lydia Mammeri",
      email: "lydia.mammeri@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[5],
      role: "guide",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 771 901 234",
      location: "Tizi Ouzou",
      bio: "Kabyle culture specialist and mountain trekking guide in Djurdjura National Park.",
    },
    {
      name: "Hichem Rahmani",
      email: "hichem.rahmani@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[0],
      role: "guide",
      approvalStatus: "pending",
      isActive: true,
      phone: "+213 550 012 345",
      location: "Alger",
    },
  ]);

  // Tourists
  const tourists = await User.create([
    {
      name: "Sophie Martin",
      email: "sophie.martin@gmail.com",
      password: hash("Pass@1234"),
      avatar: avatarImgs[3],
      role: "tourist",
      approvalStatus: "approved",
      isActive: true,
      phone: "+33 6 12 34 56 78",
      location: "Paris, France",
      bio: "Travel blogger & photographer exploring North Africa.",
    },
    {
      name: "Ahmed Khalil",
      email: "ahmed.khalil@gmail.com",
      password: hash("Pass@1234"),
      avatar: avatarImgs[1],
      role: "tourist",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 111 222",
      location: "Blida, Algérie",
      bio: "Passionné de voyage et de découverte du patrimoine algérien.",
    },
    {
      name: "Emma Wilson",
      email: "emma.wilson@outlook.com",
      password: hash("Pass@1234"),
      avatar: avatarImgs[4],
      role: "tourist",
      approvalStatus: "approved",
      isActive: true,
      phone: "+44 7700 900123",
      location: "London, UK",
      bio: "Backpacker discovering the Maghreb for 3 months.",
    },
    {
      name: "Youcef Bensalem",
      email: "youcef.bensalem@gmail.com",
      password: hash("Pass@1234"),
      avatar: avatarImgs[6],
      role: "tourist",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 550 333 444",
      location: "Sétif, Algérie",
    },
    {
      name: "Fatima Zahra",
      email: "fatima.zahra@gmail.com",
      password: hash("Pass@1234"),
      avatar: avatarImgs[5],
      role: "tourist",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 771 555 666",
      location: "Tlemcen, Algérie",
    },
  ]);

  console.log(`👥 Created ${1 + hotelOwners.length + resortOwners.length + rentalOwners.length + guideOwners.length + tourists.length + 1} users`);

  // ════════════════════════════════════════════════════════════════════════════
  // 2. HOTELS
  // ════════════════════════════════════════════════════════════════════════════

  const hotels = await Hotel.create([
    {
      owner: hotelOwners[0]._id,
      titleEn: "Sofitel Algiers Hamma Garden",
      titleAr: "سوفيتيل الجزائر حديقة الحامة",
      descEn: "A 5-star luxury hotel nestled beside the renowned Botanical Garden of Algiers. Featuring panoramic views of the city and Mediterranean Sea, world-class dining, a spa, rooftop pool, and elegant rooms blending modern design with Andalusian heritage.",
      descAr: "فندق فاخر من 5 نجوم بجوار الحديقة النباتية الشهيرة للجزائر. يتميز بإطلالات بانورامية على المدينة والبحر الأبيض المتوسط، ومطاعم عالمية المستوى، وسبا، وحمام سباحة على السطح.",
      wilaya: "Alger",
      category: "business",
      pricePerNight: 18500,
      roomsAvailable: 24,
      propertyClass: 5,
      images: hotelImgs,
      rating: 4.8,
      reviewCount: 142,
      isActive: true,
    },
    {
      owner: hotelOwners[0]._id,
      titleEn: "El Djazaïr Hotel (Grand Hôtel)",
      titleAr: "فندق الجزائر الكبير",
      descEn: "A historic landmark in the heart of Algiers, built in 1889. Moorish architecture, lush gardens, and impeccable service. Steps away from the famous Didouche Mourad avenue and the city's most iconic monuments.",
      descAr: "معلم تاريخي في قلب الجزائر العاصمة، بُني عام 1889. هندسة معمارية مورية، حدائق يانعة، وخدمة لا تشوبها شائبة. على بعد خطوات من شارع ديدوش مراد الشهير.",
      wilaya: "Alger",
      category: "cultural",
      pricePerNight: 12000,
      roomsAvailable: 18,
      propertyClass: 4,
      images: [hotelImgs[1], hotelImgs[3], hotelImgs[0]],
      rating: 4.5,
      reviewCount: 98,
      isActive: true,
    },
    {
      owner: hotelOwners[1]._id,
      titleEn: "Royal Hotel Oran - MGallery",
      titleAr: "رويال أوتيل وهران",
      category: "business",
      descEn: "An iconic 4-star hotel in the cultural capital of western Algeria. Magnificent colonial façade, rooftop bar overlooking the port, and a prime location near the Santa Cruz fortress and the vibrant city center.",
      descAr: "فندق أيقوني من 4 نجوم في العاصمة الثقافية لغرب الجزائر. واجهة استعمارية رائعة، بار على السطح يطل على الميناء، وموقع مميز بالقرب من قلعة سانتا كروز.",
      wilaya: "Oran",
      pricePerNight: 9500,
      roomsAvailable: 30,
      propertyClass: 4,
      images: [hotelImgs[2], hotelImgs[4], hotelImgs[1]],
      rating: 4.3,
      reviewCount: 76,
      isActive: true,
    },
    {
      owner: hotelOwners[1]._id,
      titleEn: "Renaissance Tlemcen Hotel",
      titleAr: "فندق رينيسانس تلمسان",
      descEn: "Luxury 5-star property in the city of art and history. Featuring Moroccan-Andalusian architecture, a spa, outdoor pool, and direct access to the Tlemcen National Park. Perfect base for exploring the Great Mosque and El Mechouar Palace.",
      descAr: "عقار فاخر من 5 نجوم في مدينة الفن والتاريخ. يتميز بهندسة مغربية أندلسية، وسبا، وحمام سباحة خارجي، وإمكانية الوصول المباشر إلى منتزه تلمسان الوطني.",
      wilaya: "Tlemcen",
      pricePerNight: 14000,
      roomsAvailable: 12,
      propertyClass: 5,
      images: [hotelImgs[4], hotelImgs[0], hotelImgs[2]],
      rating: 4.7,
      reviewCount: 54,
      isActive: true,
    },
    {
      owner: hotelOwners[2]._id,
      titleEn: "Constantine Marriott Hotel",
      titleAr: "فندق ماريوت قسنطينة",
      descEn: "Perched dramatically above the famous gorges of the Rhumel River, this 5-star Marriott offers breathtaking views of the City of Bridges. Modern rooms, conference facilities, and a unique vantage point over one of Africa's most spectacular urban landscapes.",
      descAr: "يقع بشكل درامي فوق أخاديد نهر الرمال الشهيرة، يقدم هذا الماريوت من 5 نجوم إطلالات خلابة على مدينة الجسور.",
      wilaya: "Constantine",
      pricePerNight: 11000,
      roomsAvailable: 20,
      propertyClass: 5,
      images: [hotelImgs[3], hotelImgs[1], hotelImgs[4]],
      rating: 4.6,
      reviewCount: 89,
      isActive: false, // pending approval
    },
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // 3. RESORTS
  // ════════════════════════════════════════════════════════════════════════════

  const resorts = await Resort.create([
    {
      owner: resortOwners[0]._id,
      titleEn: "Sheraton Club Des Pins Resort",
      titleAr: "منتجع شيراتون نادي الصنوبر",
      descEn: "Algeria's premier beach resort set among towering pine forests on the shores of the Mediterranean, just 20km west of Algiers. Private beach, multiple pools, tennis courts, water sports, kids' club, and four restaurants serving international and Algerian cuisine.",
      descAr: "المنتجع الشاطئي الأول في الجزائر، يقع وسط أشجار الصنوبر الشاهقة على شواطئ البحر الأبيض المتوسط. شاطئ خاص، مسابح متعددة، ملاعب تنس، رياضات مائية.",
      wilaya: "Alger",
      category: "leisure",
      pricePerNight: 22000,
      maxCapacity: 8,
      images: resortImgs,
      rating: 4.9,
      reviewCount: 203,
      isActive: true,
    },
    {
      owner: resortOwners[0]._id,
      titleEn: "Les Pins Maritimes Tipaza",
      titleAr: "منتجع صنوبر البحر تيبازة",
      category: "leisure",
      descEn: "A stunning seaside resort near the ancient Roman ruins of Tipaza, a UNESCO World Heritage Site. Bungalow-style accommodations with sea views, an outdoor pool, beach access, and guided tours to the archaeological site. Ideal for families and history lovers.",
      descAr: "منتجع ساحلي رائع بالقرب من أطلال تيبازة الرومانية، موقع التراث العالمي لليونسكو. إقامة على طراز البنغلو مع إطلالات على البحر، وحمام سباحة خارجي.",
      wilaya: "Tipaza",
      pricePerNight: 15000,
      maxCapacity: 6,
      images: [resortImgs[1], resortImgs[3], resortImgs[0]],
      rating: 4.6,
      reviewCount: 115,
      isActive: true,
    },
    {
      owner: resortOwners[1]._id,
      titleEn: "Zina Beach Resort & Spa — Béjaïa",
      titleAr: "منتجع وسبا زينة للشاطئ — بجاية",
      category: "leisure",
      descEn: "An eco-friendly resort nestled on the emerald waters of the Gulf of Béjaïa. Infinity pool, hammam, organic restaurant, and kayaking on crystal-clear Kabyle waters. Trekking packages to Gouraya National Park available.",
      descAr: "منتجع صديق للبيئة يقع على المياه الزمردية لخليج بجاية. مسبح لانهائي، حمام، مطعم عضوي، وتجديف على المياه الكابيلية الصافية.",
      wilaya: "Béjaïa",
      pricePerNight: 13500,
      maxCapacity: 4,
      images: [resortImgs[2], resortImgs[4], resortImgs[1]],
      rating: 4.7,
      reviewCount: 88,
      isActive: true,
    },
    {
      owner: resortOwners[1]._id,
      titleEn: "Doriane Beach & Aquapark — Annaba",
      titleAr: "منتجع دوريان الشاطئ والألعاب المائية — عنابة",
      category: "leisure",
      descEn: "A full-service aquatic resort on the famous Seraïdi coast near Annaba. Water slides, wave pool, beach volleyball, and a seafood restaurant with panoramic views of the Gulf of Annaba. Family paradise on the northeastern Algerian coast.",
      descAr: "منتجع مائي متكامل الخدمات على ساحل الصرايدي الشهير قرب عنابة. زلاجات مائية، بركة أمواج، كرة طائرة شاطئية، ومطعم مأكولات بحرية.",
      wilaya: "Annaba",
      pricePerNight: 11000,
      maxCapacity: 10,
      images: [resortImgs[3], resortImgs[0], resortImgs[2]],
      rating: 4.4,
      reviewCount: 67,
      isActive: true,
    },
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // 4. RENTALS
  // ════════════════════════════════════════════════════════════════════════════

  const rentals = await Rental.create([
    {
      owner: rentalOwners[0]._id,
      titleEn: "Luxury Penthouse — Hydra, Algiers",
      titleAr: "شقة بنتهاوس فاخرة — حيدرة، الجزائر",
      category: "business",
      descEn: "Stunning 3-bedroom penthouse in the prestigious Hydra neighborhood of Algiers. Sweeping views of the Bay of Algiers from a private terrace. Fully equipped modern kitchen, designer furniture, fiber internet, underground parking. Walking distance to embassies and top restaurants.",
      descAr: "شقة بنتهاوس مذهلة من 3 غرف نوم في حي حيدرة الراقي بالجزائر. إطلالات بانورامية على خليج الجزائر من شرفة خاصة. مطبخ حديث مجهز بالكامل، أثاث مصمم.",
      wilaya: "Alger",
      pricePerNight: 8500,
      structure: { type: "apartment", roomsCount: 3, bedsCount: 4, bathroomsCount: 2, maxGuests: 6 },
      images: rentalImgs,
      rating: 4.9,
      reviewCount: 37,
      isActive: true,
    },
    {
      owner: rentalOwners[0]._id,
      titleEn: "Sea-View Studio — Sidi Fredj Marina",
      category: "leisure",
      titleAr: "استوديو بإطلالة بحرية — مارينا سيدي فرج",
      descEn: "A cozy studio apartment at the Sidi Fredj Marina complex, 30 minutes west of Algiers. Direct sea view, private balcony, fully equipped kitchenette, free parking. Ideal for couples or solo travelers seeking tranquility near the water.",
      descAr: "شقة استوديو مريحة في مجمع مارينا سيدي فرج، 30 دقيقة غرب الجزائر. إطلالة مباشرة على البحر، شرفة خاصة، مطبخ صغير مجهز بالكامل.",
      wilaya: "Alger",
      pricePerNight: 4500,
      structure: { type: "studio", roomsCount: 1, bedsCount: 1, bathroomsCount: 1, maxGuests: 2 },
      images: [rentalImgs[1], rentalImgs[3], rentalImgs[0]],
      rating: 4.6,
      reviewCount: 52,
      isActive: true,
    },
    {
      owner: rentalOwners[1]._id,
      titleEn: "Traditional Riad — Old Medina, Tlemcen",
      titleAr: "رياض تقليدي — المدينة القديمة، تلمسان",
      category: "cultural",
      descEn: "An authentically restored Andalusian riad in the heart of Tlemcen's ancient medina. Mosaic tiled courtyard, carved cedarwood ceilings, 4 en-suite rooms, and a rooftop terrace with views of the Grand Mosque minaret. A rare living heritage experience.",
      descAr: "رياض أندلسي مُرمَّم بأصالة في قلب المدينة القديمة بتلمسان. فناء مبلط بالفسيفساء، أسقف خشب الأرز المنحوتة، 4 غرف مع حمامات خاصة.",
      wilaya: "Tlemcen",
      pricePerNight: 7000,
      structure: { type: "villa", roomsCount: 4, bedsCount: 4, bathroomsCount: 4, maxGuests: 8 },
      images: [rentalImgs[2], rentalImgs[4], rentalImgs[1]],
      rating: 4.8,
      reviewCount: 44,
      isActive: true,
    },
    {
      owner: rentalOwners[1]._id,
      titleEn: "Modern Villa — Oran Seaside",
      titleAr: "فيلا عصرية — ساحل وهران",
      descEn: "Spacious 5-bedroom villa with private pool and direct beach access on the outskirts of Oran. Fully equipped smart home, BBQ terrace, outdoor dining area, and secure gated garden. Perfect for large family gatherings or friend groups.",
      descAr: "فيلا واسعة من 5 غرف نوم مع مسبح خاص وإمكانية الوصول المباشر إلى الشاطئ على أطراف وهران. منزل ذكي مجهز بالكامل، شرفة للشواء.",
      wilaya: "Oran",
      pricePerNight: 12000,
      structure: { type: "villa", roomsCount: 5, bedsCount: 6, bathroomsCount: 3, maxGuests: 12 },
      images: [rentalImgs[4], rentalImgs[2], rentalImgs[0]],
      rating: 4.7,
      reviewCount: 29,
      isActive: true,
    },
    {
      owner: rentalOwners[0]._id,
      titleEn: "Mountain Chalet — Chrea National Park",
      titleAr: "شاليه جبلي — منتزه شريعة الوطني",
      descEn: "A charming alpine chalet in the cedar forests of Chrea, 1,500m altitude in the Blida Atlas. Wood-burning fireplace, outdoor hot tub with mountain views, ski access in winter, hiking trails in summer. Sleeps 6.",
      descAr: "شاليه جبلي ساحر في غابات أرز شريعة، على ارتفاع 1500 متر في أطلس البليدة. مدفأة خشبية، جاكوزي خارجي بإطلالة على الجبال، وصول لمسارات التزلج شتاءً.",
      wilaya: "Blida",
      pricePerNight: 6500,
      structure: { type: "chalet", roomsCount: 3, bedsCount: 3, bathroomsCount: 2, maxGuests: 6 },
      images: [rentalImgs[0], rentalImgs[3], rentalImgs[2]],
      rating: 4.9,
      reviewCount: 61,
      isActive: true,
    },
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // 5. GUIDES
  // ════════════════════════════════════════════════════════════════════════════

  const guides = await Guide.create([
    {
      owner: guideOwners[0]._id,
      nameEn: "Tarek — Sahara & Hoggar Expert",
      nameAr: "طارق — خبير الصحراء والهقار",
      expertiseEn: "Certified desert guide with 12 years navigating Tassili N'Ajjer (UNESCO), Hoggar Mountains, and Ahaggar National Park. Specializes in camel treks, 4WD expeditions, rock art tours, and Tuareg cultural immersion experiences.",
      expertiseAr: "مرشد صحراوي معتمد بخبرة 12 عامًا في استكشاف تاسيلي ناجر (يونسكو)، جبال الهقار، والمنتزه الوطني للأهقار. متخصص في رحلات الجمال والرحلات الثقافية الطوارقية.",
      wilaya: "Tamanrasset",
      pricePerDay: 8500,
      maxGroupSize: 8,
      languagesSpoken: ["ar", "fr", "en", "Tamasheq"],
      specializations: ["Sahara trekking", "Rock art", "Tuareg culture", "Camel expeditions", "4WD tours"],
      images: guideImgs,
      rating: 5.0,
      reviewCount: 94,
      isActive: true,
    },
    {
      owner: guideOwners[1]._id,
      nameEn: "Lydia — Kabyle Mountains & Culture",
      nameAr: "ليديا — جبال القبائل والثقافة الأمازيغية",
      expertiseEn: "Native Kabyle guide and cultural anthropologist. Leads authentic village stays, Djurdjura National Park treks (2,308m peak), traditional Amazigh craft workshops, olive harvest experiences, and Berber culinary tours in the heart of Greater Kabylie.",
      expertiseAr: "مرشدة كابيلية أصيلة وعالمة أنثروبولوجيا ثقافية. تقود إقامات قروية أصيلة، ورحلات في منتزه جرجرة الوطني، وورش الحرف الأمازيغية التقليدية.",
      wilaya: "Tizi Ouzou",
      pricePerDay: 5500,
      maxGroupSize: 6,
      languagesSpoken: ["ar", "fr", "en", "Tamazight"],
      specializations: ["Mountain trekking", "Amazigh culture", "Village tours", "Culinary tours", "Craft workshops"],
      images: [guideImgs[1], guideImgs[3], guideImgs[0]],
      rating: 4.9,
      reviewCount: 72,
      isActive: true,
    },
    {
      owner: guideOwners[2]._id,
      nameEn: "Hichem — Algiers History & Casbah",
      nameAr: "هشام — تاريخ الجزائر والقصبة",
      expertiseEn: "Algiers-born historian and licensed city guide. Specializes in the UNESCO-listed Kasbah of Algiers, Ottoman palaces, colonial architecture, street art, and local food markets. Half-day and full-day tours available. Evening sunset tours from Notre Dame d'Afrique.",
      expertiseAr: "مؤرخ من الجزائر ومرشد مدني مرخص. متخصص في قصبة الجزائر المدرجة على قائمة اليونسكو، القصور العثمانية، والعمارة الاستعمارية.",
      wilaya: "Alger",
      pricePerDay: 4000,
      maxGroupSize: 12,
      languagesSpoken: ["ar", "fr", "en"],
      specializations: ["Casbah tours", "Ottoman history", "Street food", "Colonial architecture", "Photography tours"],
      images: [guideImgs[2], guideImgs[4], guideImgs[1]],
      rating: 4.7,
      reviewCount: 48,
      isActive: false, // pending
    },
  ]);

  console.log(`🏨 Created ${hotels.length} hotels`);
  console.log(`🌴 Created ${resorts.length} resorts`);
  console.log(`🏠 Created ${rentals.length} rentals`);
  console.log(`🗺  Created ${guides.length} guides`);

  // ════════════════════════════════════════════════════════════════════════════
  // 6. RESERVATIONS
  // ════════════════════════════════════════════════════════════════════════════

  const past   = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };
  const future = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt; };

  const reservations = await Reservation.create([
    // Completed reservations (tourists will review these)
    {
      tourist: tourists[0]._id,
      provider: hotelOwners[0]._id,
      listingId: hotels[0]._id,
      listingModel: "Hotel",
      status: "completed",
      startDate: past(30),
      endDate: past(25),
      totalPrice: 92500,
      guestCount: 2,
      specialRequests: "Late check-in please, arriving after midnight.",
      paymentStatus: "paid",
    },
    {
      tourist: tourists[1]._id,
      provider: resortOwners[0]._id,
      listingId: resorts[0]._id,
      listingModel: "Resort",
      status: "completed",
      startDate: past(20),
      endDate: past(16),
      totalPrice: 88000,
      guestCount: 4,
      paymentStatus: "paid",
    },
    {
      tourist: tourists[2]._id,
      provider: rentalOwners[1]._id,
      listingId: rentals[2]._id,
      listingModel: "Rental",
      status: "completed",
      startDate: past(15),
      endDate: past(10),
      totalPrice: 35000,
      guestCount: 3,
      specialRequests: "We'd love a traditional welcome with mint tea if possible!",
      paymentStatus: "paid",
    },
    {
      tourist: tourists[3]._id,
      provider: guideOwners[0]._id,
      listingId: guides[0]._id,
      listingModel: "Guide",
      status: "completed",
      startDate: past(10),
      endDate: past(7),
      totalPrice: 25500,
      guestCount: 2,
      paymentStatus: "paid",
    },
    // Confirmed (upcoming)
    {
      tourist: tourists[0]._id,
      provider: resortOwners[1]._id,
      listingId: resorts[2]._id,
      listingModel: "Resort",
      status: "confirmed",
      startDate: future(5),
      endDate: future(10),
      totalPrice: 67500,
      guestCount: 2,
      paymentStatus: "paid",
    },
    {
      tourist: tourists[4]._id,
      provider: rentalOwners[0]._id,
      listingId: rentals[0]._id,
      listingModel: "Rental",
      status: "confirmed",
      startDate: future(3),
      endDate: future(7),
      totalPrice: 34000,
      guestCount: 4,
      paymentStatus: "paid",
    },
    // Pending
    {
      tourist: tourists[1]._id,
      provider: hotelOwners[1]._id,
      listingId: hotels[2]._id,
      listingModel: "Hotel",
      status: "pending",
      startDate: future(10),
      endDate: future(14),
      totalPrice: 38000,
      guestCount: 2,
      paymentStatus: "pending",
    },
    {
      tourist: tourists[2]._id,
      provider: guideOwners[1]._id,
      listingId: guides[1]._id,
      listingModel: "Guide",
      status: "pending",
      startDate: future(7),
      endDate: future(9),
      totalPrice: 11000,
      guestCount: 1,
      paymentStatus: "pending",
    },
    // Cancelled
    {
      tourist: tourists[3]._id,
      provider: rentalOwners[0]._id,
      listingId: rentals[4]._id,
      listingModel: "Rental",
      status: "cancelled",
      startDate: past(5),
      endDate: past(2),
      totalPrice: 19500,
      guestCount: 3,
      paymentStatus: "refunded",
    },
  ]);

  console.log(`📅 Created ${reservations.length} reservations`);

  // ════════════════════════════════════════════════════════════════════════════
  // 7. REVIEWS  (only for completed reservations)
  // ════════════════════════════════════════════════════════════════════════════

  const reviewMedia = [
    { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600", type: "image" },
    { url: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600", type: "image" },
    { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600", type: "image" },
  ];

  await Review.create([
    {
      tourist: tourists[0]._id,
      reservation: reservations[0]._id,
      listingId: hotels[0]._id,
      listingModel: "Hotel",
      rating: 5,
      comment: "Absolutely breathtaking experience! The Sofitel Algiers exceeded every expectation. The views from our room over the Botanical Garden were magical. Staff were incredibly warm and professional. The spa is world-class and the rooftop pool at sunset is something I'll never forget. Will definitely return!",
      media: [reviewMedia[0]],
      isApproved: true,
      isVerifiedTrip: true,
      helpfulCount: 23,
    },
    {
      tourist: tourists[1]._id,
      reservation: reservations[1]._id,
      listingId: resorts[0]._id,
      listingModel: "Resort",
      rating: 5,
      comment: "منتجع شيراتون نادي الصنوبر هو ببساطة الأفضل في الجزائر! أمضينا 4 أيام رائعة. الشاطئ الخاص نظيف ومريح، والمسبح الرئيسي مذهل. الطعام في مطعم البحر لا يوصف، خاصة طبق الجمبري المشوي. فريق العمل ودود للغاية وسريع الاستجابة. تجربة لا تُنسى لكل العائلة!",
      media: [reviewMedia[1], reviewMedia[2]],
      isApproved: true,
      isVerifiedTrip: true,
      helpfulCount: 17,
    },
    {
      tourist: tourists[2]._id,
      reservation: reservations[2]._id,
      listingId: rentals[2]._id,
      listingModel: "Rental",
      rating: 5,
      comment: "The Tlemcen Riad was a once-in-a-lifetime experience. Waking up to the sound of the adhan from the Grand Mosque minaret, sipping mint tea in the mosaic courtyard, the carved cedar ceilings... It felt like sleeping inside a work of art. Amina was an incredible host — she arranged a private cooking class and a guided tour of the medina. Highly recommended for anyone who wants to experience authentic Algerian heritage.",
      media: [reviewMedia[0], reviewMedia[2]],
      isApproved: true,
      isVerifiedTrip: true,
      helpfulCount: 31,
    },
    {
      tourist: tourists[3]._id,
      reservation: reservations[3]._id,
      listingId: guides[0]._id,
      listingModel: "Guide",
      rating: 5,
      comment: "طارق مرشد استثنائي بكل معنى الكلمة! رحلة 3 أيام في تاسيلي ناجر كانت من أجمل تجارب حياتي. معرفته بالفن الصخري الآلاف السنين والثقافة الطوارقية عميقة ومذهلة. تنظيم مثالي، معدات عالية الجودة، وطبخ صحراوي رائع حول النار. يستحق كل دينار وأكثر. أنصح به بشدة لكل من يريد اكتشاف الصحراء الجزائرية!",
      isApproved: true,
      isVerifiedTrip: true,
      helpfulCount: 42,
    },
  ]);

  console.log("⭐ Created 4 reviews");

  // ════════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n═══════════════════════════════════════════");
  console.log("✅  SEED COMPLETE — Login credentials:");
  console.log("═══════════════════════════════════════════");
  console.log("👑 Admin        → admin@pacta.dz          / Admin@123");
  console.log("🏨 Hotel owner  → karim.benali@pacta.dz   / Pass@1234");
  console.log("🏨 Hotel owner  → yasmine.khelil@pacta.dz / Pass@1234");
  console.log("🌴 Resort owner → samir.hadj@pacta.dz     / Pass@1234");
  console.log("🏠 Rental owner → rachid.meziane@pacta.dz / Pass@1234");
  console.log("🏠 Rental owner → amina.chabane@pacta.dz  / Pass@1234");
  console.log("🗺  Guide        → tarek.oussama@pacta.dz  / Pass@1234");
  console.log("🗺  Guide        → lydia.mammeri@pacta.dz  / Pass@1234");
  console.log("✈️  Tourist      → sophie.martin@gmail.com / Pass@1234");
  console.log("✈️  Tourist      → ahmed.khalil@gmail.com  / Pass@1234");
  console.log("═══════════════════════════════════════════\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
})