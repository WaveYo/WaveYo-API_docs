---
sidebar_position: 2
---

# 插件类型详解

WaveYo-API 支持多种类型的插件，每种类型都有特定的用途和开发规范。

## 1. API端点插件

### 用途
提供RESTful API端点，处理HTTP请求和响应。

### 文件结构
```
plugins/
└── yoapi_plugin_demoapi/
    ├── __init__.py          # 主文件，必须包含register函数
    ├── plugin.json          # 插件元数据文件
    ├── requirements.txt     # 插件依赖
    ├── .env                # 插件环境变量（可选）
    └── routers/            # 子路由（可选）
        └── v1.py
```

### 代码示例

```python
# plugins/yoapi_plugin_demoapi/__init__.py
from fastapi import APIRouter, Depends, HTTPException, status
from plugins.log import get_log_service

router = APIRouter(prefix="/api", tags=["demo-api"])

@router.get("/items")
async def get_items():
    """获取项目列表"""
    return {"items": ["item1", "item2", "item3"]}

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    """根据ID获取项目详情"""
    if item_id > 100:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return {"item_id": item_id, "name": f"Item {item_id}"}

@router.post("/items")
async def create_item(name: str):
    """创建新项目"""
    return {"message": f"Item '{name}' created", "id": 123}

def register(app, **dependencies):
    # 获取日志服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    app.include_router(router)
    logger.info("API端点插件已注册")
    logger.debug(f"注册的路由: {[route.path for route in router.routes]}")
```

## 2. 数据库服务插件

### 用途
提供数据库连接和CRUD操作服务。

### 文件结构
```
plugins/
└── yoapi_plugin_demodb/
    ├── __init__.py
    ├── plugin.json          # 插件元数据文件
    ├── requirements.txt
    ├── .env
    ├── models.py           # 数据模型
    └── services.py         # 服务类
```

### 代码示例

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
        """获取数据库会话"""
        async with self.async_session() as session:
            yield session

def register(app, **dependencies):
    # 使用环境变量验证框架
    validator = get_env_validator()
    env_schema = {
        "DB_URL": {
            "type": EnvVarType.STRING,
            "required": True,
            "description": "数据库连接URL"
        },
        "MAX_CONNECTIONS": {
            "type": EnvVarType.INTEGER,
            "required": False,
            "default": 10,
            "min": 1,
            "max": 100,
            "description": "最大连接数"
        }
    }
    
    try:
        env_vars = validator.validate_env_vars("demodb", env_schema)
        db_url = env_vars["DB_URL"]
        max_connections = env_vars["MAX_CONNECTIONS"]
    except ValueError as e:
        log_service = dependencies.get('log_service')
        logger = log_service.get_logger(__name__)
        logger.error(f"环境变量验证失败: {e}")
        raise
    
    # 创建数据库服务
    db_service = DatabaseService(db_url)
    dependencies['db_service'] = db_service
    
    logger = dependencies.get('log_service').get_logger(__name__)
    logger.info(f"数据库服务插件已加载，最大连接数: {max_connections}")
```

## 3. 认证授权插件

### 用途
提供无侵入式的安全控制和权限管理。

### 文件结构
```
plugins/
└── yoapi_plugin_demoauth/
    ├── __init__.py
    ├── plugin.json          # 插件元数据文件
    ├── requirements.txt
    ├── .env
    ├── middleware.py       # 认证中间件
    └── services.py         # 认证服务
```

### 代码示例

```python
# plugins/yoapi_plugin_demoauth/__init__.py
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from core.env_validator import get_env_validator, EnvVarType

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def api_key_auth(api_key: str = Depends(api_key_header)):
    """API密钥认证"""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API密钥缺失"
        )
    
    # 使用环境变量验证框架
    validator = get_env_validator()
    env_schema = {
        "VALID_API_KEY": {
            "type": EnvVarType.STRING,
            "required": True,
            "description": "有效的API密钥"
        }
    }
    
    try:
        env_vars = validator.validate_env_vars("demoauth", env_schema)
        valid_api_key = env_vars["VALID_API_KEY"]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器配置错误"
        )
    
    if api_key != valid_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的API密钥"
        )
    
    return api_key

def register(app, **dependencies):
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 为需要认证的路由添加依赖
    exempt_paths = ['/health', '/docs', '/openapi.json', '/']
    
    for route in app.routes:
        if (hasattr(route, 'path') and 
            hasattr(route, 'dependencies') and
            not any(exempt_path in route.path for exempt_path in exempt_paths)):
            route.dependencies.insert(0, Depends(api_key_auth))
    
    logger.info("认证插件已加载，已为受保护路由添加认证")
```

## 4. 工具类插件

### 用途
提供通用工具功能和辅助服务。

### 文件结构
```
plugins/
└── yoapi_plugin_utils/
    ├── __init__.py
    ├── plugin.json          # 插件元数据文件
    ├── requirements.txt
    ├── .env
    └── tools.py           # 工具函数
```

### 代码示例

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
        """生成SHA256哈希"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def json_serializer(self, obj: Any) -> str:
        """JSON序列化工具"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
    
    def cache_get(self, key: str, default: Any = None) -> Any:
        """从缓存获取数据"""
        return self.cache.get(key, default)
    
    def cache_set(self, key: str, value: Any, ttl: int = 300) -> None:
        """设置缓存数据"""
        self.cache[key] = {
            'value': value,
            'expires': datetime.now() + timedelta(seconds=ttl)
        }

def register(app, **dependencies):
    utility_service = UtilityService()
    dependencies['utility_service'] = utility_service
    
    logger = dependencies.get('log_service').get_logger(__name__)
    logger.info("工具服务插件已加载")
```

## 选择适合的插件类型

| 插件类型 | 适用场景 | 复杂度 | 依赖关系 |
|---------|---------|--------|----------|
| API端点插件 | 提供REST API | 低-中 | 可能依赖数据库、认证服务 |
| 数据库服务插件 | 数据持久化 | 中-高 | 数据库驱动、连接池 |
| 认证授权插件 | 安全控制 | 中 | 可能依赖用户服务、令牌服务 |
| 工具类插件 | 通用功能 | 低 | 通常无外部依赖 |

根据您的需求选择合适的插件类型，遵循相应的开发规范。
