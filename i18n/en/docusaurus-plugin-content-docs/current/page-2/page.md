---
sidebar_position: 1
---

# Plugin Development Guide

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

**WaveYo-API** employs a core-plugin architecture where all business functionalities are dynamically loaded as plugins. This document details plugin development specifications, best practices, and complete examples.

## Plugin Types

WaveYo-API supports various types of plugins:

### 1. API Endpoint Plugins
Provide RESTful API endpoints to handle HTTP requests and responses.

### 2. Database Service Plugins
Provide database connections and CRUD operation services.

### 3. Authentication & Authorization Plugins
Provide non-intrusive security controls and permission management.

### 4. Utility Plugins
Provide general utility functions and auxiliary services.

## Quick Start

:::caution Note
<p>WaveYo-API Plugin **supports and only supports** plugin names that follow the `yoapi_plugin_xxx` naming convention.</p>
<p>When using the command `yoapi plugin new` to create a plugin, the CLI will automatically detect if the prefix `yoapi_plugin_` is included. If it is already present, the CLI will not add the prefix again.</p>
:::

### Create Your First Plugin

```bash
# Use the CLI tool to create a new plugin
yoapi plugin new my_first_plugin

# Or manually create the plugin directory
mkdir -p plugins/yoapi_plugin_my_first_plugin
```

### Basic Plugin Structure

Each plugin must include at least the following files:

- `__init__.py` - Main file containing the register function
- `requirements.txt` - Plugin dependency declarations
- `plugin.json` - Plugin metadata file (recommended)

### Minimal Example

```python
# plugins/yoapi_plugin_my_first_plugin/__init__.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    return {"message": "Hello from my first plugin!"}

def register(app, **dependencies):
    # Get the logging service
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    app.include_router(router)
    logger.info("My first plugin has been successfully registered")
```

## Core Concepts

### Plugin Loading Mechanism

WaveYo-API uses an advanced loading algorithm:

1. **Topological Sorting** - Determines loading order based on dependency relationships
2. **Priority Sorting** - Loads by priority (0-100) when no dependencies exist
3. **Hybrid Strategy** - Dependency relationships take precedence over priority

### Shared Dependency Injection

Plugins can obtain shared services through dependency injection:

```python
def register(app, **dependencies):
    # Get the logging service
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # Get the database service
    db_service = dependencies.get('db_service')
    
    # Get the configuration service
    config = dependencies.get('config')
```