---
sidebar_position: 2
---

# Plugin Types Explained

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

WaveYo-API supports various types of plugins, each with specific purposes and development specifications.

## 1. API Endpoint Plugins

### Purpose
Provide RESTful API endpoints to handle HTTP requests and responses.

### File Structure
```
plugins/
└── yoapi_plugin_demoapi/
    ├── __init__.py          # Main file, must contain register function
    ├── plugin.json          # Plugin metadata file
    ├── requirements.txt     # Plugin dependencies
    ├── .env                # Plugin environment variables (optional)
    └── routers/            # Sub-routers (optional)
        └── v1.py
```

### Code Example

```python
# plugins/yoapi_plugin_demoapi/__init__.py
from fastapi import APIRouter, Depends, HTTPException, status
from plugins.log import get_log_service

router = APIRouter(prefix="/api", tags=["demo-api"])

@router.get("/items")
async def get_items():
    """Get item list"""
    return {"items": ["item1", "item2", "item3"]}

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    """Get item details by ID"""
    if item_id > 100:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return {"item_id": item_id, "name": f"Item {item_id}"}

@router.post("/items")
async def create_item(name: str):
    """Create new item"""
    return {"message": f"Item '{name}' created", "id": 123}

def register(app, **dependencies):
    # Get logging service
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    app.include_router(router)
    logger.info("API endpoint plugin registered")
    logger.debug(f"Registered routes: {[route.path for route in router.routes]}")
```

## 2. Database Service Plugins

### Purpose
Provide database connections and CRUD operation services.

### File Structure
```
plugins/
└── yoapi_plugin_demodb/
    ├── __init__.py
    ├── plugin.json          # Plugin metadata file
    ├── requirements.txt
    ├── .env
    ├── models.py           # Data models
    └── services.py         # Service classes
```

### Code Example

```python
# plugins/yoapi_plugin_demodb/__init__.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.env_validator import get_env_validator, EnvVarType

class DatabaseService:
    def __init__(self, db_url: str):
        self.engine = create_async_engine(db_url, echo=True)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
    
    async def get_session(self):
        """Get database session"""
        async with self.async_session() as session:
            yield session

def register(app, **dependencies):
    # Use environment variable validation framework
    validator = get_env_validator()
    env_schema = {
        "DB_URL": {
            "type": EnvVarType.STRING,
            "required": True,
            "description": "Database connection URL"
        },
        "MAX_CONNECTIONS": {
            "type": EnvVarType.INTEGER,
            "required": False,
            "default": 10,
            "min": 1,
            "max": 100,
            "description": "Maximum connections"
        }
    }
    
    try:
        env_vars = validator.validate_env_vars("demodb", env_schema)
        db_url = env_vars["DB_URL"]
        max_connections = env_vars["MAX_CONNECTIONS"]
    except ValueError as e:
        log_service = dependencies.get('log_service')
        logger = log_service.get_logger(__name__)
        logger.error(f"Environment variable validation failed: {e}")
        raise
    
    # Create database service
    db_service = DatabaseService(db_url)
    dependencies['db_service'] = db_service
    
    logger = dependencies.get('log_service').get_logger(__name__)
    logger.info(f"Database service plugin loaded, max connections: {max_connections}")
```

## 3. Authentication & Authorization Plugins

### Purpose
Provide non-intrusive security controls and permission management.

### File Structure
```
plugins/
└── yoapi_plugin_demoauth/
    ├── __init__.py
    ├── plugin.json          # Plugin metadata file
    ├── requirements.txt
    ├── .env
    ├── middleware.py       # Authentication middleware
    └── services.py         # Authentication services
```

### Code Example

```python
# plugins/yoapi_plugin_demoauth/__init__.py
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from core.env_validator import get_env_validator, EnvVarType

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def api_key_auth(api_key: str = Depends(api_key_header)):
    """API key authentication"""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key missing"
        )
    
    # Use environment variable validation framework
    validator = get_env_validator()
    env_schema = {
        "VALID_API_KEY": {
            "type": EnvVarType.STRING,
            "required": True,
            "description": "Valid API key"
        }
    }
    
    try:
        env_vars = validator.validate_env_vars("demoauth", env_schema)
        valid_api_key = env_vars["VALID_API_KEY"]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error"
        )
    
    if api_key != valid_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return api_key

def register(app, **dependencies):
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Add dependency to routes requiring authentication
    exempt_paths = ['/health', '/docs', '/openapi.json', '/']
    
    for route in app.routes:
        if (hasattr(route, 'path') and 
            hasattr(route, 'dependencies') and
            not any(exempt_path in route.path for exempt_path in exempt_paths)):
            route.dependencies.insert(0, Depends(api_key_auth))
    
    logger.info("Authentication plugin loaded, authentication added to protected routes")
```

## 4. Utility Plugins

### Purpose
Provide general utility functions and auxiliary services.

### File Structure
```
plugins/
└── yoapi_plugin_utils/
    ├── __init__.py
    ├── plugin.json          # Plugin metadata file
    ├── requirements.txt
    ├── .env
    └── tools.py           # Utility functions
```

### Code Example

```python
# plugins/yoapi_plugin_utils/__init__.py
import hashlib
import json
from datetime import datetime, timedelta
from typing import Any, Dict

class UtilityService:
    def __init__(self):
        self.cache: Dict[str, Any] = {}
    
    def generate_hash(self, data: str) -> str:
        """Generate SHA256 hash"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def json_serializer(self, obj: Any) -> str:
        """JSON serializer utility"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
    
    def cache_get(self, key: str, default: Any = None) -> Any:
        """Get data from cache"""
        return self.cache.get(key, default)
    
    def cache_set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Set cached data"""
        self.cache[key] = {
            'value': value,
            'expires': datetime.now() + timedelta(seconds=ttl)
        }

def register(app, **dependencies):
    utility_service = UtilityService()
    dependencies['utility_service'] = utility_service
    
    logger = dependencies.get('log_service').get_logger(__name__)
    logger.info("Utility service plugin loaded")
```

## Choosing the Right Plugin Type

| Plugin Type | Use Case | Complexity | Dependencies |
|---------|---------|--------|----------|
| API Endpoint Plugins | Provide REST APIs | Low-Medium | May depend on database, auth services |
| Database Service Plugins | Data persistence | Medium-High | Database drivers, connection pools |
| Authentication Plugins | Security control | Medium | May depend on user services, token services |
| Utility Plugins | General functionality | Low | Usually no external dependencies |

Choose the appropriate plugin type based on your requirements and follow the corresponding development specifications.