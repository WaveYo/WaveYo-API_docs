import React from "react";
import CodeBlock from "@theme/CodeBlock";
import Translate from "@docusaurus/Translate";
import styles from './styles.module.css';

export function HomeFeature({
  title,
  tagline,
  description,
  annotaion,
  children,
}) {
  return (
    <div className={styles.featureContainer}>
      <p className={styles.featureTagline}>
        {tagline}
      </p>
      <h1 className={styles.featureTitle}>
        {title}
      </h1>
      <p className={styles.featureDescription}>{description}</p>
      {children}
      <p className={styles.featureAnnotation}>{annotaion}</p>
    </div>
  );
}

function HomeFeatureSingleColumn(props) {
  return (
    <div className={styles.singleColumnLayout}>
      <HomeFeature {...props} />
    </div>
  );
}

function HomeFeatureDoubleColumn({
  features: [feature1, feature2],
  children,
}) {
  const [children1, children2] = children ?? [];

  return (
    <div className={styles.doubleColumnLayout}>
      <div>
        <HomeFeature {...feature1}>{children1}</HomeFeature>
      </div>
      <div>
        <HomeFeature {...feature2}>{children2}</HomeFeature>
      </div>
    </div>
  );
}

function HomeFeatures() {
  return (
    <>
      {/* CLI 工具使用 - 单独显示在最上方 */}
      <HomeFeatureSingleColumn
        title={<Translate id="home.features.cli.title">CLI 工具使用</Translate>}
        tagline="command line interface"
        description={<Translate id="home.features.cli.description">WaveYo-API 提供了强大的命令行工具来简化插件开发和管理流程</Translate>}
      >
        <CodeBlock
          title="CLI 命令示例"
          language="bash"
          className={styles['home-codeblock']}
        >
          {[
            "# 创建新插件",
            "yoapi plugin new my-plugin",
            "",
            "# 下载插件",
            "yoapi plugin download WaveYo/yoapi_plugin_demoapi",
            "",
            "# 列出已安装插件",
            "yoapi plugin list",
            "",
            "# 运行项目",
            "yoapi run --reload",
          ].join("\n")}
        </CodeBlock>
      </HomeFeatureSingleColumn>

      {/* 第一排：插件元数据管理和智能依赖解析 */}
      <HomeFeatureDoubleColumn
        features={[
          {
            title: <Translate id="home.features.metadata.title">插件元数据管理</Translate>,
            tagline: "plugin metadata management",
            description: <Translate id="home.features.metadata.description">统一的插件元数据管理系统，支持优先级加载、依赖管理和向后兼容</Translate>,
          },
          {
            title: <Translate id="home.features.dependency.title">智能依赖解析</Translate>,
            tagline: "smart dependency resolution",
            description: <Translate id="home.features.dependency.description">自动拓扑排序算法，支持依赖关系解析和循环依赖检测</Translate>,
          },
        ]}
      >
        <CodeBlock title="plugin.json 配置" language="json" className={styles['home-codeblock']}>
          {[
            "{",
            '  "name": "yoapi_plugin_demoapi",',
            '  "version": "0.1.0",',
            '  "description": "示例API插件",',
            '  "author": "开发者名称",',
            '  "priority": 50,',
            '  "dependencies": ["yoapi_plugin_log"],',
            '  "tags": ["api", "example"]',
            "}",
          ].join("\n")}
        </CodeBlock>
        <CodeBlock title="依赖注入示例" language="python" className={styles['home-codeblock']}>
          {[
            "def register(app, **dependencies):",
            "    # 获取日志服务",
            "    log_service = dependencies.get('log_service')",
            "    logger = log_service.get_logger(__name__)",
            "    ",
            "    # 获取数据库服务",
            "    db_service = dependencies.get('db_service')",
            "    ",
            "    # 获取配置服务",
            "    config = dependencies.get('config')",
            "    ",
            "    logger.info(\"插件已成功注册\")",
          ].join("\n")}
        </CodeBlock>
      </HomeFeatureDoubleColumn>

      {/* 第二排：环境变量验证和插件类型系统 */}
      <HomeFeatureDoubleColumn
        features={[
          // {
          //   title: "环境变量验证",
          //   tagline: "environment validation",
          //   description: "强大的环境变量验证框架，支持类型检查、默认值和必需性验证",
          // },
          {
            title: <Translate id="home.features.logging.title">日志系统</Translate>,
            tagline: "logging system",
            description: <Translate id="home.features.logging.description">统一的日志格式和级别管理，支持模块化日志记录和上下文信息</Translate>,
          },
          {
            title: <Translate id="home.features.pluginTypes.title">插件类型系统</Translate>,
            tagline: "plugin type system",
            description: <Translate id="home.features.pluginTypes.description">支持多种插件类型：API端点、数据库服务、认证授权、工具类插件</Translate>,
          },
        ]}
      >
        <CodeBlock title="日志格式示例" language="text" className={styles['home-codeblock']}>
          {[
            "[INFO][plugin_manager]2025-09-05-14:30:25 || 插件 yoapi_plugin_demoapi 加载成功",
            "[DEBUG][demoapi]2025-09-05-14:30:26 || 数据库连接已建立",
            "[WARNING][auth]2025-09-05-14:30:27 || API密钥验证失败，ID: 67fac2dc-7c19-11f0-b527-b8cef6abb894",
            "[ERROR][database]2025-09-05-14:30:28 || 数据库查询超时",
            "[CRITICAL][core]2025-09-05-14:30:29 || 无法连接到主数据库",
          ].join("\n")}
        </CodeBlock>
        {/* <CodeBlock title="环境变量验证" language="python" className={styles['home-codeblock']}>
          {[
            "from core.env_validator import get_env_validator, EnvVarType",
            "",
            "# 定义环境变量模式",
            "ENV_SCHEMA = {",
            '    "DB_URL": {',
            '        "type": EnvVarType.STRING,',
            '        "required": True,',
            '        "description": "数据库连接URL"',
            "    },",
            '    "MAX_CONNECTIONS": {',
            '        "type": EnvVarType.INTEGER,',
            '        "required": False,',
            '        "default": 10,',
            '        "min": 1,',
            '        "max": 100',
            "    }",
            "}",
            "",
            "# 验证环境变量",
            "validator = get_env_validator()",
            "env_vars = validator.validate_env_vars(\"demo\", ENV_SCHEMA)",
          ].join("\n")}
        </CodeBlock> */}
        <CodeBlock title="API端点插件示例" language="python" className={styles['home-codeblock']}>
          {[
            "from fastapi import APIRouter, Depends",
            "",
            "router = APIRouter(prefix=\"/api\", tags=[\"api\"])",
            "",
            "@router.get(\"/items\")",
            "async def get_items():",
            "    return {\"items\": []}",
            "",
            "def register(app, **dependencies):",
            "    log_service = dependencies.get('log_service')",
            "    logger = log_service.get_logger(__name__)",
            "    ",
            "    app.include_router(router)",
            "    logger.info(\"API插件已注册\")",
          ].join("\n")}
        </CodeBlock>
      </HomeFeatureDoubleColumn>

      {/* 第三排：日志系统和错误处理 */}
      <HomeFeatureDoubleColumn
        features={[
          {
            title: <Translate id="home.features.environment.title">环境变量验证</Translate>,
            tagline: "environment validation",
            description: <Translate id="home.features.environment.description">强大的环境变量验证框架，支持类型检查、默认值和必需性验证</Translate>,
          },
          // {
          //   title: "日志系统",
          //   tagline: "logging system",
          //   description: "统一的日志格式和级别管理，支持模块化日志记录和上下文信息",
          // },
          {
            title: <Translate id="home.features.errorHandling.title">错误处理</Translate>,
            tagline: "error handling",
            description: <Translate id="home.features.errorHandling.description">完善的错误处理机制，支持异常捕获、日志记录和友好的错误响应</Translate>,
          },
        ]}
      >
        <CodeBlock title="环境变量验证" language="python" className={styles['home-codeblock']}>
          {[
            "from core.env_validator import get_env_validator, EnvVarType",
            "",
            "# 定义环境变量模式",
            "ENV_SCHEMA = {",
            '    "DB_URL": {',
            '        "type": EnvVarType.STRING,',
            '        "required": True,',
            '        "description": "数据库连接URL"',
            "    },",
            '    "MAX_CONNECTIONS": {',
            '        "type": EnvVarType.INTEGER,',
            '        "required": False,',
            '        "default": 10,',
            '        "min": 1,',
            '        "max": 100',
            "    }",
            "}",
            "",
            "# 验证环境变量",
            "validator = get_env_validator()",
            "env_vars = validator.validate_env_vars(\"demo\", ENV_SCHEMA)",
          ].join("\n")}
        </CodeBlock>

        {/* <CodeBlock title="日志格式示例" language="text" className={styles['home-codeblock']}>
          {[
            "[INFO][plugin_manager]2025-09-05-14:30:25 || 插件 yoapi_plugin_demoapi 加载成功",
            "[DEBUG][demoapi]2025-09-05-14:30:26 || 数据库连接已建立",
            "[WARNING][auth]2025-09-05-14:30:27 || API密钥验证失败，ID: 67fac2dc-7c19-11f0-b527-b8cef6abb894",
            "[ERROR][database]2025-09-05-14:30:28 || 数据库查询超时",
            "[CRITICAL][core]2025-09-05-14:30:29 || 无法连接到主数据库",
          ].join("\n")}
        </CodeBlock> */}
        <CodeBlock title="错误处理示例" language="python" className={styles['home-codeblock']}>
          {[
            "def register(app, **dependencies):",
            "    try:",
            "        log_service = dependencies.get('log_service')",
            "        logger = log_service.get_logger(__name__)",
            "        ",
            "        # 插件初始化逻辑",
            "        initialize_plugin()",
            "        ",
            "        logger.info(\"插件初始化成功\")",
            "    except Exception as e:",
            "        logger.error(f\"插件初始化失败: {e}\")",
            "        # 可以选择重新抛出异常或进行恢复处理",
            "        raise",
          ].join("\n")}
        </CodeBlock>
      </HomeFeatureDoubleColumn>
    </>
  );
}

export default React.memo(HomeFeatures);
