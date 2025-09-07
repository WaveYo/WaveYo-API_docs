---
sidebar_position: 6
---

# 插件示例模板

本文档提供WaveYo-API插件的完整示例模板，涵盖各种常见场景，帮助您快速开始插件开发。

## 基础插件模板

### 最小功能插件

```python
# plugins/yoapi_plugin_minimal/__init__.py
"""
最小功能插件示例
提供基础的API端点功能
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/ping")
async def ping() -> Dict[str, str]:
    """健康检查端点"""
    return {"message": "pong"}

@router.get("/info")
async def get_info() -> Dict[str, Any]:
    """获取插件信息"""
    return {
        "name": "minimal-plugin",
        "version": "1.0.0",
        "description": "最小功能插件示例"
    }

def register(app, **dependencies):
    """
    插件注册函数
    
    Args:
        app: FastAPI应用实例
        dependencies: 依赖服务字典
    """
    # 获取日志服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 注册路由
    app.include_router(router)
    
    logger.info("最小功能插件已成功注册")
    logger.debug(f"可用依赖服务: {list(dependencies.keys())}")
```

```json
// plugins/yoapi_plugin_minimal/plugin.json
{
  "name": "yoapi_plugin_minimal",
  "version": "1.0.0",
  "description": "最小功能插件示例",
  "author": "开发者名称",
  "priority": 50,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["minimal", "example", "template"]
}
```

```txt
# plugins/yoapi_plugin_minimal/requirements.txt
# 最小依赖示例
fastapi>=0.104.0
```

## 完整功能插件模板

### API服务插件

```python
# plugins/yoapi_plugin_api_service/__init__.py
"""
完整API服务插件示例
包含路由、服务、模型和配置管理
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
    """获取用户列表"""
    return await user_service.get_users(skip, limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends()
):
    """创建新用户"""
    return await user_service.create_user(user_data)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    user_service: UserService = Depends()
):
    """获取指定用户"""
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    user_data: UserUpdate,
    user_service: UserService = Depends()
):
    """更新用户信息"""
    user = await user_service.update_user(user_id, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    user_service: UserService = Depends()
):
    """删除用户"""
    success = await user_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

def register(app, **dependencies):
    """注册API服务插件"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 获取数据库服务
    db_service = dependencies.get('db_service')
    if not db_service:
        logger.error("数据库服务不可用")
        raise RuntimeError("数据库服务依赖缺失")
    
    # 初始化用户服务
    user_service = UserService(db_service)
    dependencies['user_service'] = user_service
    
    # 注册路由
    app.include_router(router)
    
    logger.info("API用户服务插件已成功注册")
```

```python
# plugins/yoapi_plugin_api_service/models.py
"""
数据模型定义
"""

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    """用户数据模型"""
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
Pydantic模型定义
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime

class UserBase(BaseModel):
    """用户基础模型"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """用户创建模型"""
    pass

class UserUpdate(BaseModel):
    """用户更新模型"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """用户响应模型"""
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
业务服务层
"""

from typing import List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from .models import User
from .schemas import UserCreate, UserUpdate

class UserService:
    """用户服务类"""
    
    def __init__(self, db_service):
        self.db_service = db_service
    
    async def get_session(self) -> AsyncSession:
        """获取数据库会话"""
        return await self.db_service.get_session()
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """获取用户列表"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(User).offset(skip).limit(limit)
            )
            return result.scalars().all()
    
    async def get_user(self, user_id: uuid.UUID) -> Optional[User]:
        """获取指定用户"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
    
    async def create_user(self, user_data: UserCreate) -> User:
        """创建新用户"""
        async with await self.get_session() as session:
            user = User(**user_data.dict())
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user
    
    async def update_user(self, user_id: uuid.UUID, user_data: UserUpdate) -> Optional[User]:
        """更新用户信息"""
        async with await self.get_session() as session:
            # 先检查用户是否存在
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                return None
            
            # 更新字段
            update_data = user_data.dict(exclude_unset=True)
            await session.execute(
                update(User)
                .where(User.id == user_id)
                .values(**update_data)
            )
            await session.commit()
            
            # 重新获取更新后的用户
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
    
    async def delete_user(self, user_id: uuid.UUID) -> bool:
        """删除用户"""
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
  "description": "完整的API服务插件示例",
  "author": "开发者名称",
  "priority": 70,
  "dependencies": ["yoapi_plugin_log", "yoapi_plugin_database"],
  "tags": ["api", "service", "users", "crud"]
}
```

```txt
# plugins/yoapi_plugin_api_service/requirements.txt
# API服务插件依赖
fastapi>=0.104.0
sqlalchemy>=2.0.0
asyncpg>=0.28.0
psycopg2-binary>=2.9.0
pydantic>=2.0.0
```

## 数据库服务插件模板

```python
# plugins/yoapi_plugin_database_service/__init__.py
"""
数据库服务插件示例
提供数据库连接池和基础CRUD操作
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import AsyncGenerator
import os

Base = declarative_base()

class DatabaseService:
    """数据库服务类"""
    
    def __init__(self, database_url: str):
        self.engine = create_async_engine(
            database_url,
            echo=False,  # 生产环境设置为False
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
        """获取数据库会话"""
        async with self.async_session() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def create_tables(self):
        """创建数据库表"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def drop_tables(self):
        """删除数据库表"""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    async def health_check(self) -> bool:
        """数据库健康检查"""
        try:
            async with self.engine.begin() as conn:
                await conn.execute("SELECT 1")
            return True
        except Exception:
            return False
    
    async def close(self):
        """关闭数据库连接"""
        await self.engine.dispose()

def register(app, **dependencies):
    """注册数据库服务插件"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 获取数据库URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL环境变量未设置")
        raise ValueError("DATABASE_URL环境变量缺失")
    
    # 初始化数据库服务
    db_service = DatabaseService(database_url)
    dependencies['db_service'] = db_service
    
    logger.info("数据库服务插件已成功注册")
    logger.debug(f"数据库URL: {database_url}")
    
    # 返回清理函数（可选）
    async def cleanup():
        await db_service.close()
        logger.info("数据库连接已关闭")
    
    return cleanup
```

