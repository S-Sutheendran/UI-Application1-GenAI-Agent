from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


def _serialize(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


class WorkoutService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["workout_plans"]

    async def create(self, coach_id: int, data: dict) -> dict:
        data.update({"coach_id": coach_id, "created_at": datetime.now(timezone.utc), "is_active": True})
        result = await self.col.insert_one(data)
        data["id"] = str(result.inserted_id)
        return data

    async def list_by_client(self, coach_id: int, client_id: int) -> list[dict]:
        cursor = self.col.find({"coach_id": coach_id, "client_id": client_id})
        return [_serialize(d) async for d in cursor]

    async def list_by_coach(self, coach_id: int) -> list[dict]:
        cursor = self.col.find({"coach_id": coach_id})
        return [_serialize(d) async for d in cursor]

    async def get(self, plan_id: str) -> dict | None:
        doc = await self.col.find_one({"_id": ObjectId(plan_id)})
        return _serialize(doc) if doc else None

    async def delete(self, plan_id: str) -> bool:
        result = await self.col.delete_one({"_id": ObjectId(plan_id)})
        return result.deleted_count > 0


class MealService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["meal_plans"]

    async def create(self, coach_id: int, data: dict) -> dict:
        data.update({"coach_id": coach_id, "created_at": datetime.now(timezone.utc), "is_active": True})
        result = await self.col.insert_one(data)
        data["id"] = str(result.inserted_id)
        return data

    async def list_by_client(self, coach_id: int, client_id: int) -> list[dict]:
        cursor = self.col.find({"coach_id": coach_id, "client_id": client_id})
        return [_serialize(d) async for d in cursor]

    async def list_by_coach(self, coach_id: int) -> list[dict]:
        cursor = self.col.find({"coach_id": coach_id})
        return [_serialize(d) async for d in cursor]


class InsightService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["insights"]
        self.progress_col = db["progress_snapshots"]

    async def upsert(self, coach_id: int, client_id: int, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        data.update({"coach_id": coach_id, "client_id": client_id, "updated_at": now})
        existing = await self.col.find_one({"coach_id": coach_id, "client_id": client_id})
        if existing:
            await self.col.update_one({"_id": existing["_id"]}, {"$set": data})
            data["id"] = str(existing["_id"])
        else:
            data["created_at"] = now
            result = await self.col.insert_one(data)
            data["id"] = str(result.inserted_id)
        return data

    async def get(self, coach_id: int, client_id: int) -> dict | None:
        doc = await self.col.find_one({"coach_id": coach_id, "client_id": client_id})
        return _serialize(doc) if doc else None

    async def add_progress(self, coach_id: int, data: dict) -> dict:
        data.update({"coach_id": coach_id, "recorded_at": datetime.now(timezone.utc)})
        result = await self.progress_col.insert_one(data)
        data["id"] = str(result.inserted_id)
        return data

    async def get_progress_history(self, coach_id: int, client_id: int) -> list[dict]:
        cursor = self.progress_col.find({"coach_id": coach_id, "client_id": client_id}).sort("recorded_at", 1)
        return [_serialize(d) async for d in cursor]
