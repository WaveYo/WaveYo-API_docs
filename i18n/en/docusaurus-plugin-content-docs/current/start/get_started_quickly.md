---
sidebar_position: 2
---

# Quick Start

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

This guide will help you get started with WaveYo-API quickly, from setting up your environment to making your first API call.

:::caution Prerequisites

Before you begin, make sure your system meets the following requirements:

- **Python 3.11+**: WaveYo-API recommends using Python 3.11 or higher.
- **uv**: A modern, fast Python package manager (required) | [Official Docs→](https://docs.astral.sh/uv/getting-started/installation/#__tabbed_1_1)
- **Git**: For version control and plugin downloads | [Official Docs→](https://git-scm.com/doc)

:::

## Install WaveYo-API

WaveYo-API offers two installation methods: the traditional method and the CLI tool method.

### Method 1: Traditional Installation

1. **Clone the Project**
   ```bash
   git clone https://github.com/WaveYo/WaveYo-API.git
   cd WaveYo-API
   ```

2. **Install Dependencies**
   ```bash
   uv pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit the .env file to configure your settings
   ```

### Method 2: Using the yoapi-cli Tool (Recommended)

yoapi-cli provides a more convenient development experience:

1. **Install yoapi-cli**
   ```bash
   # Install using pip
   pip install yoapi-cli

   # Or install using pipx (recommended)
   pipx install yoapi-cli

   # Or install from source
   git clone https://github.com/WaveYo/yoapi-cli.git
   cd yoapi-cli
   pip install -e .
   ```

2. **Create a Virtual Environment**
   ```bash
   yoapi venv create
   ```

3. **Activate the Virtual Environment**
   ```bash
   # Windows
   .\.venv\Scripts\activate

   # Unix/Linux/Mac
   source .venv/bin/activate
   ```

4. **Install Project Dependencies**
   ```bash
   yoapi package install -r requirements.txt
   ```
   
   :::note
   yoapi-cli uses uv internally for package management. Make sure you have the uv package manager installed.
   :::

## Start the Service

### Start in Development Mode

```bash
# Using the CLI tool (recommended)
yoapi run --reload

# Or run directly
python main.py
```

The service will start at `http://localhost:8000`.

### Start in Production Mode

```bash
# Use Gunicorn + Uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:create_app
```

## Verify Installation

Once the service is running, you can verify the installation in the following ways:

### 1. Access the Root Endpoint

```bash
curl http://localhost:8000/
```

Example response:
```json
{
  "message": "Welcome to WaveYo-API",
  "version": "0.1.5",
  "loaded_plugins": ["yoapi_plugin_log", "yoapi_plugin_hello_world"]
}
```

### 2. Test the Hello World Plugin

```bash
# Basic greeting
curl http://localhost:8000/hello/

# Personalized greeting
curl http://localhost:8000/hello/YourName
```

### 3. Health Check

```bash
curl http://localhost:8000/health
```

### 4. View API Documentation

Open in your browser: `http://localhost:8000/docs`

## Install Your First Plugin

The core feature of WaveYo-API is its plugin architecture. Let's install an example plugin:

```bash
# Download a plugin using the CLI tool
yoapi plugin download WaveYo/yoapi_plugin_mysql_database

# Or use the original download tool
python plugin_downloader.py download WaveYo/yoapi_plugin_mysql_database
```

:::tip
WaveYo-API strongly recommends using uv as the package manager. It is faster and more reliable than traditional pip and provides better dependency resolution.
:::

After downloading, the plugin will be loaded automatically. You can see the newly installed plugin in the response of the root endpoint.