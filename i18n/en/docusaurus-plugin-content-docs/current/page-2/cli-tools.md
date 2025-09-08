---
sidebar_position: 7
---

# CLI Tools Usage Guide

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

WaveYo-API provides powerful command-line tools to simplify plugin development and management processes.

## Plugin Management Commands

### Create New Plugin

```bash
# Create new plugin (automatically adds yoapi_plugin_ prefix)
yoapi plugin new my_plugin

# Example: Create database plugin
yoapi plugin new mysql_database
```

### Download Plugins

```bash
# Download plugin from GitHub
yoapi plugin download owner/repo-name

# Example: Download MySQL database plugin
yoapi plugin download WaveYo/yoapi_plugin_mysql_database
```

### Plugin List Management

```bash
# List installed plugins
yoapi plugin list

# Remove plugin
yoapi plugin remove plugin-name

# Example: Remove hello-world plugin
yoapi plugin remove yoapi_plugin_hello_world
```

## Virtual Environment and Dependency Management

### Virtual Environment Operations

```bash
# Create virtual environment (preferentially uses uv)
yoapi venv create

# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Activate virtual environment (Unix/Linux/Mac)
source .venv/bin/activate

# Delete virtual environment
yoapi venv remove
```

## Project Execution

```bash
# Run project
yoapi run

# Run project (hot reload mode)
yoapi run --reload

# Run on specific port
yoapi run --port 8080

# Run on specific host
yoapi run --host 0.0.0.0
```

## Plugin Download Tool (Legacy Method)

In addition to CLI tools, you can also use the legacy plugin download tool:

```bash
# Download plugin using legacy download tool
python plugin_downloader.py download owner/repo-name

# List installed plugins
python plugin_downloader.py list

# Show help information
python plugin_downloader.py --help

# Force re-download
python plugin_downloader.py download owner/repo-name --force
```

### Script Integration

CLI tools can be easily integrated into automation scripts:

```bash
#!/bin/bash

# Example automation deployment script
yoapi venv create
source .venv/bin/activate
yoapi package install -r requirements.txt
yoapi plugin download WaveYo/yoapi_plugin_mysql_database
yoapi env init
yoapi run --host 0.0.0.0 --port 8000
```

:::note Important Notes

- Ensure network connectivity when using download functionality
- Use `--no-cache` option in production environments to avoid cache issues
  
:::

CLI tools greatly simplify the WaveYo-API development and management workflow. It is recommended to use CLI tools instead of manual operations.