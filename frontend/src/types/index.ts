export interface Coach {
  id: number;
  full_name: string;
  phone_country_code: string;
  phone_number: string;
  email?: string;
  bio?: string;
  specialization?: string;
  experience_years: number;
  certifications?: string;
  avatar_url?: string;
  cover_url?: string;
  rating: number;
  total_clients: number;
  total_sessions: number;
  is_active: boolean;
  created_at: string;
}

export interface CoachStats {
  total_clients: number;
  active_clients: number;
  total_sessions: number;
  avg_compliance: number;
  avg_rating: number;
  monthly_revenue: number;
  workouts_assigned: number;
  meal_plans_created: number;
}

export interface Client {
  id: number;
  coach_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: string;
  fitness_level: string;
  health_conditions?: string;
  avatar_url?: string;
  is_active: boolean;
  joined_at: string;
  streak_days: number;
  compliance_rate: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  video_url?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
  duration_minutes: number;
}

export interface WorkoutPlan {
  id: string;
  coach_id: number;
  client_id: number;
  title: string;
  description?: string;
  goal: string;
  weeks: number;
  days_per_week: number;
  plan: WorkoutDay[];
  notes?: string;
  created_at: string;
  is_active: boolean;
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealEntry {
  meal_type: string;
  time: string;
  foods: FoodItem[];
  notes?: string;
}

export interface DailyMealPlan {
  day: string;
  total_calories: number;
  meals: MealEntry[];
}

export interface MealPlan {
  id: string;
  coach_id: number;
  client_id: number;
  title: string;
  goal: string;
  daily_calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  weeks: number;
  plan: DailyMealPlan[];
  dietary_restrictions: string[];
  notes?: string;
  created_at: string;
  is_active: boolean;
}

export interface ProgressSnapshot {
  id?: string;
  client_id: number;
  date: string;
  weight_kg?: number;
  body_fat_pct?: number;
  muscle_mass_kg?: number;
  bmi?: number;
  vo2_max?: number;
  resting_hr?: number;
  photos?: string[];
  notes?: string;
}

export interface CountryCode {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

export interface AuthState {
  token: string | null;
  coachId: number | null;
  isAuthenticated: boolean;
  login: (token: string, coachId: number) => void;
  logout: () => void;
}
