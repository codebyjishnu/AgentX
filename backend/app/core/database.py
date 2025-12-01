
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# PostgreSQL Database Engine
# engine = create_async_engine(
#     str("postgresql+psycopg://agentx:agentxxx@localhost:5432/agentx"),
#     echo=False,
#     future=True,
#     pool_pre_ping=True,
#     pool_recycle=300,
# )

engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function that yields database sessions.
    
    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
