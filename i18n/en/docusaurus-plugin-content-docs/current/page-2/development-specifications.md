---
sidebar_position: 3
---

# Development Specifications

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

This document details the development specifications and requirements for WaveYo-API plugins to ensure consistency and maintainability.

## File Structure Specifications

### Required Files

1. **`__init__.py`** - Main file
   - Must contain a `register` function
   - Function signature: `def register(app, **dependencies)`
   - Responsible for plugin initialization and route registration

2. **`requirements.txt`** - Dependency declarations
   - Declare all required Python packages for the plugin
   - Use explicit version constraints

### Recommended Files

3. **`plugin.json`** - Plugin metadata (recommended)
4. **`.env`** - Environment variable configuration
5. **`README.md`** - Plugin documentation

## Plugin Metadata Specifications

WaveYo-API provides a unified plugin metadata management system, similar to Node.js's package.json system.

### plugin.json File Format

```json
{
  "name": "yoapi_plugin_hello_world",
  "version": "0.1.0",
  "description": "Example Hello World plugin",
  "author": "Developer Name",
  "priority": 50,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["example", "hello-world"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/yoapi_plugin_hello_world"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|------|------|------|------|
| `name` | string | Yes | Plugin name (must match directory name) |
| `version` | string | Yes | Semantic version (e.g., 0.1.0) |
| `description` | string | No | Plugin functionality description |
| `author` | string | No | Plugin author information |
| `priority` | number | No | Loading priority (0-100, default 50) |
| `dependencies` | array | No | List of dependent plugins |
| `tags` | array | No | Plugin classification tags |
| `license` | string | No | License type |
| `repository` | object | No | Code repository information |

### Backward Compatibility

- If no `plugin.json` file exists, the system automatically generates default metadata
- Default priority is 50 with no dependencies
- Existing plugins continue to work without modification

## Naming Conventions

### Plugin Directory Naming
- Must use `yoapi_plugin_` prefix
- Use lowercase letters and underscores
- Example: `yoapi_plugin_mysql_database`

### Environment Variable Naming
- Use uppercase letters and underscores
- Add plugin prefix to avoid conflicts
- Example: `MYSQL_DATABASE_URL`, `API_AUTH_KEY`

### Function and Variable Naming
- Follow Python PEP 8 naming conventions
- Use meaningful descriptive names

## Logging Specifications

### Log Format
Unified format: `[LEVEL][MODULE_NAME]YY-MM-DD-HH:MM:SS || Message content`

### Usage Example

```python
def register(app, **dependencies):
    # Get logging service
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Different log levels
    logger.debug("Debug information - User ID: 67fac2dc-7c19-11f0-b527-b8cef6abb894")
    logger.info("Plugin initialized successfully")
    logger.warning("Using default configuration parameters")
    logger.error("Database connection failed")
    logger.critical("Critical system error requiring immediate attention")
    
    # Structured logging
    logger.info("User operation completed", extra={
        "user_id": "67fac2dc-7c19-11f0-b527-b8cef6abb894",
        "action": "create_item",
        "duration_ms": 150
    })
```

## Dependency Management Specifications

### requirements.txt Format

```txt
# Comment explaining dependency purpose
fastapi==0.104.1
sqlalchemy>=2.0.0,<3.0.0
pydantic==2.5.0
redis==5.0.1

# Development dependencies (optional)
pytest==7.4.3
black==23.11.0
```

### Dependency Installation Mechanism

1. **Automatic detection** - System automatically detects and installs plugin dependencies
2. **Package manager priority** - Prefers `uv pip`, falls back to standard `pip`
3. **Absolute paths** - Uses absolute paths to ensure requirements.txt file accessibility
4. **Failure handling** - Dependency installation failure causes plugin loading failure

## Environment Variable Specifications

### Environment Variable Validation Framework

WaveYo-API provides a powerful environment variable validation framework:

```python
from core.env_validator import get_env_validator, EnvVarType

# Define environment variable schema
ENV_SCHEMA = {
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
    },
    "DEBUG_MODE": {
        "type": EnvVarType.BOOLEAN,
        "required": False,
        "default": "false",
        "description": "Debug mode switch"
    },
    "API_TIMEOUT": {
        "type": EnvVarType.FLOAT,
        "required": False,
        "default": 30.0,
        "min": 1.0,
        "max": 300.0,
        "description": "API request timeout (seconds)"
    }
}

def register(app, **dependencies):
    validator = get_env_validator()
    try:
        env_vars = validator.validate_env_vars("your-plugin", ENV_SCHEMA)
        # Use validated environment variables
        db_url = env_vars["DB_URL"]
    except ValueError as e:
        logger.error(f"Environment variable validation failed: {e}")
        raise
```

### Supported Data Types

| Type | Description | Example |
|------|------|------|
| `EnvVarType.STRING` | String type | "database_url" |
| `EnvVarType.INTEGER` | Integer type | 8080 |
| `EnvVarType.FLOAT` | Float type | 3.14 |
| `EnvVarType.BOOLEAN` | Boolean type | true/false |
| `EnvVarType.LIST` | List type | "item1,item2,item3" |

### Conflict Detection Mechanism

The system automatically detects environment variable conflicts:

- **Variable override conflicts** - When multiple plugins set the same environment variable
- **Value inconsistency conflicts** - Same variable name but different values

Conflict example warning:
```
[WARNING][plugin_manager]Environment variable conflict: DATABASE_URL has different values in plugin-a and plugin-b
[WARNING][plugin_manager]Environment variable overridden: LOG_LEVEL value changed from 'INFO' to 'DEBUG'
```

## Error Handling Specifications

### Basic Error Handling

```python
def register(app, **dependencies):
    try:
        log_service = dependencies.get('log_service')
        logger = log_service.get_logger(__name__)
        
        # Plugin initialization logic
        logger.info("Plugin initialization started")
        
        # Operations that might throw exceptions
        initialize_plugin()
        
        logger.info("Plugin initialized successfully")
        
    except ConfigurationError as e:
        logger.error(f"Configuration error: {e}")
        # Re-raise for system handling
        raise
        
    except DependencyError as e:
        logger.error(f"Dependency error: {e}")
        raise
        
    except Exception as e:
        logger.critical(f"Unknown error: {e}")
        raise
```

### HTTP Error Handling

```python
from fastapi import HTTPException, status

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    try:
        item = await get_item_from_db(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item {item_id} not found"
            )
        return item
    except DatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )
```

Following these specifications ensures plugin consistency, maintainability, and interoperability.