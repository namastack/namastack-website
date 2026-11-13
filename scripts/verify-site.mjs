import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import metadata from '../site-products.cjs';

const read = (route) => readFileSync(path.join('build', route, 'index.html'), 'utf8');
for (const route of [
  '',
  'outbox',
  'once',
  'docs',
  'docs/outbox',
  'docs/once',
  'sponsor',
  'contributing',
  'legal-notice',
]) {
  assert.ok(existsSync(path.join('build', route, 'index.html')), `Missing page: /${route}/`);
}
assert.ok(read('').includes('/once/'), 'Homepage must feature Once');
assert.ok(read('once').includes('namastack-once-v1.mp4'), 'Once showreel missing');
assert.ok(read('docs').includes('/docs/outbox/quickstart/'));
assert.ok(read('docs').includes('/docs/once/quickstart/'));
for (const product of metadata.products) {
  for (const prefix of [
    '',
    'next/',
    ...product.versions.slice(1).map((version) => `${version}/`),
  ]) {
    assert.ok(
      existsSync(path.join('build', product.route, prefix, 'quickstart/index.html')),
      `${product.name} ${prefix} quickstart missing`,
    );
  }
}
const navbar = (html) => html.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
const onceNav = navbar(read('docs/once/quickstart'));
const outboxNav = navbar(read('docs/outbox/quickstart'));
assert.ok(onceNav.includes(`${metadata.onceVersions[0]} Preview`), 'Once dropdown must show its preview version');
assert.ok(!onceNav.includes('/docs/outbox/1.10.x/'), 'Outbox versions leaked into Once dropdown');
assert.ok(outboxNav.includes('/docs/outbox/1.10.x/'), 'Outbox archive version missing');
assert.ok(!outboxNav.includes('/docs/once/next/'), 'Once version leaked into Outbox dropdown');
assert.ok(
  !navbar(read('')).includes(`${metadata.onceVersions[0]} Preview`),
  'Homepage must not show a docs version selector',
);
for (const [source, target] of [
  ['docs/quickstart', '/docs/outbox/quickstart/'],
  ['outbox/quickstart', '/docs/outbox/quickstart/'],
  ['docs/1.10.x/quickstart', '/docs/outbox/1.10.x/quickstart/'],
  ['outbox/1.10.x/quickstart', '/docs/outbox/1.10.x/quickstart/'],
  ['docs/sponsor', '/sponsor/'],
]) {
  assert.ok(read(source).includes(`url=${target}`), `Static fallback missing for ${source}`);
}
const once = read('docs/once/quickstart');
assert.ok(once.includes('namastack-once-bom') && once.includes('Preview documentation'));
assert.ok(read('docs/outbox/next/migrations').includes('Migrations'));
assert.ok(existsSync('build/videos/namastack-once-v1.en.vtt'));
assert.ok(readFileSync('build/robots.txt', 'utf8').includes('Disallow: /docs/once/'));
assert.ok(
  !readFileSync('build/sitemap.xml', 'utf8').includes('/docs/once/quickstart/'),
  'Preview documentation must not be indexed as stable',
);
const data = JSON.parse(readFileSync('.docusaurus/globalData.json', 'utf8'))[
  'docusaurus-plugin-content-docs'
];
for (const product of metadata.products) {
  assert.deepEqual(data[product.id].versions.map(version => version.name), ['current', ...product.versions]);
}
assert.ok(
  readdirSync('build').some((name) => name.startsWith('search-index')),
  'Search indexes missing',
);
console.log(
  'Product pages, independent version menus and archives, legacy redirects, preview metadata, search output and video captions verified.',
);

assert.ok(readdirSync('build').some(name => name.startsWith('search-index') && name.includes('docs-once')), 'Once search index missing');

const canonical = html => html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
assert.equal(canonical(read('docs/once/next/quickstart')), 'https://www.namastack.io/docs/once/quickstart/');
assert.equal(canonical(read('docs/outbox/1.10.x/quickstart')), 'https://www.namastack.io/docs/outbox/quickstart/');
