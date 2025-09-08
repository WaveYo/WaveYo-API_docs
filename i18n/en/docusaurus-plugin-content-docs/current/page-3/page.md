---
sidebar_position: 1
---

# Publishing Plugins

:::warning  
This document's language version is translated by DeepSeek AI. For any questions, please refer to the original Chinese version of the document.  
:::

WaveYo-API provides developers with a way to share plugins with others - the [Store](/store).

This section will explain how to publish your developed plugins to the Store.

:::tip Tip
This section only covers the plugin publishing process. For plugin development, please refer to the previous chapters.
:::

## Preparation

### Plugin Naming Convention

WaveYo-API plugins use the following naming conventions:

For project names, it's recommended to start with `yoapi_plugin_` followed by your chosen plugin name, with words separated by underscores `_`.

Project names are used for code repository names, store publishing names, etc.;
This document uses `yoapi_plugin_{your_plugin_name}` as an example.
For module names, it's recommended to match the project name but with words separated by underscores _, i.e., starting with yoapi_plugin_ followed by your chosen plugin name;
Module names are used for program imports and should match the plugin file (or folder) name;
This document uses `yoapi_plugin_{your_plugin_name}` as an example.

### Project Structure

:::tip Tip
The project structure described in this section is only a recommendation, not a requirement. Ensure practical usability.
:::

The plugin program structure can refer to the plugin structure section, with the only difference being that the plugin package can be directly at the top level of the project.

One possible organizational structure for plugin projects is as follows:
```tree
plugins/
└── yoapi_plugin_{your_plugin_name}/
    ├── __init__.py          # Main file, must contain register function
    ├── plugin.json          # Plugin metadata file
    ├── requirements.txt     # Plugin dependencies
    ├── README.md
    ├── .env                # Plugin environment variables (optional)
    └── routers/            # Sub-routers (optional)
        └── v1.py
```

### Plugin Dependencies
This section guides you in filling out plugin dependencies to avoid incorrect dependency information causing plugin malfunction.

Basic principle for dependency filling: Add third-party package dependencies for any libraries directly imported by your program; lock third-party package versions based on the features you use.

### Filling Plugin Metadata

Although WaveYo-API currently allows plugins without metadata, it's recommended to add it, as future versions may remove compatibility with metadata-less plugins at any time.

Here's an example:

```json
{
  "name": "yoapi_plugin_{your_plugin_name}",
  "version": "0.1.0",
  "description": "Example plugin",
  "author": "Developer Name",
  "priority": 50,
  "dependencies": ["yoapi_plugin_log"],
  "tags": ["example", "hello-world"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/yoapi_plugin_{your_plugin_name}"
  }
}
```

## Publishing to [GitHub](https://github.com)
Upload your plugin code to a GitHub repository and ensure the repository is public.

:::tip Tip
Before publishing, it's recommended to test whether the built package works to avoid issues like missing code files or resource files.
:::

After some time, the plugin will be automatically synchronized to the [Store](/store).

:::warning Note
Do not publish any plugins containing illegal or non-compliant information, as they will be blocked from display in the Store.
:::