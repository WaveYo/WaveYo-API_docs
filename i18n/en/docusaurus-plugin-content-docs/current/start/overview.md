---
sidebar_position: 1
---

# Overview

:::warning  
This language version of the document is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

**WaveYo-API** is a plugin-based, modern, cross-platform, and extensible backend service framework built on FastAPI (hereinafter referred to as WaveYo-API). It employs a core-plugin architecture design and leverages Python's type annotations and async-first capabilities (with synchronous compatibility), providing convenient and flexible support for your implementation needs. Additionally, WaveYo-API features an open plugin ecosystem where any developer can create plugins. Users can quickly build high-performance API services by simply configuring their environment and installing plugins, without the need to write complex code.

Please note that WaveYo-API recommends using **Python 3.11 or above**.

## Features

### Async-First
WaveYo-API is built on FastAPI and Python [asyncio](https://docs.python.org/3/library/asyncio.html), fully leveraging the advantages of asynchronous programming to deliver exceptional performance. It also includes compatibility support for synchronous functions built upon the asynchronous mechanism.

### Out-of-the-Box
WaveYo-API provides a user-friendly and powerful command-line tool—yoapi-cli—making it easier for new users to get started. Please refer to this documentation guide and the CLI documentation for usage instructions.

### Plugin System
The plugin system is the core of WaveYo-API, enabling service modularization and functional extension, which facilitates maintenance and management. All business functionalities are dynamically loaded as plugins, supporting hot-swapping and flexible configuration.

### Intelligent Dependency Management
WaveYo-API utilizes an advanced dependency management system that supports automatic dependency installation, conflict detection, and version management. This clarifies dependencies between plugins and reduces configuration complexity.

### Unified Environment Management
WaveYo-API offers a robust environment variable validation framework, supporting type checking, default value setting, and mandatory validation, ensuring configuration security and consistency.

## Dependency Management

Through the uv package manager, it provides necessary dependency management for your plugins (i.e., **"intelligent management"** of dependencies).

This is particularly useful when you have requirements such as:

- Multiple plugins sharing the same dependency package versions
- Automatically handling dependency conflicts and version compatibility issues
- Support for the uv package management tool
- Providing detailed dependency installation logs and error reports
- Ensuring service discovery and dependency injection between plugins

It accomplishes the above while minimizing configuration complexity and maintenance costs.

## Core Architectural Advantages

### Core-Plugin Separation
WaveYo-API adopts a clear core-plugin architecture design. The core framework remains lightweight and stable, while all business functionalities are implemented through plugins, ensuring system maintainability and extensibility.

### Unified Log Management
It provides custom log formats and a unified management mechanism. All plugins share the same logging configuration, ensuring consistency and readability of log output.

### Cross-Plugin Service Sharing
Through a shared dependency registry mechanism, plugins can register services to a shared registry. Other plugins can then obtain these shared services via dependency injection, enabling seamless collaboration between plugins.