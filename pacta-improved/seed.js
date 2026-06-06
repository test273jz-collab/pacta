require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User        = require("./src/models/user.model");
const Hotel       = require("./src/models/hotel.model");
const Resort      = require("./src/models/resort.model");
const Rental      = require("./src/models/rental.model");
const Guide       = require("./src/models/guide.model");
const Reservation = require("./src/models/reservation.model");
const Review      = require("./src/models/review.model");

// ─── Image pools ─────────────────────────────────────────────────────────────
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

  // ══════════════════════════════════════════════════════════════════════════
  // 1. USERS
  // ══════════════════════════════════════════════════════════════════════════

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

  // ── Hotel owners (5 hotels need owners) ──────────────────────────────────
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
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 550 345 678",
      location: "Constantine",
      bio: "Gestionnaire d'hôtels haut de gamme dans l'est algérien depuis plus de 10 ans.",
    },
    {
      name: "Fares Mansouri",
      email: "fares.mansouri@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[6],
      role: "hotel_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 456 111",
      location: "Annaba",
      bio: "Entrepreneur hôtelier spécialisé dans le tourisme côtier de l'est algérien.",
    },
    {
      name: "Dalila Oukaci",
      email: "dalila.oukaci@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[5],
      role: "hotel_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 770 789 333",
      location: "Ghardaïa",
      bio: "Pionnière de l'hôtellerie saharienne dans la vallée du M'zab.",
    },
  ]);

  // ── Resort owners ─────────────────────────────────────────────────────────
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
    {
      name: "Bilal Chergui",
      email: "bilal.chergui@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[7],
      role: "resort_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 550 111 222",
      location: "Skikda",
      bio: "Gérant de complexe thermal et wellness dans le nord-est algérien.",
    },
    {
      name: "Samira Belkacem",
      email: "samira.belkacem@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[4],
      role: "resort_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 333 444",
      location: "Tlemcen",
      bio: "Spécialiste du tourisme religieux et culturel dans la région de Tlemcen.",
    },
    {
      name: "Omar Belhadj",
      email: "omar.belhadj@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[2],
      role: "resort_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 770 555 666",
      location: "Tamanrasset",
      bio: "Opérateur de camps sahariens de luxe dans l'Ahaggar et le Tassili.",
    },
  ]);

  // ── Rental owners ─────────────────────────────────────────────────────────
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
    {
      name: "Hamza Berkouk",
      email: "hamza.berkouk@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[1],
      role: "rental_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 770 222 333",
      location: "Sétif",
      bio: "Propriétaire immobilier spécialisé dans les locations proches des universités et sites historiques.",
    },
    {
      name: "Souad Hadjadj",
      email: "souad.hadjadj@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[3],
      role: "rental_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 444 555",
      location: "Ouargla",
      bio: "Gérante de maisons d'hôtes dans les oasis du Sahara septentrional.",
    },
    {
      name: "Mehdi Boukabous",
      email: "mehdi.boukabous@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[6],
      role: "rental_owner",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 550 777 888",
      location: "Jijel",
      bio: "Propriétaire de villas de standing sur la côte jijelienne.",
    },
  ]);

  // ── Guides ────────────────────────────────────────────────────────────────
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
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 550 012 345",
      location: "Alger",
      bio: "Licensed city guide specializing in the Casbah, Ottoman heritage and colonial Algiers.",
    },
    {
      name: "Siham Guerroudj",
      email: "siham.guerroudj@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[4],
      role: "guide",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 770 345 678",
      location: "Tlemcen",
      bio: "Expert en tourisme religieux et islamique dans la région de Tlemcen et l'ouest algérien.",
    },
    {
      name: "Nassim Djoudi",
      email: "nassim.djoudi@pacta.dz",
      password: hash("Pass@1234"),
      avatar: avatarImgs[7],
      role: "guide",
      approvalStatus: "approved",
      isActive: true,
      phone: "+213 661 567 890",
      location: "Sétif",
      bio: "Archaeologist and heritage guide specialising in Roman ruins at Djemila and Timgad.",
    },
  ]);

  // ── Tourists ──────────────────────────────────────────────────────────────
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

  console.log(`👥 Created ${1 + hotelOwners.length + resortOwners.length + rentalOwners.length + guideOwners.length + tourists.length} users`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. HOTELS  (5 — all 6 categories covered)
  // ══════════════════════════════════════════════════════════════════════════

  const hotels = await Hotel.create([

    // 1. business ─────────────────────────────────────────────────────────
    {
      owner: hotelOwners[0]._id,
      titleEn: "Sofitel Algiers Hamma Garden",
      titleAr: "سوفيتيل الجزائر حديقة الحامة",
      descEn: "A 5-star luxury hotel beside the Botanical Garden of Algiers. Panoramic views of the Mediterranean, world-class dining, a full spa, rooftop pool, and 12 state-of-the-art conference rooms. The definitive choice for business travellers and high-profile events in the capital.",
      descAr: "فندق فاخر من 5 نجوم بجوار الحديقة النباتية للجزائر. إطلالات بانورامية على البحر الأبيض المتوسط، مطاعم عالمية، سبا متكامل، مسبح على السطح، و12 قاعة مؤتمرات مجهزة. الخيار الأمثل لرجال الأعمال.",
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

    // 2. cultural ─────────────────────────────────────────────────────────
    {
      owner: hotelOwners[0]._id,
      titleEn: "El Djazaïr Hotel — Grand Hôtel",
      titleAr: "فندق الجزائر الكبير",
      descEn: "A historic landmark in the heart of Algiers, built in 1889. Moorish architecture, lush gardens, and impeccable service. Steps from Didouche Mourad avenue and the city's iconic monuments. Guided Casbah tours depart daily from the lobby.",
      descAr: "معلم تاريخي في قلب الجزائر العاصمة، بُني عام 1889. هندسة معمارية مورية، حدائق يانعة، وخدمة لا تشوبها شائبة. على بعد خطوات من شارع ديدوش مراد وأبرز المعالم الأثرية. جولات يومية إلى القصبة تنطلق من الردهة.",
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

    // 3. leisure ──────────────────────────────────────────────────────────
    {
      owner: hotelOwners[1]._id,
      titleEn: "Royal Hotel Oran — MGallery",
      titleAr: "رويال أوتيل وهران — إم غاليري",
      descEn: "An iconic 4-star hotel in the cultural capital of western Algeria. Magnificent colonial façade, rooftop bar overlooking the port, outdoor pool, and a prime location near the Santa Cruz fortress and the vibrant city beaches. Ideal for leisure breaks on the Oran Riviera.",
      descAr: "فندق أيقوني من 4 نجوم في العاصمة الثقافية لغرب الجزائر. واجهة استعمارية رائعة، بار على السطح يطل على الميناء، مسبح خارجي، وموقع مميز بالقرب من قلعة سانتا كروز والشواطئ.",
      wilaya: "Oran",
      category: "leisure",
      pricePerNight: 9500,
      roomsAvailable: 30,
      propertyClass: 4,
      images: [hotelImgs[2], hotelImgs[4], hotelImgs[1]],
      rating: 4.3,
      reviewCount: 76,
      isActive: true,
    },

    // 4. religious ────────────────────────────────────────────────────────
    {
      owner: hotelOwners[3]._id,
      titleEn: "Hôtel Seybouse — Annaba Islamic Heritage",
      titleAr: "فندق سيبوس — التراث الإسلامي عنابة",
      descEn: "Boutique hotel situated minutes from the Basilica of St Augustine and the historic mosques of Annaba. Specially curated religious tourism packages include guided visits to Sufi zawiyas, Islamic manuscript libraries, and the ancient city of Hippo Regius. Halal dining only.",
      descAr: "فندق بوتيك يقع على بعد دقائق من بازيليكا القديس أوغسطين ومساجد عنابة التاريخية. باقات سياحة دينية تشمل زيارات مرشودة للزوايا الصوفية ومكتبات المخطوطات الإسلامية ومدينة هيبون الأثرية.",
      wilaya: "Annaba",
      category: "religious",
      pricePerNight: 7500,
      roomsAvailable: 20,
      propertyClass: 3,
      images: [hotelImgs[3], hotelImgs[0], hotelImgs[2]],
      rating: 4.4,
      reviewCount: 61,
      isActive: true,
    },

    // 5. educational ──────────────────────────────────────────────────────
    {
      owner: hotelOwners[4]._id,
      titleEn: "Hôtel Ghardaïa M'zab — Ksar Residence",
      titleAr: "فندق غرداية المزاب — إقامة القصر",
      descEn: "A unique heritage hotel in the UNESCO-listed M'zab Valley, designed following traditional Ibadite mozabite architecture. Partners with local universities for research stays, architectural study tours, and Amazigh cultural immersion programmes. An unmatched educational experience in the living museum of the Sahara.",
      descAr: "فندق تراثي فريد في وادي مزاب المدرج على قائمة اليونسكو، مُصمَّم وفق العمارة الإباضية المزابية التقليدية. يتعاون مع الجامعات لبرامج الإقامة البحثية وجولات الدراسة المعمارية.",
      wilaya: "Ghardaïa",
      category: "educational",
      pricePerNight: 8000,
      roomsAvailable: 14,
      propertyClass: 3,
      images: [hotelImgs[4], hotelImgs[1], hotelImgs[3]],
      rating: 4.7,
      reviewCount: 43,
      isActive: true,
    },
  ]);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. RESORTS  (5 — all 6 categories covered)
  // ══════════════════════════════════════════════════════════════════════════

  const resorts = await Resort.create([

    // 1. leisure ──────────────────────────────────────────────────────────
    {
      owner: resortOwners[0]._id,
      titleEn: "Sheraton Club Des Pins Resort",
      titleAr: "منتجع شيراتون نادي الصنوبر",
      descEn: "Algeria's premier beach resort set among towering pine forests on the Mediterranean, 20km west of Algiers. Private beach, multiple pools, tennis courts, water sports, kids' club, and four restaurants serving international and Algerian cuisine.",
      descAr: "المنتجع الشاطئي الأول في الجزائر، وسط أشجار الصنوبر الشاهقة على البحر الأبيض المتوسط. شاطئ خاص، مسابح متعددة، ملاعب تنس، رياضات مائية، ناد للأطفال، وأربعة مطاعم.",
      wilaya: "Alger",
      category: "leisure",
      pricePerNight: 22000,
      maxCapacity: 8,
      images: resortImgs,
      rating: 4.9,
      reviewCount: 203,
      isActive: true,
    },

    // 2. wellness ─────────────────────────────────────────────────────────
    {
      owner: resortOwners[2]._id,
      titleEn: "Hammam Bou Hanifia Thermal Resort",
      titleAr: "منتجع حمام بوحنيفية الحراري",
      descEn: "Algeria's most celebrated thermal spa resort, fed by natural hot springs at 47°C. Therapeutic baths treating rheumatism, skin conditions, and stress. Traditional hammam rituals, physiotherapy centre, medically supervised wellness programmes, and mountain hiking. Ideal for medical and wellness tourism.",
      descAr: "أشهر منتجع حراري في الجزائر، تغذيه ينابيع ساخنة طبيعية بدرجة 47 درجة. حمامات علاجية لأمراض الروماتيزم والجلد والتوتر. طقوس الحمام التقليدية، مركز العلاج الطبيعي، وبرامج صحية طبية مشرف عليها.",
      wilaya: "Mascara",
      category: "medical",
      pricePerNight: 9500,
      maxCapacity: 4,
      images: [resortImgs[1], resortImgs[3], resortImgs[0]],
      rating: 4.7,
      reviewCount: 134,
      isActive: true,
    },

    // 3. cultural ─────────────────────────────────────────────────────────
    {
      owner: resortOwners[3]._id,
      titleEn: "Mansour Eddahbi Tlemcen — Heritage Resort",
      titleAr: "منتجع منصور الذهبي تلمسان التراثي",
      descEn: "Perched on the Lalla Setti plateau with panoramic views of Tlemcen's minarets and the Tlemcen National Park. Moroccan-Andalusian architecture, a museum wing displaying local Islamic art, daily guided tours to the Great Mosque and El Mechouar Palace, and a traditional couscous school.",
      descAr: "يعلو هضبة لالة ستي مع إطلالات بانورامية على مآذن تلمسان. هندسة مغربية أندلسية، جناح متحفي للفن الإسلامي المحلي، جولات يومية للمسجد الكبير وقصر المشور، ومدرسة الكسكسى التقليدي.",
      wilaya: "Tlemcen",
      category: "cultural",
      pricePerNight: 14000,
      maxCapacity: 6,
      images: [resortImgs[2], resortImgs[4], resortImgs[1]],
      rating: 4.8,
      reviewCount: 97,
      isActive: true,
    },

    // 4. religious ────────────────────────────────────────────────────────
    {
      owner: resortOwners[3]._id,
      titleEn: "Zianid Zawiya Retreat — Tlemcen",
      titleAr: "ملجأ الزاوية الزيانية — تلمسان",
      descEn: "A tranquil spiritual retreat hotel adjacent to the revered Sidi Boumediene zawiya complex in Tlemcen. Designed for religious tourism and spiritual reflection. Packages include Quran study circles, guided pilgrimage to the Sidi Boumediene shrine, and Sufi music evenings. Halal certified, prayer rooms on every floor.",
      descAr: "ملجأ روحاني هادئ مجاور لزاوية سيدي بومدين العريقة في تلمسان. مصمم للسياحة الدينية والتأمل الروحي. باقات تشمل حلقات تحفيظ القرآن وزيارة ضريح سيدي بومدين وأمسيات الموسيقى الصوفية.",
      wilaya: "Tlemcen",
      category: "religious",
      pricePerNight: 7000,
      maxCapacity: 4,
      images: [resortImgs[3], resortImgs[0], resortImgs[2]],
      rating: 4.6,
      reviewCount: 58,
      isActive: true,
    },

    // 5. educational ──────────────────────────────────────────────────────
    {
      owner: resortOwners[4]._id,
      titleEn: "Tamanrasset Hoggar Explorer Camp",
      titleAr: "مخيم مستكشف الهقار — تمنراست",
      descEn: "A luxury desert research camp at the foot of the Hoggar Mountains. Purpose-built for educational expeditions: geology field schools, prehistoric rock art study programmes, astronomy nights under Saharan skies, and ethnographic workshops with Tuareg communities. University partnerships welcome.",
      descAr: "مخيم بحثي صحراوي فاخر عند سفح جبال الهقار. مخصص للبعثات التعليمية: مدارس الجيولوجيا الميدانية، برامج دراسة الفن الصخري ما قبل التاريخ، ليالي الفلك تحت سماء الصحراء، وورش أنثروبولوجية مع مجتمعات الطوارق.",
      wilaya: "Tamanrasset",
      category: "educational",
      pricePerNight: 16000,
      maxCapacity: 12,
      images: [resortImgs[4], resortImgs[2], resortImgs[0]],
      rating: 4.9,
      reviewCount: 49,
      isActive: true,
    },
  ]);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. RENTALS  (5 — all 6 categories covered)
  // ══════════════════════════════════════════════════════════════════════════

  const rentals = await Rental.create([

    // 1. business ─────────────────────────────────────────────────────────
    {
      owner: rentalOwners[0]._id,
      titleEn: "Luxury Penthouse — Hydra, Algiers",
      titleAr: "شقة بنتهاوس فاخرة — حيدرة، الجزائر",
      descEn: "Stunning 3-bedroom penthouse in the prestigious Hydra neighbourhood. Sweeping Bay of Algiers views from a private terrace, designer furniture, fibre internet, co-working desk, underground parking. Walking distance to embassies and top business restaurants.",
      descAr: "شقة بنتهاوس مذهلة من 3 غرف نوم في حي حيدرة الراقي. إطلالات على خليج الجزائر من شرفة خاصة، أثاث مصمم، إنترنت ألياف ضوئية، مكتب عمل، وموقف سيارات تحت الأرض.",
      wilaya: "Alger",
      category: "business",
      pricePerNight: 8500,
      structure: { type: "apartment", roomsCount: 3, bedsCount: 4, bathroomsCount: 2, maxGuests: 6 },
      images: rentalImgs,
      rating: 4.9,
      reviewCount: 37,
      isActive: true,
    },

    // 2. leisure ──────────────────────────────────────────────────────────
    {
      owner: rentalOwners[4]._id,
      titleEn: "Beachfront Villa — Jijel Corniche",
      titleAr: "فيلا على الشاطئ — كورنيش جيجل",
      descEn: "Spacious 4-bedroom villa with private pool and direct access to the crystal-clear waters of Jijel's famous corniche. Outdoor dining terrace, sun deck, BBQ, kayaks included. Surrounded by Mediterranean pine forests — the perfect leisure escape for families.",
      descAr: "فيلا واسعة من 4 غرف نوم مع مسبح خاص وإمكانية الوصول المباشر إلى مياه كورنيش جيجل الصافية. شرفة لتناول الطعام في الهواء الطلق، سطح شمسي، شواء، وكاياك مدرج. المنجأ الترفيهي المثالي للعائلات.",
      wilaya: "Jijel",
      category: "leisure",
      pricePerNight: 10000,
      structure: { type: "villa", roomsCount: 4, bedsCount: 5, bathroomsCount: 3, maxGuests: 10 },
      images: [rentalImgs[1], rentalImgs[3], rentalImgs[4]],
      rating: 4.8,
      reviewCount: 55,
      isActive: true,
    },

    // 3. cultural ─────────────────────────────────────────────────────────
    {
      owner: rentalOwners[1]._id,
      titleEn: "Traditional Riad — Old Medina, Tlemcen",
      titleAr: "رياض تقليدي — المدينة القديمة، تلمسان",
      descEn: "An authentically restored Andalusian riad in the heart of Tlemcen's ancient medina. Mosaic tiled courtyard, carved cedarwood ceilings, 4 en-suite rooms, and a rooftop terrace with views of the Grand Mosque minaret. Cooking classes and medina walking tours included on request.",
      descAr: "رياض أندلسي مُرمَّم بأصالة في قلب المدينة القديمة بتلمسان. فناء مبلط بالفسيفساء، أسقف خشب الأرز المنحوتة، 4 غرف بحمامات خاصة، وشرفة علوية بإطلالة على مئذنة المسجد الكبير.",
      wilaya: "Tlemcen",
      category: "cultural",
      pricePerNight: 7000,
      structure: { type: "villa", roomsCount: 4, bedsCount: 4, bathroomsCount: 4, maxGuests: 8 },
      images: [rentalImgs[2], rentalImgs[4], rentalImgs[1]],
      rating: 4.8,
      reviewCount: 44,
      isActive: true,
    },

    // 4. religious ────────────────────────────────────────────────────────
    {
      owner: rentalOwners[3]._id,
      titleEn: "Saharan Ksar Guesthouse — Ghardaïa",
      titleAr: "دار ضيافة القصر الصحراوي — غرداية",
      descEn: "A restored traditional ksar (fortified house) in the UNESCO M'zab Valley. Rooms decorated with authentic Mozabite tilework and hand-woven textiles. Walking distance to the Friday Mosque of Ghardaïa. Host offers guided visits to local zawiyas and Islamic schools. Ideal for religious and spiritual travellers.",
      descAr: "قصر تقليدي مُرمَّم في وادي مزاب المدرج على قائمة اليونسكو. غرف مزينة بالبلاط المزابي الأصيل والمنسوجات اليدوية. على مسافة المشي من مسجد غرداية الجمعة. المضيف يوفر زيارات مرشودة للزوايا والمدارس الإسلامية.",
      wilaya: "Ghardaïa",
      category: "religious",
      pricePerNight: 5000,
      structure: { type: "villa", roomsCount: 3, bedsCount: 3, bathroomsCount: 2, maxGuests: 6 },
      images: [rentalImgs[0], rentalImgs[2], rentalImgs[3]],
      rating: 4.7,
      reviewCount: 32,
      isActive: true,
    },

    // 5. educational ──────────────────────────────────────────────────────
    {
      owner: rentalOwners[2]._id,
      titleEn: "University District Flat — Sétif Campus",
      titleAr: "شقة الحي الجامعي — حرم سطيف",
      descEn: "A well-equipped modern apartment 5 minutes from Ferhat Abbas University of Sétif and 30 minutes from the Roman ruins of Djemila (UNESCO). Fast WiFi, study room, full kitchen, and a quiet neighbourhood. Ideal for researchers, exchange students, and educational tourists visiting the archaeological sites of the Hauts Plateaux.",
      descAr: "شقة حديثة مجهزة جيدًا على بعد 5 دقائق من جامعة فرحات عباس بسطيف و30 دقيقة من أطلال جميلة الرومانية (يونسكو). واي فاي سريع، غرفة دراسة، مطبخ كامل وحي هادئ. مثالية للباحثين وطلاب التبادل.",
      wilaya: "Sétif",
      category: "educational",
      pricePerNight: 3500,
      structure: { type: "apartment", roomsCount: 2, bedsCount: 2, bathroomsCount: 1, maxGuests: 4 },
      images: [rentalImgs[3], rentalImgs[0], rentalImgs[2]],
      rating: 4.5,
      reviewCount: 28,
      isActive: true,
    },
  ]);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. GUIDES  (5 — all 6 categories covered)
  // ══════════════════════════════════════════════════════════════════════════

  const guides = await Guide.create([

    // 1. leisure (Sahara adventure) ───────────────────────────────────────
    {
      owner: guideOwners[0]._id,
      nameEn: "Tarek — Sahara & Hoggar Expert",
      nameAr: "طارق — خبير الصحراء والهقار",
      expertiseEn: "Certified desert guide with 12 years navigating Tassili N'Ajjer (UNESCO), Hoggar Mountains, and Ahaggar National Park. Specialises in camel treks, 4WD expeditions, dune bivouacs, rock art tours, and Tuareg cultural immersion. Multi-day packages from 3 to 21 days.",
      expertiseAr: "مرشد صحراوي معتمد بخبرة 12 عامًا في استكشاف تاسيلي ناجر (يونسكو)، جبال الهقار، والمنتزه الوطني للأهقار. متخصص في رحلات الجمال والبيفواك على الكثبان وجولات الفن الصخري والغمر الثقافي الطوارقي.",
      wilaya: "Tamanrasset",
      category: "leisure",
      pricePerDay: 8500,
      maxGroupSize: 8,
      languagesSpoken: ["ar", "fr", "en", "Tamasheq"],
      specializations: ["Sahara trekking", "Rock art", "Tuareg culture", "Camel expeditions", "4WD tours"],
      images: guideImgs,
      rating: 5.0,
      reviewCount: 94,
      isActive: true,
    },

    // 2. cultural (Kabyle mountains) ──────────────────────────────────────
    {
      owner: guideOwners[1]._id,
      nameEn: "Lydia — Kabyle Mountains & Amazigh Culture",
      nameAr: "ليديا — جبال القبائل والثقافة الأمازيغية",
      expertiseEn: "Native Kabyle guide and cultural anthropologist. Leads authentic village stays, Djurdjura National Park treks (2,308m peak), traditional Amazigh craft workshops, olive harvest experiences, and Berber culinary tours. All tours support local women's cooperatives.",
      expertiseAr: "مرشدة كابيلية أصيلة وعالمة أنثروبولوجيا ثقافية. تقود إقامات قروية أصيلة، ورحلات في منتزه جرجرة الوطني، وورش الحرف الأمازيغية التقليدية. جميع الجولات تدعم التعاونيات النسائية المحلية.",
      wilaya: "Tizi Ouzou",
      category: "cultural",
      pricePerDay: 5500,
      maxGroupSize: 6,
      languagesSpoken: ["ar", "fr", "en", "Tamazight"],
      specializations: ["Mountain trekking", "Amazigh culture", "Village tours", "Culinary tours", "Craft workshops"],
      images: [guideImgs[1], guideImgs[3], guideImgs[0]],
      rating: 4.9,
      reviewCount: 72,
      isActive: true,
    },

    // 3. business (Algiers city & networking) ─────────────────────────────
    {
      owner: guideOwners[2]._id,
      nameEn: "Hichem — Algiers City, History & Business Tours",
      nameAr: "هشام — جولات المدينة والتاريخ والأعمال في الجزائر",
      expertiseEn: "Licensed Algiers city guide and business travel consultant. Specialises in the UNESCO Kasbah, Ottoman palaces, colonial architecture, and curated business-networking day tours connecting visiting executives with local entrepreneurs, trade fair logistics, and corporate event co-ordination.",
      expertiseAr: "مرشد مدني مرخص ومستشار سفر أعمال في الجزائر. متخصص في قصبة الجزائر المدرجة على قائمة اليونسكو، القصور العثمانية، والجولات التجارية المنسقة التي تربط المديرين الزائرين بالمقاولين المحليين.",
      wilaya: "Alger",
      category: "business",
      pricePerDay: 4500,
      maxGroupSize: 12,
      languagesSpoken: ["ar", "fr", "en"],
      specializations: ["Casbah tours", "Ottoman history", "Business networking", "Corporate events", "Trade fair logistics"],
      images: [guideImgs[2], guideImgs[4], guideImgs[1]],
      rating: 4.7,
      reviewCount: 48,
      isActive: true,
    },

    // 4. religious ────────────────────────────────────────────────────────
    {
      owner: guideOwners[3]._id,
      nameEn: "Siham — Islamic Heritage & Spiritual Tours — Tlemcen",
      nameAr: "سيهام — جولات التراث الإسلامي والسياحة الروحية — تلمسان",
      expertiseEn: "Specialist guide in Islamic religious tourism across western Algeria. Leads in-depth visits to the Great Mosque of Tlemcen (12th century), El Mechouar Palace, the Mansourah ruins, Sufi zawiya circuits, and the Sidi Boumediene shrine. Half-day and multi-day spiritual itineraries available in Arabic, French, and English.",
      expertiseAr: "مرشدة متخصصة في السياحة الدينية الإسلامية في غرب الجزائر. تقود زيارات معمقة للمسجد الكبير بتلمسان (القرن الثاني عشر)، قصر المشور، أطلال المنصورة، مسارات الزوايا الصوفية، وضريح سيدي بومدين.",
      wilaya: "Tlemcen",
      category: "religious",
      pricePerDay: 4000,
      maxGroupSize: 15,
      languagesSpoken: ["ar", "fr", "en"],
      specializations: ["Islamic architecture", "Sufi zawiyas", "Shrine visits", "Mosque history", "Spiritual itineraries"],
      images: [guideImgs[3], guideImgs[0], guideImgs[2]],
      rating: 4.8,
      reviewCount: 63,
      isActive: true,
    },

    // 5. educational (Roman ruins & archaeology) ──────────────────────────
    {
      owner: guideOwners[4]._id,
      nameEn: "Nassim — Roman Ruins & Archaeological Tours",
      nameAr: "نسيم — جولات الأطلال الرومانية والآثار",
      expertiseEn: "Archaeologist and licensed heritage guide with a doctorate in Roman North Africa. Leads expert tours of Djemila (UNESCO), Timgad (UNESCO), Tipaza (UNESCO), and Cherchell Museum. Tailors programmes for university groups, school expeditions, and independent researchers. Co-author of the Algerian Roman Sites field guide.",
      expertiseAr: "عالم آثار ومرشد تراث مرخص بدكتوراه في شمال أفريقيا الروماني. يقود جولات متخصصة في جميلة (يونسكو) وتيمقاد (يونسكو) وتيبازة (يونسكو) ومتحف شرشال. يصمم برامج مخصصة للمجموعات الجامعية والبعثات المدرسية.",
      wilaya: "Sétif",
      category: "educational",
      pricePerDay: 6000,
      maxGroupSize: 20,
      languagesSpoken: ["ar", "fr", "en"],
      specializations: ["Roman archaeology", "UNESCO sites", "Field schools", "Museum tours", "Research expeditions"],
      images: [guideImgs[4], guideImgs[2], guideImgs[0]],
      rating: 4.9,
      reviewCount: 57,
      isActive: true,
    },
  ]);

  console.log(`🏨 Created ${hotels.length} hotels`);
  console.log(`🌴 Created ${resorts.length} resorts`);
  console.log(`🏠 Created ${rentals.length} rentals`);
  console.log(`🗺  Created ${guides.length} guides`);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. RESERVATIONS
  // ══════════════════════════════════════════════════════════════════════════

  const past   = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };
  const future = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt; };

  const reservations = await Reservation.create([
    // ── completed (will get reviews) ──────────────────────────────────────
    {
      tourist: tourists[0]._id,
      provider: hotelOwners[0]._id,
      listingId: hotels[0]._id,
      listingModel: "Hotel",
      status: "completed",
      startDate: past(30), endDate: past(25),
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
      startDate: past(20), endDate: past(16),
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
      startDate: past(15), endDate: past(10),
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
      startDate: past(10), endDate: past(7),
      totalPrice: 25500,
      guestCount: 2,
      paymentStatus: "paid",
    },
    {
      tourist: tourists[4]._id,
      provider: guideOwners[3]._id,
      listingId: guides[3]._id,
      listingModel: "Guide",
      status: "completed",
      startDate: past(8), endDate: past(6),
      totalPrice: 8000,
      guestCount: 1,
      paymentStatus: "paid",
    },
    // ── confirmed (upcoming) ──────────────────────────────────────────────
    {
      tourist: tourists[0]._id,
      provider: resortOwners[2]._id,
      listingId: resorts[1]._id,
      listingModel: "Resort",
      status: "confirmed",
      startDate: future(5), endDate: future(10),
      totalPrice: 47500,
      guestCount: 2,
      paymentStatus: "paid",
    },
    {
      tourist: tourists[2]._id,
      provider: rentalOwners[4]._id,
      listingId: rentals[1]._id,
      listingModel: "Rental",
      status: "confirmed",
      startDate: future(3), endDate: future(8),
      totalPrice: 50000,
      guestCount: 4,
      paymentStatus: "paid",
    },
    {
      tourist: tourists[3]._id,
      provider: guideOwners[4]._id,
      listingId: guides[4]._id,
      listingModel: "Guide",
      status: "confirmed",
      startDate: future(7), endDate: future(9),
      totalPrice: 12000,
      guestCount: 3,
      paymentStatus: "paid",
    },
    // ── pending ───────────────────────────────────────────────────────────
    {
      tourist: tourists[1]._id,
      provider: hotelOwners[3]._id,
      listingId: hotels[3]._id,
      listingModel: "Hotel",
      status: "pending",
      startDate: future(10), endDate: future(14),
      totalPrice: 30000,
      guestCount: 2,
      paymentStatus: "pending",
    },
    {
      tourist: tourists[4]._id,
      provider: rentalOwners[2]._id,
      listingId: rentals[4]._id,
      listingModel: "Rental",
      status: "pending",
      startDate: future(12), endDate: future(16),
      totalPrice: 14000,
      guestCount: 2,
      paymentStatus: "pending",
    },
    // ── cancelled ─────────────────────────────────────────────────────────
    {
      tourist: tourists[3]._id,
      provider: rentalOwners[0]._id,
      listingId: rentals[0]._id,
      listingModel: "Rental",
      status: "cancelled",
      startDate: past(5), endDate: past(2),
      totalPrice: 25500,
      guestCount: 3,
      paymentStatus: "refunded",
    },
  ]);

  console.log(`📅 Created ${reservations.length} reservations`);

  // ══════════════════════════════════════════════════════════════════════════
  // 7. REVIEWS  (only for completed reservations)
  // ══════════════════════════════════════════════════════════════════════════

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
      comment: "منتجع شيراتون نادي الصنوبر هو ببساطة الأفضل في الجزائر! أمضينا 4 أيام رائعة. الشاطئ الخاص نظيف ومريح، والمسبح الرئيسي مذهل. الطعام لا يوصف، خاصة طبق الجمبري المشوي. فريق العمل ودود للغاية وسريع الاستجابة. تجربة لا تُنسى لكل العائلة!",
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
      comment: "The Tlemcen Riad was a once-in-a-lifetime experience. Waking up to the adhan from the Grand Mosque minaret, sipping mint tea in the mosaic courtyard, the carved cedar ceilings… It felt like sleeping inside a work of art. Amina arranged a private cooking class and a guided medina tour. Highly recommended for anyone who wants authentic Algerian heritage.",
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
      comment: "طارق مرشد استثنائي بكل معنى الكلمة! رحلة 3 أيام في تاسيلي ناجر كانت من أجمل تجارب حياتي. معرفته بالفن الصخري الآلاف السنين والثقافة الطوارقية عميقة ومذهلة. تنظيم مثالي، معدات عالية الجودة، وطبخ صحراوي رائع حول النار. أنصح به بشدة لكل من يريد اكتشاف الصحراء الجزائرية!",
      isApproved: true,
      isVerifiedTrip: true,
      helpfulCount: 42,
    },
    {
      tourist: tourists[4]._id,
      reservation: reservations[4]._id,
      listingId: guides[3]._id,
      listingModel: "Guide",
      rating: 5,
      comment: "جولة سيهام في تلمسان كانت تجربة روحية عميقة. زرنا المسجد الكبير وضريح سيدي بومدين والمدرسة التاشفينية — كل موقع شرحته بعمق وعشق حقيقي للتراث. الأسلوب رائع والمعلومات التاريخية ثرية جداً. أنصح بها بشدة لكل محب للسياحة الدينية والإسلامية.",
      isApproved: true,
      isVerifiedTrip: true,
      helpfulCount: 29,
    },
  ]);

  console.log("⭐ Created 5 reviews");

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅  SEED COMPLETE — Login credentials:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("👑 Admin         → admin@pacta.dz              / Admin@123");
  console.log("─────────────────────────────────────────────────────");
  console.log("🏨 Hotel owner   → karim.benali@pacta.dz       / Pass@1234  (Sofitel + El Djazaïr)");
  console.log("🏨 Hotel owner   → yasmine.khelil@pacta.dz     / Pass@1234  (Royal Oran)");
  console.log("🏨 Hotel owner   → mourad.touati@pacta.dz      / Pass@1234");
  console.log("🏨 Hotel owner   → fares.mansouri@pacta.dz     / Pass@1234  (Annaba religious)");
  console.log("🏨 Hotel owner   → dalila.oukaci@pacta.dz      / Pass@1234  (Ghardaïa educational)");
  console.log("─────────────────────────────────────────────────────");
  console.log("🌴 Resort owner  → samir.hadj@pacta.dz         / Pass@1234  (Club Des Pins)");
  console.log("🌴 Resort owner  → bilal.chergui@pacta.dz      / Pass@1234  (Hammam Bou Hanifia)");
  console.log("🌴 Resort owner  → samira.belkacem@pacta.dz    / Pass@1234  (Tlemcen cultural + religious)");
  console.log("🌴 Resort owner  → omar.belhadj@pacta.dz       / Pass@1234  (Hoggar educational camp)");
  console.log("─────────────────────────────────────────────────────");
  console.log("🏠 Rental owner  → rachid.meziane@pacta.dz     / Pass@1234  (Hydra penthouse)");
  console.log("🏠 Rental owner  → amina.chabane@pacta.dz      / Pass@1234  (Tlemcen riad)");
  console.log("🏠 Rental owner  → hamza.berkouk@pacta.dz      / Pass@1234  (Sétif university flat)");
  console.log("🏠 Rental owner  → souad.hadjadj@pacta.dz      / Pass@1234  (Ghardaïa ksar)");
  console.log("🏠 Rental owner  → mehdi.boukabous@pacta.dz    / Pass@1234  (Jijel villa)");
  console.log("─────────────────────────────────────────────────────");
  console.log("🗺  Guide         → tarek.oussama@pacta.dz      / Pass@1234  (Sahara leisure)");
  console.log("🗺  Guide         → lydia.mammeri@pacta.dz      / Pass@1234  (Kabyle cultural)");
  console.log("🗺  Guide         → hichem.rahmani@pacta.dz     / Pass@1234  (Algiers business)");
  console.log("🗺  Guide         → siham.guerroudj@pacta.dz    / Pass@1234  (Tlemcen religious)");
  console.log("🗺  Guide         → nassim.djoudi@pacta.dz      / Pass@1234  (Roman ruins educational)");
  console.log("─────────────────────────────────────────────────────");
  console.log("✈️  Tourist       → sophie.martin@gmail.com      / Pass@1234");
  console.log("✈️  Tourist       → ahmed.khalil@gmail.com       / Pass@1234");
  console.log("✈️  Tourist       → emma.wilson@outlook.com      / Pass@1234");
  console.log("✈️  Tourist       → youcef.bensalem@gmail.com    / Pass@1234");
  console.log("✈️  Tourist       → fatima.zahra@gmail.com       / Pass@1234");
  console.log("═══════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});