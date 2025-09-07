---
sidebar_position: 1
---

# 插件开发指南

**WaveYo-API** 采用核心-插件架构，所有业务功能都以插件形式动态加载。本文档详细说明插件开发规范、最佳实践和完整示例。

## 插件类型

WaveYo-API 支持多种类型的插件：

### 1. API端点插件
提供RESTful API端点，处理HTTP请求和响应。

### 2. 数据库服务插件  
提供数据库连接和CRUD操作服务。

### 3. 认证授权插件
提供无侵入式的安全控制和权限管理。

### 4. 工具类插件
提供通用工具功能和辅助服务。

## 快速开始

:::caution 注意
<p>WaveYo-API Plugin **支持且仅支持** 名称符合 `yoapi_plugin_xxx` 格式的插件名称。</p>
<p>使用命令 `yoapi plugin new` 创建插件时将会自动识别是否包含前缀 `yoapi_plugin_`，若已包含CLI将不会重复添加前缀。</p>
:::

### 创建第一个插件

```bash
# 使用CLI工具创建新插件
yoapi plugin new my_first_plugin

# 或手动创建插件目录
mkdir -p plugins/yoapi_plugin_my_first_plugin
```

### 基础插件结构

每个插件至少需要包含以下文件：

- `__init__.py` - 主文件，包含register函数
- `requirements.txt` - 插件依赖声明
- `plugin.json` - 插件元数据文件（推荐）

### 最小示例

```python
# plugins/yoapi_plugin_my_first_plugin/__init__.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    return {"message": "Hello from my first plugin!"}

def register(app, **dependencies):
    # 获取日志服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    app.include_router(router)
    logger.info("我的第一个插件已成功注册")
```

## 核心概念

### 插件加载机制

WaveYo-API 使用先进的加载算法：

1. **拓扑排序** - 基于依赖关系确定加载顺序
2. **优先级排序** - 在无依赖时按优先级加载（0-100）
3. **混合策略** - 依赖关系优先于优先级

### 共享依赖注入

插件可以通过依赖注入获取共享服务：

```python
def register(app, **dependencies):
    # 获取日志服务
    log_service = dependencies.get('log_service')
    logger = log_service.get_logger(__name__)
    
    # 获取数据库服务
    db_service = dependencies.get('db_service')
    
    # 获取配置服务
    config = dependencies.get('config')
```

<!-- ## 下一步

- [插件类型详解](./plugin-types)
- [开发规范](./development-specifications)  
- [核心功能](./core-features)
- [最佳实践](./best-practices)
- [示例模板](./examples)
- [CLI工具](./cli-tools)
- [故障排除](./troubleshooting) -->


