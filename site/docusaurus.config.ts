import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Containers for GenAI & Agentic AI',
  tagline: 'The Open-Source Way',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://schoolofdevops.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served.
  // Project Pages at https://schoolofdevops.github.io/303-containerai/
  baseUrl: '/303-containerai/',

  // GitHub pages deployment config.
  organizationName: 'schoolofdevops',
  projectName: '303-containerai',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Enable Mermaid diagrams
  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    announcementBar: {
      id: 'star_repo',
      content: '⭐ If this course helps you, <a href="https://github.com/schoolofdevops/303-containerai" target="_blank" rel="noopener noreferrer">star it on GitHub</a> — it helps others find it!',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true,
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Containers for GenAI & Agentic AI',
      logo: {
        alt: 'School of DevOps & AI Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'courseSidebar',
          position: 'left',
          label: 'Course',
        },
        {
          href: 'https://github.com/schoolofdevops/303-containerai',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Course',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'School of DevOps & AI',
          items: [
            {
              label: 'Website',
              href: 'https://schoolofdevops.com',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/schoolofdevops',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} School of DevOps & AI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
