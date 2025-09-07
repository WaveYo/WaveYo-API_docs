---
sidebar_position: 3
---

# 开发规范

本文档详细说明WaveYo-API插件的开发规范和要求，确保插件的一致性和可维护性。

## 文件结构规范

### 必须包含的文件

1. **`__init__.py`** - 主文件
   - 必须包含`register`函数
   - 函数签名：`def register(app, **dependencies)`
   - 负责插件初始化和路由注册

2. **`requirements.txt`** - 依赖声明
   - 声明插件所需的所有Python包
   - 使用明确的版本约束

### 推荐包含的文件

3. **`plugin.json`** - 插件元数据（推荐）
4. **`.env`** - 环境变量配置
5. **`README.md`** - 插件说明文档

## 插件元数据规范

WaveYo-API 提供了统一的插件元数据管理系统，类似 Node.js 的 package.json 系统。

### plugin.json 文件格式

```json
{
  "name": "yoapi_plugin_hello_world",
  "version": "0.1.0",
  "description": "示例Hello World插件",
  "author": "开发者名称",
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

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 插件名称（必须与目录名一致） |
| `version` | string | 是 | 语义化版本（如：0.1.0） |
| `description` | string | 否 | 插件功能描述 |
| `author` | string | 否 | 插件作者信息 |
| `priority` | number | 否 | 加载优先级（0-100，默认50） |
| `dependencies` | array | 否 | 依赖的其他插件列表 |
| `tags` | array | 否 | 插件分类标签 |
| `license` | string | 否 | 许可证类型 |
| `repository` | object | 否 | 代码仓库信息 |

### 向后兼容性

- 如果没有 `plugin.json` 文件，系统会自动生成默认元数据
- 默认优先级为50，无依赖关系
- 现有插件无需修改即可继续工作

## 命名规范

### 插件目录命名
- 必须使用 `yoapi_plugin_` 前缀
- 使用小写字母和下划线
- 示例：`yoapi_plugin_mysql_database`

### 环境变量命名
- 使用大写字母和下划线
- 建议添加插件前缀避免冲突
- 示例：`MYSQL_DATABASE_URL`, `API_AUTH_KEY`

### 函数和变量命名
- 遵循Python PEP 8命名规范
- 使用有意义的描述性名称

## 日志规范

### 日志格式
统一格式：`[级别][模块名]YY-MM-DD-HH:MM:SS || 消息内容`

### 使用示例

```python
def register(app, **dependencies):
    # 获取日志服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 不同级别的日志
    logger.debug("调试信息 - 用户ID: 67fac2dc-7c19-11f0-b527-b8cef6abb894")
    logger.info("插件初始化成功")
    logger.warning("配置参数使用默认值")
    logger.error("数据库连接失败")
    logger.critical("系统关键错误，需要立即处理")
    
    # 结构化日志
    logger.info("用户操作完成", extra={
        "user_id": "67fac2dc-7c19-11f0-b527-b8cef6abb894",
        "action": "create_item",
        "duration_ms": 150
    })
```

## 依赖管理规范

### requirements.txt 格式

```txt
# 注释说明依赖用途
fastapi==0.104.1
sqlalchemy>=2.0.0,<3.0.0
pydantic==2.5.0
redis==5.0.1

# 开发依赖（可选）
pytest==7.4.3
black==23.11.0
```

### 依赖安装机制

1. **自动检测** - 系统自动检测并安装插件依赖
2. **包管理器优先** - 优先使用`uv pip`，回退到标准`pip`
3. **绝对路径** - 使用绝对路径确保requirements.txt文件可访问
4. **失败处理** - 依赖安装失败会导致插件加载失败

## 环境变量规范

### 环境变量验证框架

WaveYo-API提供了强大的环境变量验证框架：

```python
from core.env_validator import get_env_validator, EnvVarType

# 定义环境变量模式
ENV_SCHEMA = {
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
    },
    "DEBUG_MODE": {
        "type": EnvVarType.BOOLEAN,
        "required": False,
        "default": "false",
        "description": "调试模式开关"
    },
    "API_TIMEOUT": {
        "type": EnvVarType.FLOAT,
        "required": False,
        "default": 30.0,
        "min": 1.0,
        "max": 300.0,
        "description": "API请求超时时间（秒）"
    }
}

def register(app, **dependencies):
    validator = get_env_validator()
    try:
        env_vars = validator.validate_env_vars("your-plugin", ENV_SCHEMA)
        # 使用验证后的环境变量
        db_url = env_vars["DB_URL"]
    except ValueError as e:
        logger.error(f"环境变量验证失败: {e}")
        raise
```

### 支持的数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `EnvVarType.STRING` | 字符串类型 | "database_url" |
| `EnvVarType.INTEGER` | 整数类型 | 8080 |
| `EnvVarType.FLOAT` | 浮点数类型 | 3.14 |
| `EnvVarType.BOOLEAN` | 布尔类型 | true/false |
| `EnvVarType.LIST` | 列表类型 | "item1,item2,item3" |

### 冲突检测机制

系统会自动检测环境变量冲突：

- **变量覆盖冲突** - 当多个插件设置相同的环境变量
- **值不一致冲突** - 相同变量名但不同值

冲突示例警告：
```
[WARNING][plugin_manager]环境变量冲突: DATABASE_URL 在插件 plugin-a 和 plugin-b 中存在不同值
[WARNING][plugin_manager]环境变量被覆盖: LOG_LEVEL 值从 'INFO' 改为 'DEBUG'
```

## 错误处理规范

### 基本错误处理

```python
def register(app, **dependencies):
    try:
        log_service = dependencies.get('log_service')
        logger = log_service.get_logger(__name__)
        
        # 插件初始化逻辑
        logger.info("插件初始化开始")
        
        # 可能抛出异常的操作
        initialize_plugin()
        
        logger.info("插件初始化成功")
        
    except ConfigurationError as e:
        logger.error(f"配置错误: {e}")
        # 重新抛出让系统处理
        raise
        
    except DependencyError as e:
        logger.error(f"依赖错误: {e}")
        raise
        
    except Exception as e:
        logger.critical(f"未知错误: {e}")
        raise
```

### HTTP错误处理

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

遵循这些规范可以确保插件的一致性、可维护性和 interoperability。
