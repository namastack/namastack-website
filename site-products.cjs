const fs = require('node:fs');
const path = require('node:path');
const outboxVersions = require('./versions.json');
const onceVersionsPath = path.join(__dirname, 'once_versions.json');
const onceVersions = fs.existsSync(onceVersionsPath)
  ? JSON.parse(fs.readFileSync(onceVersionsPath, 'utf8'))
  : [];

const products = [
  {id: 'default', name: 'Outbox', route: 'docs/outbox', versions: outboxVersions},
  {id: 'once', name: 'Once', route: 'docs/once', versions: onceVersions},
];

function getLegacyRedirects() {
  const redirects = [];
  for (const prefix of ['/docs', '/outbox']) {
    for (const section of ['quickstart', 'reference', 'migrations', 'next']) {
      redirects.push({
        source: `${prefix}/${section}/:path*`,
        destination: `/docs/outbox/${section}/:path*`,
        permanent: true,
      });
    }
    for (const [index, version] of outboxVersions.entries()) {
      redirects.push({
        source: `${prefix}/${version}/:path*`,
        destination: `/docs/outbox/${index === 0 ? '' : `${version}/`}:path*`,
        permanent: index !== 0,
      });
    }
    for (const page of ['contributing', 'sponsor', 'legal-notice']) {
      redirects.push({
        source: `${prefix}/${page}/:path*`,
        destination: `/${page}/:path*`,
        permanent: true,
      });
    }
    redirects.push({
      source: `${prefix}/support-and-update-policy/:path*`,
      destination: '/docs/outbox/support-and-update-policy/:path*',
      permanent: true,
    });
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
