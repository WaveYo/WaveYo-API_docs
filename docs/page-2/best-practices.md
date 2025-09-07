---
sidebar_position: 5
---

# 最佳实践指南

本文档提供WaveYo-API插件开发的最佳实践和建议，帮助您编写高质量、可维护的插件代码。

## 错误处理

### 异常处理最佳实践

```python
def register(app, **dependencies):
    try:
        # 获取日志服务
        log_service = dependencies.get('log_service')
        logger = log_service.get_logger(__name__)
        
        # 插件初始化逻辑
        validator = get_env_validator()
        env_schema = {
            "API_KEY": {
                "type": EnvVarType.STRING,
                "required": True,
                "description": "API密钥"
            }
        }
        
        env_vars = validator.validate_env_vars("my-plugin", env_schema)
        api_key = env_vars["API_KEY"]
        
        # 注册路由和服务
        app.include_router(router)
        
        logger.info("插件初始化成功")
        
    except ValueError as e:
        # 环境变量验证失败
        logger.error(f"环境变量验证失败: {e}")
        raise PluginInitializationError(f"环境变量配置错误: {e}")
        
    except DependencyError as e:
        # 依赖服务不可用
        logger.error(f"依赖服务不可用: {e}")
        raise PluginInitializationError(f"依赖服务缺失: {e}")
        
    except Exception as e:
        # 其他未知错误
        logger.critical(f"插件初始化过程中发生未知错误: {e}")
        raise PluginInitializationError(f"初始化失败: {e}")
```

### 自定义异常类

```python
class PluginInitializationError(Exception):
    """插件初始化失败异常"""
    pass

class DependencyError(Exception):
    """依赖服务错误异常"""
    pass

class ConfigurationError(Exception):
    """配置错误异常"""
    pass
```

## 性能优化

### 异步编程模式

```python
# 正确：使用异步函数
@router.get("/data")
async def get_data():
    # 异步数据库操作
    data = await fetch_data_async()
    return {"data": data}

# 错误：在异步函数中使用同步阻塞操作
@router.get("/data-slow")
async def get_data_slow():
    # 这会阻塞事件循环
    data = fetch_data_sync()  # 同步操作
    return {"data": data}
```

### 缓存策略

```python
from functools import lru_cache
import asyncio

# 内存缓存
@lru_cache(maxsize=128)
def get_config_value(key):
    # 昂贵的配置读取操作
    return read_config(key)

# 异步缓存模式
cache = {}

async def get_cached_data(key, ttl=300):
    """带TTL的异步缓存"""
    if key in cache:
        cached_data, expiry = cache[key]
        if time.time() < expiry:
            return cached_data
    
    # 缓存未命中或已过期
    data = await fetch_expensive_data(key)
    cache[key] = (data, time.time() + ttl)
    return data
```

### 连接池管理

```python
class DatabaseConnectionPool:
    def __init__(self, max_connections=10):
        self.semaphore = asyncio.Semaphore(max_connections)
        self.connections = []
    
    async def get_connection(self):
        async with self.semaphore:
            if self.connections:
                return self.connections.pop()
            else:
                return await create_new_connection()
    
    async def release_connection(self, conn):
        self.connections.append(conn)
```

## 安全性

### 输入验证

```python
from pydantic import BaseModel, constr, conint
from fastapi import HTTPException

class UserCreateRequest(BaseModel):
    username: constr(min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')
    email: constr(pattern=r'^[^@]+@[^@]+\.[^@]+$')
    age: conint(gt=0, lt=150)

@router.post("/users")
async def create_user(user: UserCreateRequest):
    # 输入已通过Pydantic验证
    # 业务逻辑处理
    return {"message": "用户创建成功"}
```

### 敏感信息处理

```python
import os
from cryptography.fernet import Fernet

class SecureConfig:
    def __init__(self):
        # 从环境变量获取加密密钥
        key = os.getenv('CONFIG_ENCRYPTION_KEY')
        if not key:
            raise ConfigurationError("加密密钥未配置")
        
        self.cipher = Fernet(key.encode())
    
    def encrypt_value(self, value):
        """加密敏感数据"""
        return self.cipher.encrypt(value.encode()).decode()
    
    def decrypt_value(self, encrypted_value):
        """解密敏感数据"""
        return self.cipher.decrypt(encrypted_value.encode()).decode()
```

