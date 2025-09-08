---
sidebar_position: 5
---

# Best Practices Guide

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

This document provides best practices and recommendations for WaveYo-API plugin development, helping you write high-quality, maintainable plugin code.

## Error Handling

### Exception Handling Best Practices

```python
def register(app, **dependencies):
    try:
        # Get logging service
        log_service = dependencies.get('log_service')
        logger = log_service.get_logger(__name__)
        
        # Plugin initialization logic
        validator = get_env_validator()
        env_schema = {
            "API_KEY": {
                "type": EnvVarType.STRING,
                "required": True,
                "description": "API key"
            }
        }
        
        env_vars = validator.validate_env_vars("my-plugin", env_schema)
        api_key = env_vars["API_KEY"]
        
        # Register routes and services
        app.include_router(router)
        
        logger.info("Plugin initialized successfully")
        
    except ValueError as e:
        # Environment variable validation failed
        logger.error(f"Environment variable validation failed: {e}")
        raise PluginInitializationError(f"Environment variable configuration error: {e}")
        
    except DependencyError as e:
        # Dependency service unavailable
        logger.error(f"Dependency service unavailable: {e}")
        raise PluginInitializationError(f"Missing dependency service: {e}")
        
    except Exception as e:
        # Other unknown errors
        logger.critical(f"Unknown error occurred during plugin initialization: {e}")
        raise PluginInitializationError(f"Initialization failed: {e}")
```

### Custom Exception Classes

```python
class PluginInitializationError(Exception):
    """Plugin initialization failure exception"""
    pass

class DependencyError(Exception):
    """Dependency service error exception"""
    pass

class ConfigurationError(Exception):
    """Configuration error exception"""
    pass
```

## Performance Optimization

### Asynchronous Programming Patterns

```python
# Correct: Use async functions
@router.get("/data")
async def get_data():
    # Asynchronous database operation
    data = await fetch_data_async()
    return {"data": data}

# Incorrect: Using synchronous blocking operations in async functions
@router.get("/data-slow")
async def get_data_slow():
    # This blocks the event loop
    data = fetch_data_sync()  # Synchronous operation
    return {"data": data}
```

### Caching Strategies

```python
from functools import lru_cache
import asyncio

# In-memory caching
@lru_cache(maxsize=128)
def get_config_value(key):
    # Expensive configuration read operation
    return read_config(key)

# Async caching pattern
cache = {}

async def get_cached_data(key, ttl=300):
    """Async caching with TTL"""
    if key in cache:
        cached_data, expiry = cache[key]
        if time.time() < expiry:
            return cached_data
    
    # Cache miss or expired
    data = await fetch_expensive_data(key)
    cache[key] = (data, time.time() + ttl)
    return data
```

### Connection Pool Management

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

## Security

### Input Validation

```python
from pydantic import BaseModel, constr, conint
from fastapi import HTTPException

class UserCreateRequest(BaseModel):
    username: constr(min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')
    email: constr(pattern=r'^[^@]+@[^@]+\.[^@]+$')
    age: conint(gt=0, lt=150)

@router.post("/users")
async def create_user(user: UserCreateRequest):
    # Input already validated by Pydantic
    # Business logic processing
    return {"message": "User created successfully"}
```

### Sensitive Information Handling

```python
import os
from cryptography.fernet import Fernet

class SecureConfig:
    def __init__(self):
        # Get encryption key from environment variables
        key = os.getenv('CONFIG_ENCRYPTION_KEY')
        if not key:
            raise ConfigurationError("Encryption key not configured")
        
        self.cipher = Fernet(key.encode())
    
    def encrypt_value(self, value):
        """Encrypt sensitive data"""
        return self.cipher.encrypt(value.encode()).decode()
    
    def decrypt_value(self, encrypted_value):
        """Decrypt sensitive data"""
        return self.cipher.decrypt(encrypted_value.encode()).decode()
```

### Permission Control

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Validate token and get user information
    user = await validate_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def require_admin(user: dict = Depends(get_current_user)):
    """Require admin privileges"""
    if user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user
```

## Code Quality

### Code Organization

```python
# Recommended file structure
plugins/yoapi_plugin_my_service/
├── __init__.py          # Main entry, register function
├── plugin.json          # Metadata
├── requirements.txt     # Dependencies
├── models.py           # Data models
├── schemas.py          # Pydantic models
├── services.py         # Business services
├── routers.py          # API routes
├── middleware.py       # Middleware
├── utils.py           # Utility functions
└── exceptions.py       # Custom exceptions
```

### Type Annotations

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
    """Get user list, return clearly typed dictionary"""
    users = await user_service.get_users(page, limit)
    return {"users": users, "total": len(users)}

async def stream_data() -> AsyncGenerator[bytes, None]:
    """Async generator with clear return type"""
    async for chunk in data_source.stream():
        yield chunk
```

### Unit Testing

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
    """Test plugin registration functionality"""
    mock_logger = AsyncMock()
    dependencies = {'log_service': mock_logger}
    
    # Import and test register function
    from plugins.yoapi_plugin_my_service import register
    
    app = FastAPI()
    register(app, **dependencies)
    
    # Verify logger was called
    mock_logger.get_logger.assert_called_once()
    mock_logger.info.assert_called_with("Plugin registered successfully")
```

## Monitoring and Logging

### Structured Logging

```python
import json
from datetime import datetime

def structured_log(logger, level: str, message: str, **context):
    """Generate structured logs"""
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
    # Other levels...

# Usage example
structured_log(
    logger, 
    "info", 
    "User registered successfully", 
    user_id=123, 
    email="user@example.com",
    registration_time="2024-01-15T10:30:00"
)
```

### Performance Monitoring

```python
import time
from prometheus_client import Counter, Histogram

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['endpoint'])

@router.get("/api/data")
async def get_data():
    start_time = time.time()
    
    try:
        # Business logic
        data = await fetch_data()
        REQUEST_COUNT.labels(method='GET', endpoint='/api/data').inc()
        
        return {"data": data}
    finally:
        duration = time.time() - start_time
        REQUEST_DURATION.labels(endpoint='/api/data').observe(duration)
```

## Deployment Considerations

### Configuration Management

```python
class ConfigManager:
    def __init__(self):
        self.config = {}
        self.watchers = []
    
    async def load_config(self):
        """Async configuration loading"""
        # Load from multiple sources: env vars, config files, remote config centers, etc.
        self.config.update(await self._load_from_env())
        self.config.update(await self._load_from_file())
        self.config.update(await self._load_from_remote())
    
    def get(self, key, default=None):
        """Safely get configuration value"""
        return self.config.get(key, default)
    
    def watch(self, key, callback):
        """Watch for configuration changes"""
        self.watchers.append((key, callback))
```

### Health Checks

```python
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "dependencies": await check_dependencies()
    }
    
    # Check critical dependencies
    if not await check_database():
        health_status["status"] = "degraded"
        health_status["database"] = "unavailable"
    
    return health_status

async def check_dependencies():
    """Check status of plugin dependency services"""
    dependencies_status = {}
    
    # Check database connection
    try:
        await database.ping()
        dependencies_status["database"] = "healthy"
    except Exception as e:
        dependencies_status["database"] = f"unhealthy: {e}"
    
    # Check other dependencies...
    return dependencies_status
```

Following these best practices will help you develop high-quality, maintainable, and secure WaveYo-API plugins.