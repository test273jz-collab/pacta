// ========== USER ==========
export type UserRole =
  | "tourist"
  | "hotel_owner"
  | "resort_owner"
  | "rental_owner"
  | "guide"
  | "admin";
export type Lang = "en" | "ar";
export type Currency = "DZD" | "EUR" | "USD";
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type ListingModel = "Hotel" | "Rental" | "Resort" | "Guide";
export type NotificationType =
  | "reservation_new"
  | "reservation_confirmed"
  | "reservation_cancelled"
  | "reservation_completed"
  | "review_received"
  | "message_received"
  | "system"
  | "welcome";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  bio?: string;
  location?: string;
  role: UserRole;
  language: Lang;
  isActive: boolean;
  isEmailVerified: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// ========== AUTH ==========
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  avatar: string;
  language?: Lang;
}

export interface RegisterCompletePayload {
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: Exclude<UserRole, "tourist" | "admin">;
  language?: Lang;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  expertiseEn?: string;
  expertiseAr?: string;
  price: string;
  wilaya: string;
  images: string[];
  roomsAvailable?: string;
  propertyClass?: string;
  structureType?: string;
  roomsCount?: string;
  bedsCount?: string;
  bathroomsCount?: string;
  maxCapacity?: string;
  languagesSpoken?: string[];
  maxGroupSize?: string;
  specializations?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
    profile?: any;
  };
  token?: string;
  user?: User;
}

// ========== LISTINGS ==========
export interface Hotel {
  _id: string;
  owner: string | User;
  type: "hotel";
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  pricePerNight: number;
  roomsAvailable: number;
  amenities: HotelAmenities;
  propertyClass: number;
  images: string[];
  wilaya: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HotelAmenities {
  hasPool: boolean;
  hasSpa: boolean;
  hasGym: boolean;
  hasFreeParking: boolean;
  hasRestaurant: boolean;
  breakfastIncluded: boolean;
  hasWiFi: boolean;
  hasAC: boolean;
}

export interface Resort {
  _id: string;
  owner: string | User;
  type: "resort";
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  pricePerNight: number;
  leisureActivities: ResortActivities;
  maxCapacity: number;
  images: string[];
  wilaya: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResortActivities {
  hasPrivateBeach: boolean;
  hasWaterpark: boolean;
  hasClub: boolean;
  hasSportsCourts: boolean;
  hasPool: boolean;
  hasSpa: boolean;
  hasKidsClub: boolean;
}

export interface Rental {
  _id: string;
  owner: string | User;
  type: "rental";
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  pricePerNight: number;
  structure: RentalStructure;
  houseFeatures: RentalFeatures;
  rentalRulesEn: string;
  rentalRulesAr: string;
  images: string[];
  wilaya: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RentalStructure {
  roomsCount: number;
  bedsCount: number;
  bathroomsCount: number;
  maxGuests: number;
}

export interface RentalFeatures {
  hasWiFi: boolean;
  hasAC: boolean;
  hasKitchen: boolean;
  hasPrivateEntrance: boolean;
  hasParking: boolean;
  hasWasher: boolean;
}

export interface Guide {
  _id: string;
  owner: string | User;
  type: "guide";
  nameEn: string;
  nameAr: string;
  expertiseEn: string;
  expertiseAr: string;
  pricePerDay: number;
  verifiedGuideCode: string;
  maxGroupSize: number;
  languagesSpoken: string[];
  specializations: string[];
  guidedToursCount: number;
  images: string[];
  wilaya: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Listing = Hotel | Resort | Rental | Guide;

export interface UnifiedListing {
  _id: string;
  listingType: string;
  titleEn: string;
  titleAr: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  wilaya: string;
  rating: number;
  reviewCount: number;
  images: string[];
  image: string | null;
  price: number;
  pricePerNight?: number;
  pricePerDay?: number;
  href: string;
  owner?: User;
  createdAt: string;
  // Type-specific
  roomsAvailable?: number;
  amenities?: HotelAmenities;
  propertyClass?: number;
  structure?: RentalStructure;
  houseFeatures?: RentalFeatures;
  maxGuests?: number;
  leisureActivities?: ResortActivities;
  maxCapacity?: number;
  languagesSpoken?: string[];
  specializations?: string[];
  maxGroupSize?: number;
}

// ========== RESERVATION ==========
export interface Reservation {
  _id: string;
  tourist: User;
  provider: User;
  listingId: string;
  listingModel: ListingModel;
  status: ReservationStatus;
  startDate: string;
  endDate: string;
  totalPrice: number;
  currency: Currency;
  guestCount: number;
  specialRequests: string;
  paymentStatus: PaymentStatus;
  listingDetails?: UnifiedListing | null;
  createdAt: string;
  updatedAt: string;
}

// ========== REVIEW ==========
export interface Review {
  _id: string;
  tourist: Pick<User, "_id" | "name" | "avatar">;
  reservation: string;
  listingId: string;
  listingModel: ListingModel;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

// ========== WISHLIST ==========
export interface WishlistItem {
  _id: string;
  user: string;
  listingId: string;
  listingModel: ListingModel;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ========== NOTIFICATION ==========
export interface Notification {
  _id: string;
  recipient: string;
  sender: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== CATEGORY ==========
export interface Category {
  _id: string;
  slug: string;
  labelEn: string;
  labelAr: string;
  iconName: string;
  countString: string;
  bgClass: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  descEn?: string;
  descAr?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== AD ==========
export interface Ad {
  _id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  bgClass: string;
  image: string;
  category: string; // Added this
  video?: string; // Added this (optional)
  poster?: string; // Added this (optional)
  link: string;
  displayOrder: number;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== CONTACT ==========
export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  user: string | null;
  replyMessage: string;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== ANALYTICS ==========
export interface AnalyticsOverview {
  counts: {
    users: number;
    hotels: number;
    rentals: number;
    resorts: number;
    guides: number;
    reservations: number;
    reviews: number;
    pendingContacts: number;
  };
  recentActivity: {
    reservationsLast30Days: number;
    newUsersLast30Days: number;
  };
  totalListings: number;
}

// ========== API RESPONSE ==========
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ========== PROFILE ==========
export interface ProfileResponse {
  user: User;
  businessListing: Listing | null;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  language?: Lang;
  avatar?: string;
  businessData?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
