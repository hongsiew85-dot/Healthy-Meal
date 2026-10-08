export type DietaryGoal = 
  | 'all'
  | 'high-protein'
  | 'hpb-certified'
  | 'low-sodium'
  | 'wholegrain'
  | 'keto'
  | 'vegetarian'
  | 'halal';

export type NutriGrade = 'A' | 'B' | 'C' | 'D';

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fats: number;    // in grams
  fiber?: number;  // in grams
  sodium?: number; // in mg
}

export interface MealCustomizationOption {
  id: string;
  name: string;
  extraPrice: number;
  extraProtein?: number;
  extraCalories?: number;
}

export interface MealCustomizationGroup {
  name: string;
  required: boolean;
  options: MealCustomizationOption[];
}

export interface MealItem {
  id: string;
  name: string;
  hawkerStallOrBrand: string;
  location: string;
  price: number;
  imageUrl: string;
  description: string;
  nutrition: NutritionInfo;
  nutriGrade: NutriGrade;
  hpbClaim: string; // e.g. "Lower in Sodium · Higher in Wholegrains"
  tags: DietaryGoal[];
  rating: number;
  reviewsCount: number;
  prepTimeMins: number;
  barcode?: string;
  brand?: string;
  ingredientsText?: string;
  openFoodFactsUrl?: string;
  isOpenFoodFactsVerified?: boolean;
  customizations?: MealCustomizationGroup[];
}

export interface CartItem {
  meal: MealItem;
  quantity: number;
  selectedOptions: { groupName: string; option: MealCustomizationOption }[];
  itemTotal: number;
  notes?: string;
}

export type SportType = 'badminton' | 'gym' | 'swimming' | 'tennis' | 'table-tennis' | 'squash';

export interface TimeSlot {
  id: string;
  timeRange: string; // e.g. "18:00 - 19:00"
  isPeak: boolean;
  price: number;
  availableCourts: number;
  totalCourts: number;
}

export interface ActiveSGVenue {
  id: string;
  name: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  address: string;
  mrt: string;
  distanceKm: number;
  sports: SportType[];
  imageUrl: string;
  openingHours: string;
  rating: number;
  slots: Record<SportType, TimeSlot[]>;
  calorieBurnPerHour: Record<SportType, number>;
}

export interface FacilityBooking {
  id: string;
  bookingRef: string;
  venueName: string;
  sport: SportType;
  courtNumber: string;
  date: string;
  timeSlot: string;
  isPeak: boolean;
  fee: number;
  estimatedCalorieBurn: number;
  createdAt: string;
}

export interface LoggedMeal {
  id: string;
  title: string;
  source: 'order' | 'scan' | 'manual';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  imageUrl?: string;
  nutriGrade?: NutriGrade;
  hpbScore?: number;
}

export interface LoggedActivity {
  id: string;
  title: string;
  sport: string;
  durationMinutes: number;
  caloriesBurned: number;
  time: string;
  location?: string;
}

export interface FoodScanAnalysis {
  foodName: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  nutriGrade: NutriGrade;
  hpbHealthierChoiceScore: number; // 0 - 100
  ingredientsDetected: string[];
  healthAnalysis: string;
  dietitianSuggestions: string[];
  isHealthyChoice: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  suggestedAction?: {
    type: 'view-meal' | 'book-court';
    id: string;
    label: string;
  };
}

export type SubscriptionTier = 'free' | 'pro' | 'club' | 'elite';
export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  popular?: boolean;
  description: string;
  perks: string[];
  hpbHealthpointsMultiplier: number;
  deliveryDiscount: 'none' | 'free_all' | 'free_priority';
  mealDiscountPercentage: number;
  courtAlerts: boolean;
  unlimitedScans: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  status: 'active' | 'trial' | 'free';
  startDate: string;
  renewalDate: string;
  feeSgd: number;
  savingsTotalSgd: number;
  autoRenew: boolean;
}
