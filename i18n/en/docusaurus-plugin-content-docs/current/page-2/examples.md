---
sidebar_position: 6
---

# Plugin Example Templates

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

This document provides complete example templates for WaveYo-API plugins, covering various common scenarios to help you quickly start plugin development.

## Basic Plugin Template

### Minimal Function Plugin

```python
# plugins/yoapi_plugin_minimal/__init__.py
"""
Minimal function plugin example
Provides basic API endpoint functionality
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/ping")
async def ping() -> Dict[str, str]:
    """Health check endpoint"""
    return {"message": "pong"}

@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """Get plugin information"""
    return {
        "name": "minimal-plugin",
        "version": "1.0.0",
        "description": "Minimal function plugin example"
    }

def register(app, **dependencies):
    """
    Plugin registration function
    
    Args:
        app: FastAPI application instance
        dependencies: Dependency services dictionary
    """
    # Get logging service
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Register routes
    app.include_router(router)
    
    logger.info("Minimal function plugin registered successfully")
    logger.debug(f"Available dependency services: {list(dependencies.keys())}")
```

```json
// plugins/yoapi_plugin_minimal/plugin.json
{
  "name": "yoapi_plugin_minimal",
  "version": "1.0.0",
  "description": "Minimal function plugin example",
  "author": "Developer Name",
  "priority": 50,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["minimal", "example", "template"]
}
```

```txt
# plugins/yoapi_plugin_minimal/requirements.txt
# Minimal dependencies example
fastapi>=0.104.0
```

## Complete Function Plugin Template

### API Service Plugin

```python
# plugins/yoapi_plugin_api_service/__init__.py
"""
Complete API service plugin example
Includes routes, services, models, and configuration management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import uuid
from datetime import datetime

from .models import User, UserCreate, UserUpdate
from .services import UserService
from .schemas import UserResponse

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends()
):
    """Get user list"""
    return await user_service.get_users(skip, limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends()
):
    """Create new user"""
    return await user_service.create_user(user_data)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    user_service: UserService = Depends()
):
    """Get specific user"""
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    user_data: UserUpdate,
    user_service: UserService = Depends()
):
    """Update user information"""
    user = await user_service.update_user(user_id, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    user_service: UserService = Depends()
):
    """Delete user"""
    success = await user_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

def register(app, **dependencies):
    """Register API service plugin"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Get database service
    db_service = dependencies.get('db_service')
    if not db_service:
        logger.error("Database service unavailable")
        raise RuntimeError("Missing database service dependency")
    
    # Initialize user service
    user_service = UserService(db_service)
    dependencies['user_service'] = user_service
    
    # Register routes
    app.include_router(router)
    
    logger.info("API user service plugin registered successfully")
```

```python
# plugins/yoapi_plugin_api_service/models.py
"""
Data model definitions
"""

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    """User data model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<User {self.username}>"
```

```python
# plugins/yoapi_plugin_api_service/schemas.py
"""
Pydantic model definitions
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime

class UserBase(BaseModel):
    """User base model"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """User creation model"""
    pass

class UserUpdate(BaseModel):
    """User update model"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """User response model"""
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

```python
# plugins/yoapi_plugin_api_service/services.py
"""
Business service layer
"""

from typing import List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from .models import User
from .schemas import UserCreate, UserUpdate

