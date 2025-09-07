---
sidebar_position: 2
---

# 快速上手

本文将引导您快速开始使用 WaveYo-API，从环境准备到第一个 API 的调用。

:::caution 前提条件

在开始之前，请确保您的系统满足以下要求：

- **Python 3.11+**: WaveYo-API 建议使用 Python 3.11 或更高版本
- **uv**: 现代、快速的 Python 包管理器（必需） | [官方文档→](https://docs.astral.sh/uv/getting-started/installation/#__tabbed_1_1)
- **Git**: 用于版本控制和插件下载 | [官方文档→](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

:::

## 安装 WaveYo-API

WaveYo-API 提供两种安装方式：传统方式和 CLI 工具方式。

### 方式一：传统安装

1. **克隆项目**
   ```bash
   git clone https://github.com/WaveYo/WaveYo-API.git
   cd WaveYo-API
   ```

2. **安装依赖**
   ```bash
   uv pip install -r requirements.txt
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件配置您的设置
   ```

### 方式二：使用 yoapi-cli 工具（推荐）

yoapi-cli 提供了更便捷的开发体验：

1. **安装 yoapi-cli**
   ```bash
   # 使用 pip 安装
   pip install yoapi-cli

   # 或使用 pipx 安装（推荐）
   pipx install yoapi-cli

   # 或从源码安装
   git clone https://github.com/WaveYo/yoapi-cli.git
   cd yoapi-cli
   pip install -e .
   ```

2. **创建虚拟环境**
   ```bash
   yoapi venv create
   ```

3. **激活虚拟环境**
   ```bash
   # Windows
   .\.venv\Scripts\activate

   # Unix/Linux/Mac
   source .venv/bin/activate
   ```

4. **安装项目依赖**
   ```bash
   yoapi package install -r requirements.txt
   ```
   
   :::note
   yoapi-cli 内部使用 uv 进行包管理，确保您已安装 uv 包管理器。
   :::

## 启动服务

### 开发模式启动

```bash
# 使用 CLI 工具（推荐）
yoapi run --reload

# 或直接运行
python main.py
```

服务将在 `http://localhost:8000` 启动。

### 生产模式启动

```bash
# 使用 Gunicorn + Uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:create_app
```

## 验证安装

服务启动后，您可以通过以下方式验证安装是否成功：

### 1. 访问根端点

```bash
curl http://localhost:8000/
```

响应示例：
```json
{
  "message": "Welcome to WaveYo-API",
  "version": "0.1.5",
  "loaded_plugins": ["yoapi_plugin_log", "yoapi_plugin_hello_world"]
}
```

### 2. 测试 Hello World 插件

```bash
# 基础问候
curl http://localhost:8000/hello/

# 带名称的问候
curl http://localhost:8000/hello/YourName
```

### 3. 健康检查

```bash
curl http://localhost:8000/health
```

### 4. 查看 API 文档

在浏览器中打开：`http://localhost:8000/docs`

## 安装第一个插件

WaveYo-API 的核心特性是插件化架构，让我们安装一个示例插件：

```bash
# 使用 CLI 工具下载插件
yoapi plugin download WaveYo/yoapi_plugin_mysql_database

# 或使用原始下载工具
python plugin_downloader.py download WaveYo/yoapi_plugin_mysql_database
```

:::tip
WaveYo-API 强烈推荐使用 uv 作为包管理器，它比传统 pip 更快、更可靠，并且提供更好的依赖解析。
:::

插件下载后会自动加载，您可以在根端点的响应中看到新安装的插件。
