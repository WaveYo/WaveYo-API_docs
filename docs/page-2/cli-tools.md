---
sidebar_position: 7
---

# CLI工具使用指南

WaveYo-API 提供了强大的命令行工具来简化插件开发和管理流程。

## 插件管理命令

### 创建新插件

```bash
# 创建新插件（自动添加yoapi_plugin_前缀）
yoapi plugin new my_plugin

# 示例：创建数据库插件
yoapi plugin new mysql_database
```

### 下载插件

```bash
# 从GitHub下载插件
yoapi plugin download owner/repo-name

# 示例：下载MySQL数据库插件
yoapi plugin download WaveYo/yoapi_plugin_mysql_database

```

### 插件列表管理

```bash
# 列出已安装的插件
yoapi plugin list

# 删除插件
yoapi plugin remove plugin-name

# 示例：删除hello-world插件
yoapi plugin remove yoapi_plugin_hello_world
```

## 虚拟环境和依赖管理

### 虚拟环境操作

```bash
# 创建虚拟环境（优先使用uv）
yoapi venv create

# 激活虚拟环境（Windows）
.\.venv\Scripts\activate

# 激活虚拟环境（Unix/Linux/Mac）
source .venv/bin/activate

# 删除虚拟环境
yoapi venv remove
```

## 项目运行

```bash
# 运行项目
yoapi run

# 运行项目（热重载模式）
yoapi run --reload

# 指定端口运行
yoapi run --port 8080

# 指定主机运行
yoapi run --host 0.0.0.0
```

## 插件下载工具（原始方式）

除了CLI工具，还可以使用原始的插件下载工具：

```bash
# 使用原始下载工具下载插件
python plugin_downloader.py download owner/repo-name

# 列出已安装的插件
python plugin_downloader.py list

# 显示帮助信息
python plugin_downloader.py --help

# 强制重新下载
python plugin_downloader.py download owner/repo-name --force
```


### 脚本集成

CLI工具可以轻松集成到自动化脚本中：

```bash
#!/bin/bash

# 自动化部署脚本示例
yoapi venv create
source .venv/bin/activate
yoapi package install -r requirements.txt
yoapi plugin download WaveYo/yoapi_plugin_mysql_database
yoapi env init
yoapi run --host 0.0.0.0 --port 8000
```


:::note 注意事项

- 网络连接正常时使用下载功能
- 生产环境建议使用`--no-cache`选项避免缓存问题
  
:::

CLI工具大大简化了WaveYo-API的开发和管理工作流程，建议优先使用CLI工具而不是手动操作。
