from datetime import datetime
from pydantic import BaseModel


class FoodItem(BaseModel):
    name: str
    quantity: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class MealEntry(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    time: str
    foods: list[FoodItem]
    notes: str | None = None


class DailyMealPlan(BaseModel):
    day: str
    total_calories: int
    meals: list[MealEntry]


class MealPlanCreate(BaseModel):
    client_id: int
    title: str
    goal: str
    daily_calorie_target: int
    protein_target_g: float
    carbs_target_g: float
    fat_target_g: float
    weeks: int = 4
    plan: list[DailyMealPlan]
    dietary_restrictions: list[str] = []
    notes: str | None = None


class MealPlanOut(MealPlanCreate):
    id: str
    coach_id: int
    created_at: datetime
    is_active: bool = True

    model_config = {"from_attributes": True}
