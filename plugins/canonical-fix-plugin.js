const fs = require('node:fs');
const path = require('node:path');
const {products, getLegacyRedirects} = require('../site-products.cjs');

module.exports = function siteMigrationPlugin({siteConfig}) {
  return {
    name: 'site-migration-plugin',
    async postBuild({outDir}) {
      const siteUrl = siteConfig.url;
      for (const product of products) {
        const root = path.join(outDir, product.route);
        const prefixes = [...product.versions.slice(1), 'next'];
        for (const prefix of prefixes) {
          for (const file of findHtmlFiles(path.join(root, prefix))) {
            const relative = path.relative(path.join(root, prefix), file);
            // A Next-only page must not canonicalize to a nonexistent stable page.
            if (!fs.existsSync(path.join(root, relative))) continue;
            const html = fs.readFileSync(file, 'utf8');
            const before = `${siteUrl}/${product.route}/${prefix}/`;
            const after = `${siteUrl}/${product.route}/`;
            fs.writeFileSync(
              file,
              html.replace(
                new RegExp(`(<link[^>]*rel="canonical"[^>]*href=")${escapeRegExp(before)}`),
                `$1${after}`,
              ),
            );
          }
        }
      }
      const outbox = products[0];
      const versions = [
        {name: outbox.versions[0], prefix: ''},
        ...outbox.versions.slice(1).map((name) => ({name, prefix: `${name}/`})),
        {name: 'next', prefix: 'next/'},
      ];
      for (const {name, prefix} of versions) {
        for (const [source, target, anchor, since] of [
          ['mongodb-schema', 'database', 'mongodb-schema', 5],
          ['rabbitmq', 'messaging', 'rabbitmq-integration', 7],
        ]) {
          if (
            name !== 'next' &&
            Number(name.split('.')[0]) === 1 &&
            Number(name.split('.')[1]) < since
          )
            continue;
          const targetPath = `/${outbox.route}/${prefix}reference/${target}/`;
          if (fs.existsSync(path.join(outDir, targetPath, 'index.html'))) {
            writeRedirect(
              path.join(outDir, outbox.route, prefix, 'reference', source, 'index.html'),
              `${targetPath}#${anchor}`,
              siteUrl,
            );
          }
        }
      }
      // Real HTTP redirects are configured on Vercel. These fallbacks also work
      // on ordinary static hosting, retaining query strings and fragment links.
      // Snapshot real output before generating fallbacks so aliases cannot be
      // recursively copied into themselves or into a second legacy namespace.
      const originalHtmlFiles = findHtmlFiles(outDir);
      for (const rule of getLegacyRedirects()) {
        const source = rule.source.replace(/\/:path(?:\*|\(\.\*\))$/, '');
        const target = rule.destination.replace(/\/:path\*?$/, '');
        const targetDir = path.join(outDir, target);
        const product = products.find((item) => target === `/${item.route}`);
        for (const file of originalHtmlFiles) {
          const relative = path.relative(targetDir, file);
          if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
          // A latest-version alias only exposes that snapshot, not other versions.
          if (
            product &&
            source.endsWith(`/${product.versions[0]}`) &&
            ['next', ...product.versions.slice(1)].includes(relative.split(path.sep)[0])
          )
            continue;
          const route = relative.replace(/index\.html$/, '').replaceAll(path.sep, '/');
          const dest = `${target}/${route}`;
          const output = path.join(outDir, source, relative);
          if (!fs.existsSync(output)) writeRedirect(output, dest, siteUrl);
        }
      }
      const exclusions = products.flatMap((product) => {
        const prefixes = ['next/', ...product.versions.slice(1).map((v) => `${v}/`)];
        return prefixes.map((prefix) => `Disallow: /${product.route}/${prefix}`);
      });
      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n${exclusions.join('\n')}\nSitemap: ${siteUrl}/sitemap.xml\n`,
      );
    },
  };
};

function findHtmlFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir, {withFileTypes: true})
    .flatMap((entry) =>
      entry.isDirectory()
        ? findHtmlFiles(path.join(dir, entry.name))
        : entry.name.endsWith('.html')
          ? [path.join(dir, entry.name)]
          : [],
    );
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function writeRedirect(file, target, siteUrl) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${siteUrl}${target.split('#')[0]}"><meta http-equiv="refresh" content="0; url=${target}"><title>Documentation moved</title></head><body><a href="${target}">Documentation moved</a><script>const target=new URL(${JSON.stringify(target)},location.origin);target.search=location.search;if(!target.hash)target.hash=location.hash;location.replace(target.toString());</script></body></html>`,
  );
}
