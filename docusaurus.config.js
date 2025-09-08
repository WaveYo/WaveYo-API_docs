// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'WaveYo-API',
  tagline: '核心-插件 架构的高性能API框架',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://waveyo-api-docs.waveyo.store',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/WaveYo/WaveYo-API_docs/tree/master/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/WaveYo/WaveYo-API_docs/tree/master/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // 主题颜色模式配置
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'WaveYo-API',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'start/overview',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/store',
            position: 'left',
            label: 'Store',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: "WaveYo-API",
            items: [
              {
                html: `
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <img alt="WaveYo Logo" src="/img/logo.svg" width="32" height="32" style="margin-right: 12px; border-radius: 50%;" />
                    <span style="font-weight: bold;">WaveYo-API</span>
                  </div>
                  <div style="font-size: 14px; color: #ffffffff; margin-bottom: 12px;">
                    核心-插件 架构的高性能API框架
                  </div>
                `,
              },
            ],
          },
          {
            title: "文档",
            items: [
              { label: "介绍", to: "/docs/start/overview" },
              { label: "快速开始", to: "/docs/start/get_started_quickly" },
            ],
          },
          {
            title: "WaveYo Team",
            items: [
              {
                label: "主页",
                href: "https://github.com/WaveYo",
              },
              {
                label: "WaveYo-API",
                href: "https://github.com/WaveYo/WaveYo-API",
              },
              { 
                label: "YoAPI CLI", 
                href: "https://github.com/WaveYo/yoapi-cli" 
              },
            ],
          },
          {
            title: "相关项目",
            items: [
              { 
                label: "MySQL插件", 
                href: "https://github.com/WaveYo/yoapi_plugin_mysqldb" 
              },
              { 
                label: "OpenAPI基础插件", 
                href: "https://github.com/WavesMan/yoapi_plugin_openapi_base" 
              },
            ],
          },
        ],          
        copyright: `Copyright © ${new Date().getFullYear()} WaveYo. All rights reserved.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

export default config;