### 权限控制

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 验证token并获取用户信息
    user = await validate_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def require_admin(user: dict = Depends(get_current_user)):
    """要求管理员权限"""
    if user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return user
```

## 代码质量

### 代码组织

```python
# 推荐的文件结构
plugins/yoapi_plugin_my_service/
├── __init__.py          # 主入口，注册函数
├── plugin.json          # 元数据
├── requirements.txt     # 依赖
├── models.py           # 数据模型
├── schemas.py          # Pydantic模型
├── services.py         # 业务服务
├── routers.py          # API路由
├── middleware.py       # 中间件
├── utils.py           # 工具函数
└── exceptions.py       # 自定义异常
```

### 类型注解

```python
from typing import List, Dict, Optional, AsyncGenerator
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

async def get_users(
    page: int = 1, 
    limit: int = 10
) -> Dict[str, List[User]]:
    """获取用户列表，返回类型明确的字典"""
    users = await user_service.get_users(page, limit)
    return {"users": users, "total": len(users)}

async def stream_data() -> AsyncGenerator[bytes, None]:
    """异步生成器，明确返回类型"""
    async for chunk in data_source.stream():
        yield chunk
```

### 单元测试

```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

@pytest.fixture
def test_client():
    from main import create_app
    app = create_app()
    return TestClient(app)

@pytest.mark.asyncio
async def test_plugin_registration():
    """测试插件注册功能"""
    mock_logger = AsyncMock()
    dependencies = {'log_service': mock_logger}
    
    # 导入并测试register函数
    from plugins.yoapi_plugin_my_service import register
    
    app = FastAPI()
    register(app, **dependencies)
    
    # 验证日志被调用
    mock_logger.get_logger.assert_called_once()
    mock_logger.info.assert_called_with("插件已成功注册")
```

## 监控和日志

### 结构化日志

```python
import json
from datetime import datetime

def structured_log(logger, level: str, message: str, **context):
    """生成结构化日志"""
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "level": level.upper(),
        "message": message,
        "plugin": "my_plugin",
        **context
    }
    
    if level == "info":
        logger.info(json.dumps(log_data))
    elif level == "error":
        logger.error(json.dumps(log_data))
    # 其他级别...

# 使用示例
structured_log(
    logger, 
    "info", 
    "用户注册成功", 
    user_id=123, 
    email="user@example.com",
    registration_time="2024-01-15T10:30:00"
)
```

### 性能监控

```python
import time
from prometheus_client import Counter, Histogram

# 定义指标
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['endpoint'])

@router.get("/api/data")
async def get_data():
    start_time = time.time()
    
    try:
        # 业务逻辑
        data = await fetch_data()
        REQUEST_COUNT.labels(method='GET', endpoint='/api/data').inc()
        
        return {"data": data}
    finally:
        duration = time.time() - start_time
        REQUEST_DURATION.labels(endpoint='/api/data').observe(duration)
```

## 部署考虑

### 配置管理

```python
class ConfigManager:
    def __init__(self):
        self.config = {}
        self.watchers = []
    
    async def load_config(self):
        """异步加载配置"""
        # 从多种源加载配置：环境变量、配置文件、远程配置中心等
        self.config.update(await self._load_from_env())
        self.config.update(await self._load_from_file())
        self.config.update(await self._load_from_remote())
    
    def get(self, key, default=None):
        """安全获取配置值"""
        return self.config.get(key, default)
    
    def watch(self, key, callback):
        """监听配置变化"""
        self.watchers.append((key, callback))
```

### 健康检查

```python
@router.get("/health")
async def health_check():
    """健康检查端点"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "dependencies": await check_dependencies()
    }
    
    # 检查关键依赖
    if not await check_database():
        health_status["status"] = "degraded"
        health_status["database"] = "unavailable"
    
    return health_status

async def check_dependencies():
    """检查插件依赖的服务状态"""
    dependencies_status = {}
    
    # 检查数据库连接
    try:
        await database.ping()
        dependencies_status["database"] = "healthy"
    except Exception as e:
        dependencies_status["database"] = f"unhealthy: {e}"
    
    # 检查其他依赖...
    return dependencies_status
```

遵循这些最佳实践将帮助您开发出高质量、可维护且安全的WaveYo-API插件。
