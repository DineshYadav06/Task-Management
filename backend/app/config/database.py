import motor.motor_asyncio
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.get_mongodb_connection_uri)
AdminDb = client[settings.MONGODB_DB_NAME]