class UserService:
    """User service class"""
    
    def __init__(self, db_service):
        self.db_service = db_service
    
    async def get_session(self) -> AsyncSession:
        """Get database session"""
        return await self.db_service.get_session()
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get user list"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(User).offset(skip).limit(limit)
            )
            return result.scalars().all()
    
    async def get_user(self, user_id: uuid.UUID) -> Optional[User]:
        """Get specific user"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        async with await self.get_session() as session:
            user = User(**user_data.dict())
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user
    async def update_user(self, user_id: uuid.UUID, user_data: UserUpdate) -> Optional[User]:
        """Update user information"""
        async with await self.get_session() as session:
            # First check if user exists
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            # Update fields
            update_data = user_data.dict(exclude_unset=True)
            await session.execute(
                update(User)
                .where(User.id == user_id)
                .values(**update_data)
            )
            await session.commit()
            
            # Re-fetch updated user
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
    
    async def delete_user(self, user_id: uuid.UUID) -> bool:
        """Delete user"""
        async with await self.get_session() as session:
            result = await session.execute(
                delete(User).where(User.id == user_id)
            )
            await session.commit()
            return result.rowcount > 0
```

```json
// plugins/yoapi_plugin_api_service/plugin.json
{
  "name": "yoapi_plugin_api_service",
  "version": "1.0.0",
  "description": "Complete API service plugin example",
  "author": "Developer Name",
  "priority": 70,
  "dependencies": ["yoapi_plugin_log", "yoapi_plugin_database"],
  "tags": ["api", "service", "users", "crud"]
}
```

```txt
# plugins/yoapi_plugin_api_service/requirements.txt
# API service plugin dependencies
fastapi>=0.104.0
sqlalchemy>=2.0.0
asyncpg>=0.28.0
psycopg2-binary>=2.9.0
pydantic>=2.0.0
```

## Database Service Plugin Template

```python
# plugins/yoapi_plugin_database_service/__init__.py
"""
Database service plugin example
Provides database connection pool and basic CRUD operations
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import AsyncGenerator
import os

Base = declarative_base()

class DatabaseService:
    """Database service class"""
    
    def __init__(self, database_url: str):
        self.engine = create_async_engine(
            database_url,
            echo=False,  # Set to False in production
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            pool_recycle=1800,
        )
        self.async_session = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session"""
        async with self.async_session() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def create_tables(self):
        """Create database tables"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def drop_tables(self):
        """Drop database tables"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    async def health_check(self) -> bool:
        """Database health check"""
        try:
            async with self.engine.begin() as conn:
                await conn.execute("SELECT 1")
            return True
        except Exception:
            return False
    
    async def close(self):
        """Close database connections"""
        await self.engine.dispose()

def register(app, **dependencies):
    """Register database service plugin"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL environment variable not set")
        raise ValueError("Missing DATABASE_URL environment variable")
    
    # Initialize database service
    db_service = DatabaseService(database_url)
    dependencies['db_service'] = db_service
    
    logger.info("Database service plugin registered successfully")
    logger.debug(f"Database URL: {database_url}")
    
    # Return cleanup function (optional)
    async def cleanup():
        await db_service.close()
        logger.info("Database connections closed")
    
    return cleanup
```

```json
// plugins/yoapi_plugin_database_service/plugin.json
{
  "name": "yoapi_plugin_database_service",
  "version": "1.0.0",
  "description": "Database service plugin example",
  "author": "Developer Name",
  "priority": 90,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["database", "service", "sqlalchemy", "async"]
}
```

```txt
# plugins/yoapi_plugin_database_service/requirements.txt
# Database service plugin dependencies
sqlalchemy>=2.0.0
asyncpg>=0.28.0
aiosqlite>=0.19.0
```

## Authentication & Authorization Plugin Template

```python
# plugins/yoapi_plugin_auth_service/__init__.py
"""
Authentication & authorization plugin example
Provides JWT authentication and permission control
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os

from .models import User, Token, TokenData
from .schemas import UserCreate, UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Authentication service class"""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """User authentication"""
        # Should get user information from database here
        # Using hardcoded user for example
        fake_user = User(
            username="admin",
            hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret
            disabled=False
        )
        
        if username != fake_user.username:
            return None
        
        if not self.verify_password(password, fake_user.hashed_password):
            return None
        
        return fake_user
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> User:
        """Get current user"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
            token_data = TokenData(username=username)
        except JWTError:
            raise credentials_exception
        
        # Should get user information from database here
        user = await self.get_user(username=token_data.username)
        if user is None:
            raise credentials_exception
        return user
    
    async def get_user(self, username: str) -> Optional[User]:
        """Get user information"""
        # Example implementation, should query database in reality
        if username == "admin":
            return User(
                username="admin",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                disabled=False
            )
        return None

def register(app, **dependencies):
    """Register authentication service plugin"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Get secret key
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        logger.error("SECRET_KEY environment variable not set")
        raise ValueError("Missing SECRET_KEY environment variable")
    
    # Initialize authentication service
    auth_service = AuthService(secret_key)
    dependencies['auth_service'] = auth_service
    
    logger.info("Authentication service plugin registered successfully")
