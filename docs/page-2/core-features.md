---
sidebar_position: 4
---

# 核心功能

本文档详细说明WaveYo-API的核心功能特性，包括插件管理、依赖注入、环境变量管理等高级功能。

## 插件元数据管理

WaveYo-API 提供了强大的插件元数据管理系统，支持统一的管理和配置。

### 统一元数据格式

系统使用类似 Node.js package.json 的标准化配置格式：

```json
{
  "name": "yoapi_plugin_example",
  "version": "1.0.0",
  "description": "示例插件",
  "author": "开发者",
  "priority": 75,
  "dependencies": ["yoapi_plugin_log", "yoapi_plugin_db"],
  "tags": ["api", "example"],
  "license": "MIT"
}
```

### 优先级加载机制

- **优先级范围**: 0-100，数值越大优先级越高
- **默认优先级**: 50
- **高优先级插件先加载**，确保核心服务可用
- **依赖关系优先于优先级**（被依赖的插件先加载）

### 依赖解析算法

系统使用拓扑排序算法解析插件依赖关系：

1. 自动检测循环依赖并报错
2. 确保被依赖的插件先加载
3. 支持复杂的依赖链解析

## 智能加载策略

WaveYo-API 提供多种加载方式，满足不同场景需求。

### 1. 基础加载 (`load_all_plugins()`)

仅加载插件，不安装依赖，适用于依赖已预先安装的情况。

```python
from core.plugin_manager import load_all_plugins

# 基础加载
plugins = load_all_plugins()
```

### 2. 依赖感知加载 (`load_all_plugins_with_deps()`)

自动检测并安装插件依赖，支持详细的安装日志。

```python
from core.plugin_manager import load_all_plugins_with_deps

# 依赖感知加载
plugins = load_all_plugins_with_deps()
```

### 3. 智能依赖管理 (`load_plugins_by_dependencies()`)

自动处理插件间的依赖关系，确保正确的加载顺序。

```python
from core.plugin_manager import load_plugins_by_dependencies

# 智能依赖管理加载
plugins = load_plugins_by_dependencies()
```

### 4. 共享依赖注册表

插件可以将服务注册到共享依赖注册表，其他插件可以通过依赖注入获取。

```python
from core.shared_dependency_registry import register_service, get_service

# 注册服务
register_service('database_service', database_instance)

# 获取服务
db_service = get_service('database_service')
```

## 加载顺序算法

系统使用先进的加载算法确保正确的执行顺序。

### 拓扑排序

基于依赖关系确定加载顺序，确保被依赖的插件先加载。

### 优先级排序

在无依赖关系时按优先级加载，数值越大优先级越高。

### 混合策略

依赖关系优先于优先级，确保系统的稳定性。

### 加载顺序示例

假设有以下插件：
- `log插件` (优先级90，无依赖)
- `hello-world插件` (优先级50，依赖log插件)
- `utils插件` (优先级70，无依赖)

加载顺序：`log插件` → `hello-world插件` → `utils插件`

## 共享依赖使用

通过依赖注入获取共享服务，实现插件间的无缝协作。

### 依赖注入示例

```python
def register(app, **dependencies):
    # 获取日志服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 获取数据库服务
    db_service = dependencies.get('db_service')
    
    # 获取配置服务
    config = dependencies.get('config')
    
    # 获取其他插件注册的服务
    cache_service = dependencies.get('cache_service')
    auth_service = dependencies.get('auth_service')
```

### 服务注册示例

```python
from core.shared_dependency_registry import register_service

class MyService:
    def __init__(self):
        self.data = {}
    
    def set_value(self, key, value):
        self.data[key] = value
    
    def get_value(self, key):
        return self.data.get(key)

def register(app, **dependencies):
    # 创建并注册服务
    my_service = MyService()
    register_service('my_custom_service', my_service)
    
    logger = dependencies.get('log_service').get_logger(__name__)
    logger.info("自定义服务已注册到共享注册表")
```

## 环境变量管理

