from fastapi import APIRouter
from app.api.v1.endpoints import auth, coach, clients, workouts, meals, insights

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(coach.router)
api_router.include_router(clients.router)
api_router.include_router(workouts.router)
api_router.include_router(meals.router)
api_router.include_router(insights.router)