```

```python
# plugins/yoapi_plugin_auth_service/models.py
"""
Authentication-related data models
"""

from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    """User model"""
    username: str
    hashed_password: str
    disabled: Optional[bool] = False

class Token(BaseModel):
    """Token model"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Token data model"""
    username: Optional[str] = None
```

```python
# plugins/yoapi_plugin_auth_service/schemas.py
"""
Authentication-related Pydantic models
"""

from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    """User creation model"""
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    """User response model"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    disabled: bool = False
```

```json
// plugins/yoapi_plugin_auth_service/plugin.json
{
  "name": "yoapi_plugin_auth_service",
  "version": "1.0.0",
  "description": "Authentication & authorization service plugin example",
  "author": "Developer Name",
  "priority": 80,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["auth", "security", "jwt", "authentication"]
}
```

```txt
# plugins/yoapi_plugin_auth_service/requirements.txt
# Authentication service plugin dependencies
fastapi>=0.104.0
python-jose>=3.3.0
passlib>=1.7.4
bcrypt>=4.0.1
```

## Utility Plugin Template

### Utility Functions Plugin

```python
# plugins/yoapi_plugin_utils/__init__.py
"""
Utility plugin example
Provides general utility functions and helper services
"""

import hashlib
import json
from datetime import datetime
from typing import Any, Dict, List
import uuid

class UtilsService:
    """Utility service class"""
    
    def generate_uuid(self) -> str:
        """Generate UUID"""
        return str(uuid.uuid4())
    
    def hash_string(self, text: str, algorithm: str = "sha256") -> str:
        """Hash string"""
        hash_func = getattr(hashlib, algorithm, hashlib.sha256)
        return hash_func(text.encode()).hexdigest()
    
    def format_timestamp(self, timestamp: datetime = None) -> str:
        """Format timestamp"""
        if timestamp is None:
            timestamp = datetime.now()
        return timestamp.isoformat()
    
    def validate_json(self, json_str: str) -> bool:
        """Validate JSON string"""
        try:
            json.loads(json_str)
            return True
        except json.JSONDecodeError:
            return False
    
    def deep_merge(self, dict1: Dict, dict2: Dict) -> Dict:
        """Deep merge dictionaries"""
        result = dict1.copy()
        for key, value in dict2.items():
            if (key in result and isinstance(result[key], dict) 
                and isinstance(value, dict)):
                result[key] = self.deep_merge(result[key], value)
            else:
                result[key] = value
        return result

def register(app, **dependencies):
    """Register utility service plugin"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Initialize utility service
    utils_service = UtilsService()
    dependencies['utils_service'] = utils_service
    
    logger.info("Utility service plugin registered successfully")
```

```json
// plugins/yoapi_plugin_utils/plugin.json
{
  "name": "yoapi_plugin_utils",
  "version": "1.0.0",
  "description": "Utility plugin example",
  "author": "Developer Name",
  "priority": 40,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["utils", "tools", "helpers"]
}
```

```txt
# plugins/yoapi_plugin_utils/requirements.txt
# Utility plugin dependencies
# Utility plugins typically don't need additional dependencies
```

## Usage Examples

### Using Other Services in Plugins

```python
# Example: Using database and utility services in API plugin
@router.post("/users")
async def create_user(
    user_data: UserCreate,
    db_service: DatabaseService = Depends(),
    utils_service: UtilsService = Depends()
):
    """Create user using utility service"""
    # Generate user ID
    user_id = utils_service.generate_uuid()
    
    # Hash password
    hashed_password = utils_service.hash_string(user_data.password)
    
    # Save to database
    async with await db_service.get_session() as session:
        user = User(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    
    return {"message": "User created successfully", "user_id": user_id}
```

These example templates cover various common scenarios for WaveYo-API plugin development. You can modify and extend them based on your actual requirements.