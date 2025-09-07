---
sidebar_position: 1
---

# 发布插件

WaveYo-API 为开发者提供了分享插件给大家使用的方式——[商店](/store)。

本章节将会介绍如何将我们写好的插件发布到商店。

:::tip 提示
本章节仅包含插件发布流程指导，插件开发请查阅前述章节。
:::

## 准备工作

### 插件命名规范

WaveYo-API 插件使用下述命名规范：

对于项目名，建议统一以 `yoapi_plugin_` 开头，之后为拟定的插件名字，词间用横杠 `_` 分隔；

项目名用于代码仓库名称、商店发布名称等；
本文使用 `yoapi_plugin_{your_plugin_name}` 为例。
对于模块名，建议与项目名一致，但词间用下划线 _ 分隔，即统一以 yoapi_plugin_ 开头，之后为拟定的插件名字；
模块名用于程序导入使用，应为插件文件（夹）的名称；
本文使用 `yoapi_plugin_{your_plugin_name}` 为例。

### 项目结构

:::tip 提示
本段所述的项目结构仅作推荐，不做强制要求，保证实际可用性即可。
:::

插件程序本身结构可参考插件结构一节，唯一区别在于，插件包可以直接处于项目顶层。

插件项目的一种组织结构如下：
```tree
plugins/
└── yoapi_plugin_{your_plugin_name}/
    ├── __init__.py          # 主文件，必须包含register函数
    ├── plugin.json          # 插件元数据文件
    ├── requirements.txt     # 插件依赖
    ├── README.md
    ├── .env                # 插件环境变量（可选）
    └── routers/            # 子路由（可选）
        └── v1.py
```

### 插件依赖
本段指导填写插件依赖，避免不正确的依赖信息导致插件无法正常工作。

依赖填写的基本原则：程序直接导入了什么第三方库，就添加什么第三方包依赖；能用哪些第三方库的特性，就根据使用的特性锁定第三方包版本。

### 填写插件元数据

虽然 WaveYo-API 暂时允许不添加元数据，但建议添加，后续版本随时可能会移除对无元数据插件的兼容性。

下面是一个示例：

```json
{
  "name": "yoapi_plugin_{your_plugin_name}",
  "version": "0.1.0",
  "description": "示例插件",
  "author": "开发者名称",
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

## 发布至 [GitHub](https://github.com)
将插件代码上传至 GitHub 仓库中，并确保仓库是公开仓库。

:::tip 提示
发布前建议自行测试构建包是否可用，避免遗漏代码文件或资源文件等问题。
:::

等待一段时间，插件将自动同步至[商店](/store)。

:::warning 注意
请勿发布任何包含违法违规信息的插件，否则将会被商店屏蔽展示。
:::