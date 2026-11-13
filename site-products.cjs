const fs = require('node:fs');
const path = require('node:path');
const outboxVersions = require('./outbox_versions.json');
const onceVersionsPath = path.join(__dirname, 'once_versions.json');
const onceVersions = fs.existsSync(onceVersionsPath)
  ? JSON.parse(fs.readFileSync(onceVersionsPath, 'utf8'))
  : [];

const products = [
  {id: 'outbox', name: 'Outbox', route: 'outbox', versions: outboxVersions},
  {id: 'once', name: 'Once', route: 'once', versions: onceVersions},
];

function getLegacyRedirects() {
  const redirects = [];
  const add = (source, destination, permanent = true) =>
    redirects.push({source: `${source}/:path*`, destination: `${destination}/:path*`, permanent});

  for (const prefix of ['/docs', '/docs/outbox', '/outbox', '/docs/once', '/once']) {
    for (const page of ['contributing', 'sponsor', 'legal-notice', 'support-and-update-policy']) {
      add(`${prefix}/${page}`, `/${page}`);
    }
  }
  for (const section of ['quickstart', 'reference', 'migrations', 'next']) {
    add(`/docs/${section}`, `/outbox/${section}`);
  }
  for (const [index, version] of outboxVersions.entries()) {
    add(`/docs/${version}`, `/outbox${index === 0 ? '' : `/${version}`}`, index !== 0);
  }
  // Once technical pages now follow the same /reference/ structure as Outbox.
  const oncePrefixes = [
    {source: '', target: '', permanent: true},
    {source: 'next/', target: 'next/', permanent: true},
    ...onceVersions.map((version, index) => ({
      source: `${version}/`,
      target: index === 0 ? '' : `${version}/`,
      permanent: index !== 0,
    })),
  ];
  for (const namespace of ['/once', '/docs/once']) {
    for (const prefix of oncePrefixes) {
      for (const section of [
        'concepts',
        'usage',
        'persistence',
        'operations',
        'configuration',
        'examples',
      ]) {
        add(
          `${namespace}/${prefix.source}${section}`,
          `/once/${prefix.target}reference/${section}`,
          prefix.permanent,
        );
      }
    }
  }
  for (const product of products) {
    const latest = product.versions[0];
    if (latest) {
      add(`/docs/${product.route}/${latest}`, `/${product.route}`, false);
      add(`/${product.route}/${latest}`, `/${product.route}`, false);
    }
    add(`/docs/${product.route}`, `/${product.route}`);
  }
  redirects.push(
    {source: '/outbox/search/:path*', destination: '/search/:path*', permanent: true},
    {source: '/outbox/img/:path*', destination: '/img/:path*', permanent: true},
    {source: '/outbox/sitemap.xml', destination: '/sitemap.xml', permanent: true},
    {source: '/outbox/robots.txt', destination: '/robots.txt', permanent: true},
  );
  // Capture the trailing slash in canonical Docusaurus URLs on both native
  // Vercel Git builds and prebuilt CI deployments. Retain the legacy pattern
  // as a fallback for old URLs without the separating slash.
  return redirects.flatMap((rule) =>
    rule.source.endsWith('/:path*')
      ? [
          {
            ...rule,
            source: rule.source.replace('/:path*', '/:path(.*)'),
            destination: rule.destination.replace(':path*', ':path'),
          },
          rule,
        ]
      : [rule],
  );
}

module.exports = {products, outboxVersions, onceVersions, getLegacyRedirects};
