import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import versions from './outbox_versions.json';
import onceVersions from './once_versions.json';

// First entry in outbox_versions.json is the latest stable version
const latestVersion = versions[0];
const olderVersions = versions.slice(1);

// Build version config: latest gets indexed, all others get noIndex
const versionConfig: Record<string, {label: string; noIndex?: boolean}> = {
  current: {label: 'Next', noIndex: true},
  [latestVersion]: {label: latestVersion},
};
for (const v of olderVersions) {
  versionConfig[v] = {label: v, noIndex: true};
}

// Sitemap ignore patterns: exclude old versions, "next", and low-value pages
const sitemapIgnorePatterns = [
  '/outbox/next/**',
  '/legal-notice/**',
  '/once/next/**',
  ...onceVersions.slice(1).map((v) => `/once/${v}/**`),
  ...olderVersions.map((v) => `/outbox/${v}/**`),
];

const config: Config = {
  title: 'Namastack',
  tagline: 'Reliable foundations for event-driven systems',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: false, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://www.namastack.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'namastack', // Usually your GitHub org/user name.
  projectName: 'namastack-website', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        blog: false,
        docs: {
          id: 'outbox',
          path: 'docs-outbox',
          routeBasePath: '/outbox',
          sidebarPath: './sidebarsOutbox.ts',
          lastVersion: latestVersion,
          versions: versionConfig,
          editUrl: 'https://github.com/namastack/namastack-website/edit/main/',
        },
        sitemap: {
          changefreq: 'weekly' as const,
          priority: 0.5,
          ignorePatterns: [...sitemapIgnorePatterns, '/search/**'],
          async createSitemapItems({defaultCreateSitemapItems, ...params}) {
            const items = await defaultCreateSitemapItems({...params});
            return items.map((item) => {
              // Give the homepage and quickstart higher priority
              const pathname = new URL(item.url).pathname;
              if (
                pathname === '/' ||
                pathname === '/outbox/' ||
                pathname === '/once/' ||
                pathname === '/docs/' ||
                pathname.includes('/quickstart/')
              ) {
                return {...item, priority: 0.8};
              }
              return item;
            });
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    './plugins/canonical-fix-plugin.js',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'once',
        path: 'docs-once',
        routeBasePath: '/once',
        sidebarPath: './sidebarsOnce.ts',
        lastVersion: onceVersions[0] ?? 'current',
        versions: {
          current: {label: 'Next', path: 'next', noIndex: true},
          ...Object.fromEntries(
            onceVersions.map((version) => [version, {label: version, noIndex: version !== onceVersions[0]}]),
          ),
        },
        editUrl: 'https://github.com/namastack/namastack-website/edit/main/',
      },
    ],
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: 'en',
        indexDocs: true,
        forceIgnoreNoIndex: true, // Next and archived docs remain searchable within the site.
        indexBlog: false,
        indexPages: true,
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: ['/outbox', '/once'],
        docsDir: ['docs-outbox', 'docs-once'],
        docsPluginIdForPreferredVersion: 'outbox',
        searchContextByPaths: [
          {path: 'outbox', label: 'Outbox'},
          {path: 'once', label: 'Once'},
        ],
        useAllContextsWithNoSearchContext: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/og-image-v3.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'Namastack, outbox pattern, spring boot, transactional outbox, transactional messaging, idempotency, duplicate protection, Namastack Once, ' +
          'distributed systems, event-driven architecture, at-least-once delivery, ' +
          'Java, Kotlin, Spring, microservices, reliable messaging',
      },
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Namastack',
      logo: {
        alt: 'Namastack',
        src: 'img/namastack_logo.svg',
        href: '/',
        width: 28,
        height: 28,
      },
      items: [
        {label: 'Outbox', to: '/outbox/', position: 'left', activeBaseRegex: '^/outbox/'},
        {label: 'Once', to: '/once/', position: 'left', activeBaseRegex: '^/once/'},
        {
          label: 'Community',
          position: 'left',
          items: [
            {label: 'Contributing', to: '/contributing/'},
            {label: 'Support policy', to: '/support-and-update-policy/'},
            {label: 'Outbox security policy', to: '/outbox/security-policy/'},
            {label: 'Once security policy', to: '/once/security-policy/'},
            {label: 'Discord', href: 'https://discord.gg/XNHP5Yhxy7'},
          ],
        },
        {type: 'search', position: 'right'},
        {type: 'custom-productVersion', position: 'right'},
        {to: '/sponsor/', label: 'Sponsor', position: 'right', className: 'navbar__sponsor'},
        {
          label: 'GitHub',
          position: 'right',
          items: [
            {label: 'Namastack Outbox', href: 'https://github.com/namastack/namastack-outbox'},
            {label: 'Namastack Once', href: 'https://github.com/namastack/namastack-once'},
          ],
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {label: 'Namastack Outbox', to: '/outbox/'},
            {label: 'Namastack Once', to: '/once/'},
          ],
        },
        {
          title: 'Documentation',
          items: [
            {label: 'Outbox quickstart', to: '/outbox/quickstart/'},
            {label: 'Once quickstart', to: '/once/quickstart/'},
            {label: 'Outbox migration guides', to: '/outbox/next/migrations/'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Contributing', to: '/contributing/'},
            {
              label: 'Outbox discussions',
              href: 'https://github.com/namastack/namastack-outbox/discussions',
            },
            {
              label: 'Once discussions',
              href: 'https://github.com/namastack/namastack-once/discussions',
            },
            {label: 'Discord', href: 'https://discord.gg/XNHP5Yhxy7'},
          ],
        },
        {
          title: 'Namastack',
          items: [
            {label: 'Home', to: '/'},
            {label: 'Sponsor', to: '/sponsor/'},
            {label: 'Legal notice', to: '/legal-notice/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Namastack. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