```json
// plugins/yoapi_plugin_database_service/plugin.json
{
  "name": "yoapi_plugin_database_service",
  "version": "1.0.0",
  "description": "数据库服务插件示例",
  "author": "开发者名称",
  "priority": 90,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["database", "service", "sqlalchemy", "async"]
}
```

```txt
# plugins/yoapi_plugin_database_service/requirements.txt
# 数据库服务插件依赖
sqlalchemy>=2.0.0
asyncpg>=0.28.0
aiosqlite>=0.19.0
```

## 认证授权插件模板

```python
# plugins/yoapi_plugin_auth_service/__init__.py
"""
认证授权插件示例
提供JWT认证和权限控制
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
    """认证服务类"""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """生成密码哈希"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """创建访问令牌"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """用户认证"""
        # 这里应该从数据库获取用户信息
        # 示例中使用硬编码用户
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
        """获取当前用户"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
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
        
        # 这里应该从数据库获取用户信息
        user = await self.get_user(username=token_data.username)
        if user is None:
            raise credentials_exception
        return user
    
    async def get_user(self, username: str) -> Optional[User]:
        """获取用户信息"""
        # 示例实现，实际应该查询数据库
        if username == "admin":
            return User(
                username="admin",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
                disabled=False
            )
        return None

def register(app, **dependencies):
    """注册认证服务插件"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 获取密钥
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        logger.error("SECRET_KEY环境变量未设置")
        raise ValueError("SECRET_KEY环境变量缺失")
    
    # 初始化认证服务
    auth_service = AuthService(secret_key)
    dependencies['auth_service'] = auth_service
    
    logger.info("认证服务插件已成功注册")
```

```python
# plugins/yoapi_plugin_auth_service/models.py
"""
认证相关数据模型
"""

from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    """用户模型"""
    username: str
    hashed_password: str
    disabled: Optional[bool] = False

class Token(BaseModel):
    """令牌模型"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """令牌数据模型"""
    username: Optional[str] = None

```python
# plugins/yoapi_plugin_auth_service/schemas.py
"""
认证相关Pydantic模型
"""

from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    """用户创建模型"""
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    """用户响应模型"""
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
  "description": "认证授权服务插件示例",
  "author": "开发者名称",
  "priority": 80,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["auth", "security", "jwt", "authentication"]
}
```

```txt
# plugins/yoapi_plugin_auth_service/requirements.txt
# 认证服务插件依赖
fastapi>=0.104.0
python-jose>=3.3.0
passlib>=1.7.4
bcrypt>=4.0.1
```

## 工具类插件模板

### 工具函数插件

```python
# plugins/yoapi_plugin_utils/__init__.py
"""
工具类插件示例
提供通用工具函数和辅助服务
"""

import hashlib
import json
from datetime import datetime
from typing import Any, Dict, List
import uuid

class UtilsService:
    """工具服务类"""
    
    def generate_uuid(self) -> str:
        """生成UUID"""
        return str(uuid.uuid4())
    
    def hash_string(self, text: str, algorithm: str = "sha256") -> str:
        """哈希字符串"""
        hash_func = getattr(hashlib, algorithm, hashlib.sha256)
        return hash_func(text.encode()).hexdigest()
    
    def format_timestamp(self, timestamp: datetime = None) -> str:
        """格式化时间戳"""
        if timestamp is None:
            timestamp = datetime.now()
        return timestamp.isoformat()
    
    def validate_json(self, json_str: str) -> bool:
        """验证JSON字符串"""
        try:
            json.loads(json_str)
            return True
        except json.JSONDecodeError:
            return False
    
    def deep_merge(self, dict1: Dict, dict2: Dict) -> Dict:
        """深度合并字典"""
        result = dict1.copy()
        for key, value in dict2.items():
            if (key in result and isinstance(result[key], dict) 
                and isinstance(value, dict)):
                result[key] = self.deep_merge(result[key], value)
            else:
                result[key] = value
        return result

def register(app, **dependencies):
    """注册工具服务插件"""
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 初始化工具服务
    utils_service = UtilsService()
    dependencies['utils_service'] = utils_service
    
    logger.info("工具服务插件已成功注册")
```

```json
// plugins/yoapi_plugin_utils/plugin.json
{
  "name": "yoapi_plugin_utils",
  "version": "1.0.0",
  "description": "工具类插件示例",
  "author": "开发者名称",
  "priority": 40,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["utils", "tools", "helpers"]
}
```

```txt
# plugins/yoapi_plugin_utils/requirements.txt
# 工具类插件依赖
# 通常工具类插件不需要额外依赖
```

## 使用示例

### 在插件中使用其他服务

```python
# 示例：在API插件中使用数据库和工具服务
@router.post("/users")
async def create_user(
    user_data: UserCreate,
    db_service: DatabaseService = Depends(),
    utils_service: UtilsService = Depends()
):
    """创建用户并使用工具服务"""
    # 生成用户ID
    user_id = utils_service.generate_uuid()
    
    # 哈希密码
    hashed_password = utils_service.hash_string(user_data.password)
    
    # 保存到数据库
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
    
    return {"message": "用户创建成功", "user_id": user_id}
```

这些示例模板涵盖了WaveYo-API插件开发的各种常见场景，您可以根据实际需求进行修改和扩展。