### 加载顺序和优先级

1. **插件环境变量** > 主项目环境变量
2. 插件管理器自动加载插件目录下的`.env`文件
3. 支持环境变量覆盖（插件变量优先于主项目变量）

### 环境变量验证框架

强大的验证框架支持类型检查、默认值、必需性验证等。

```python
from core.env_validator import get_env_validator, EnvVarType

# 复杂的环境变量模式
ADVANCED_ENV_SCHEMA = {
    "DATABASE_URL": {
        "type": EnvVarType.STRING,
        "required": True,
        "pattern": r"^mysql://.+$",
        "description": "MySQL数据库连接URL"
    },
    "REDIS_URL": {
        "type": EnvVarType.STRING,
        "required": False,
        "default": "redis://localhost:6379/0",
        "description": "Redis连接URL"
    },
    "WORKER_COUNT": {
        "type": EnvVarType.INTEGER,
        "required": False,
        "default": 4,
        "min": 1,
        "max": 32,
        "description": "工作线程数量"
    },
    "ENABLE_CACHE": {
        "type": EnvVarType.BOOLEAN,
        "required": False,
        "default": "true",
        "description": "是否启用缓存"
    },
    "ALLOWED_ORIGINS": {
        "type": EnvVarType.LIST,
        "required": False,
        "default": "http://localhost:3000,http://127.0.0.1:3000",
        "description": "允许的跨域来源"
    }
}
```

### 高级验证特性

- **正则表达式验证** - 使用pattern字段验证格式
- **枚举值验证** - 限制变量为特定值
- **列表类型支持** - 自动将逗号分隔的字符串转换为列表
- **自定义验证器** - 支持自定义验证逻辑

## 插件生命周期管理

### 初始化阶段

```python
def register(app, **dependencies):
    # 1. 获取依赖服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 2. 验证环境变量
    validator = get_env_validator()
    env_vars = validator.validate_env_vars("plugin-name", ENV_SCHEMA)
    
    # 3. 初始化插件组件
    initialize_components(env_vars)
    
    # 4. 注册路由和服务
    app.include_router(router)
    register_service('plugin_service', plugin_instance)
    
    # 5. 完成初始化
    logger.info("插件初始化完成")
```

### 优雅关闭

插件可以注册关闭钩子，在应用关闭时执行清理操作。

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    logger.info("插件启动")
    
    yield
    
    # 关闭时执行
    logger.info("插件关闭")
    await cleanup_resources()

def register(app, **dependencies):
    app.router.lifespan_context = lifespan
```

## 性能优化特性

### 异步优先设计

所有插件都基于异步编程模式，充分利用Python asyncio的优势。

```python
@router.get("/data")
async def get_data():
    # 异步数据库查询
    data = await database.query("SELECT * FROM table")
    
    # 异步外部API调用
    external_data = await httpx.get("https://api.example.com/data")
    
    # 异步文件操作
    await async_file_operation()
    
    return {"data": data, "external": external_data}
```

### 连接池管理

自动管理数据库连接池和HTTP连接池，提高性能。

```python
from databases import Database
from httpx import AsyncClient

class ApiService:
    def __init__(self, db_url: str, api_base_url: str):
        self.database = Database(db_url, min_size=2, max_size=10)
        self.client = AsyncClient(base_url=api_base_url, timeout=30.0)
    
    async def initialize(self):
        await self.database.connect()
    
    async def close(self):
        await self.database.disconnect()
        await self.client.aclose()
```

## 监控和诊断

### 健康检查端点

插件可以注册健康检查端点，方便监控系统状态。

```python
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### 性能指标

支持收集和暴露性能指标，便于监控和优化。

```python
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests')
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@router.get("/metrics")
async def get_metrics():
    REQUEST_COUNT.inc()
    with REQUEST_DURATION.time():
        # 处理请求
        return {"message": "success"}
```

这些核心功能使得WaveYo-API成为一个强大、灵活且易于扩展的后端框架。
