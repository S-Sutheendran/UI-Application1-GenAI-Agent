from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.ENVIRONMENT == "development")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

_mongo_client = None


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_mongo_db():
    global _mongo_client
    if _mongo_client is None:
        # Use in-memory mock in development (no MongoDB server required)
        if settings.ENVIRONMENT == "development":
            from mongomock_motor import AsyncMongoMockClient
            _mongo_client = AsyncMongoMockClient()
        else:
            from motor.motor_asyncio import AsyncIOMotorClient
            _mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
    return _mongo_client[settings.MONGODB_DB_NAME]


async def create_tables():
    from app.models.sql import coach, client, otp  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
