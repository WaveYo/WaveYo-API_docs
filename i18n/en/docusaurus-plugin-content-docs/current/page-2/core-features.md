---
sidebar_position: 4
---

# Core Features

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

This document details the core functional features of WaveYo-API, including advanced capabilities such as plugin management, dependency injection, and environment variable management.

## Plugin Metadata Management

WaveYo-API provides a powerful plugin metadata management system that supports unified management and configuration.

### Unified Metadata Format

The system uses a standardized configuration format similar to Node.js's package.json:

```json
{
  "name": "yoapi_plugin_example",
  "version": "1.0.0",
  "description": "Example plugin",
  "author": "Developer",
  "priority": 75,
  "dependencies": ["yoapi_plugin_log", "yoapi_plugin_db"],
  "tags": ["api", "example"],
  "license": "MIT"
}
```

### Priority Loading Mechanism

- **Priority range**: 0-100, higher values indicate higher priority
- **Default priority**: 50
- **Higher priority plugins load first**, ensuring core services are available
- **Dependency relationships take precedence over priority** (dependent plugins load first)

### Dependency Resolution Algorithm

The system uses a topological sorting algorithm to resolve plugin dependencies:

1. Automatically detects and reports circular dependencies
2. Ensures dependent plugins load first
3. Supports complex dependency chain resolution

## Intelligent Loading Strategies

WaveYo-API provides multiple loading methods to meet different scenario requirements.

### 1. Basic Loading (`load_all_plugins()`)

Only loads plugins without installing dependencies, suitable when dependencies are pre-installed.

```python
from core.plugin_manager import load_all_plugins

# Basic loading
plugins = load_all_plugins()
```

### 2. Dependency-Aware Loading (`load_all_plugins_with_deps()`)

Automatically detects and installs plugin dependencies with detailed installation logs.

```python
from core.plugin_manager import load_all_plugins_with_deps

# Dependency-aware loading
plugins = load_all_plugins_with_deps()
```

### 3. Intelligent Dependency Management (`load_plugins_by_dependencies()`)

Automatically handles dependency relationships between plugins to ensure correct loading order.

```python
from core.plugin_manager import load_plugins_by_dependencies

# Intelligent dependency management loading
plugins = load_plugins_by_dependencies()
```

### 4. Shared Dependency Registry

Plugins can register services to a shared dependency registry, which other plugins can access through dependency injection.

```python
from core.shared_dependency_registry import register_service, get_service

# Register service
register_service('database_service', database_instance)

# Get service
db_service = get_service('database_service')
```

## Loading Order Algorithm

The system uses advanced loading algorithms to ensure correct execution order.

### Topological Sorting

Determines loading order based on dependency relationships, ensuring dependent plugins load first.

### Priority Sorting

Loads by priority when no dependencies exist, with higher values having higher priority.

### Hybrid Strategy

Dependency relationships take precedence over priority, ensuring system stability.

### Loading Order Example

Assuming the following plugins:
- `log plugin` (priority 90, no dependencies)
- `hello-world plugin` (priority 50, depends on log plugin)
- `utils plugin` (priority 70, no dependencies)

Loading order: `log plugin` → `hello-world plugin` → `utils plugin`

## Shared Dependency Usage

Access shared services through dependency injection for seamless collaboration between plugins.

### Dependency Injection Example

```python
def register(app, **dependencies):
    # Get logging service
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Get database service
    db_service = dependencies.get('db_service')
    
    # Get configuration service
    config = dependencies.get('config')
    
    # Get services registered by other plugins
    cache_service = dependencies.get('cache_service')
    auth_service = dependencies.get('auth_service')
```

### Service Registration Example

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
    # Create and register service
    my_service = MyService()
    register_service('my_custom_service', my_service)
    
    logger = dependencies.get('log_service').get_logger(__name__)
    logger.info("Custom service registered to shared registry")
```

## Environment Variable Management

### Loading Order and Priority

1. **Plugin environment variables** > Main project environment variables
2. Plugin manager automatically loads `.env` files in plugin directories
3. Supports environment variable overriding (plugin variables take precedence over main project variables)

### Environment Variable Validation Framework

Powerful validation framework supports type checking, default values, required validation, etc.

```python
from core.env_validator import get_env_validator, EnvVarType

# Complex environment variable schema
ADVANCED_ENV_SCHEMA = {
    "DATABASE_URL": {
        "type": EnvVarType.STRING,
        "required": True,
        "pattern": r"^mysql://.+$",
        "description": "MySQL database connection URL"
    },
    "REDIS_URL": {
        "type": EnvVarType.STRING,
        "required": False,
        "default": "redis://localhost:6379/0",
        "description": "Redis connection URL"
    },
    "WORKER_COUNT": {
        "type": EnvVarType.INTEGER,
        "required": False,
        "default": 4,
        "min": 1,
        "max": 32,
        "description": "Number of worker threads"
    },
    "ENABLE_CACHE": {
        "type": EnvVarType.BOOLEAN,
        "required": False,
        "default": "true",
        "description": "Whether to enable caching"
    },
    "ALLOWED_ORIGINS": {
        "type": EnvVarType.LIST,
        "required": False,
        "default": "http://localhost:3000,http://127.0.0.1:3000",
        "description": "Allowed CORS origins"
    }
}
```

### Advanced Validation Features

- **Regular expression validation** - Uses pattern field to validate format
- **Enumeration value validation** - Restricts variables to specific values
- **List type support** - Automatically converts comma-separated strings to lists
- **Custom validators** - Supports custom validation logic

## Plugin Lifecycle Management

### Initialization Phase

```python
def register(app, **dependencies):
    # 1. Get dependency services
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 2. Validate environment variables
    validator = get_env_validator()
    env_vars = validator.validate_env_vars("plugin-name", ENV_SCHEMA)
    
    # 3. Initialize plugin components
    initialize_components(env_vars)
    
    # 4. Register routes and services
    app.include_router(router)
    register_service('plugin_service', plugin_instance)
    
    # 5. Complete initialization
    logger.info("Plugin initialization completed")
```

### Graceful Shutdown

Plugins can register shutdown hooks to perform cleanup operations when the application shuts down.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute on startup
    logger.info("Plugin starting")
    
    yield
    
    # Execute on shutdown
    logger.info("Plugin shutting down")
    await cleanup_resources()

def register(app, **dependencies):
    app.router.lifespan_context = lifespan
```

## Performance Optimization Features

### Async-First Design

All plugins are based on asynchronous programming patterns, fully leveraging Python asyncio advantages.

```python
@router.get("/data")
async def get_data():
    # Asynchronous database query
    data = await database.query("SELECT * FROM table")
    
    # Asynchronous external API call
    external_data = await httpx.get("https://api.example.com/data")
    
    # Asynchronous file operation
    await async_file_operation()
    
    return {"data": data, "external": external_data}
```

### Connection Pool Management

Automatically manages database connection pools and HTTP connection pools to improve performance.

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

## Monitoring and Diagnostics

### Health Check Endpoints

Plugins can register health check endpoints for easy system status monitoring.

```python
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### Performance Metrics

Supports collecting and exposing performance metrics for monitoring and optimization.

```python
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests')
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@router.get("/metrics")
async def get_metrics():
    REQUEST_COUNT.inc()
    with REQUEST_DURATION.time():
        # Process request
        return {"message": "success"}
```

These core features make WaveYo-API a powerful, flexible, and easily extensible backend framework.