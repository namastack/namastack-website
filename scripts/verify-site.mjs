import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import metadata from '../site-products.cjs';

const read = (route) => readFileSync(path.join('build', route, 'index.html'), 'utf8');
for (const route of ['', 'outbox', 'once', 'docs', 'sponsor', 'contributing', 'legal-notice']) {
  assert.ok(existsSync(path.join('build', route, 'index.html')), `Missing page: /${route}/`);
}
assert.ok(read('').includes('/once/'), 'Homepage must feature Once');
assert.ok(read('once').includes('namastack-once-v1.mp4'), 'Once showreel missing');
assert.ok(read('docs').includes('/outbox/quickstart/'));
assert.ok(read('docs').includes('/once/quickstart/'));
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
const onceNav = navbar(read('once/quickstart'));
const outboxNav = navbar(read('outbox/quickstart'));
assert.ok(
  onceNav.includes(metadata.onceVersions[0]),
  'Once dropdown must show its released documentation line',
);
assert.ok(!onceNav.includes('/outbox/1.10.x/'), 'Outbox versions leaked into Once dropdown');
assert.ok(outboxNav.includes('/outbox/1.10.x/'), 'Outbox archive version missing');
assert.ok(!outboxNav.includes('/once/next/'), 'Once version leaked into Outbox dropdown');
assert.ok(
  !navbar(read('')).includes(metadata.onceVersions[0]),
  'Homepage must not show a docs version selector',
);
for (const [source, target] of [
  ['docs/quickstart', '/outbox/quickstart/'],
  ['docs/outbox/quickstart', '/outbox/quickstart/'],
  ['docs/once/quickstart', '/once/quickstart/'],
  ['docs/1.10.x/quickstart', '/outbox/1.10.x/quickstart/'],
  ['docs/outbox/1.10.x/quickstart', '/outbox/1.10.x/quickstart/'],
  ['docs/sponsor', '/sponsor/'],
]) {
  assert.ok(read(source).includes(`url=${target}`), `Static fallback missing for ${source}`);
}
const once = read('once/quickstart');
assert.ok(once.includes('namastack-once-bom:0.1.0'));
assert.ok(!once.includes('0.1.0-SNAPSHOT') && !once.includes('Preview documentation'));
assert.ok(!once.includes('mavenLocal()') && !once.includes('publishToMavenLocal'));
assert.ok(read('outbox/next/migrations').includes('Migrations'));
assert.ok(existsSync('build/videos/namastack-once-v1.en.vtt'));
const robots = readFileSync('build/robots.txt', 'utf8');
assert.ok(robots.includes('Disallow: /once/next/'));
assert.ok(!robots.split('\n').includes('Disallow: /once/'));
assert.ok(
  readFileSync('build/sitemap.xml', 'utf8').includes('/once/quickstart/'),
  'Released Once documentation must be indexed',
);
const data = JSON.parse(readFileSync('.docusaurus/globalData.json', 'utf8'))[
  'docusaurus-plugin-content-docs'
];
for (const product of metadata.products) {
  assert.deepEqual(
    data[product.id].versions.map((version) => version.name),
    ['current', ...product.versions],
  );
}
assert.ok(
  readdirSync('build').some((name) => name.startsWith('search-index')),
  'Search indexes missing',
);
console.log(
  'Product pages, independent version menus and archives, legacy redirects, release metadata, search output and video captions verified.',
);

assert.ok(
  readdirSync('build').some((name) => name.startsWith('search-index') && name.includes('once')),
  'Once search index missing',
);

const canonical = (html) => html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
assert.equal(canonical(read('once/next/quickstart')), 'https://www.namastack.io/once/quickstart/');
assert.equal(
  canonical(read('outbox/1.10.x/quickstart')),
  'https://www.namastack.io/outbox/quickstart/',
);

for (const product of metadata.products) {
  for (const prefix of [
    '',
    'next/',
    ...product.versions.slice(1).map((version) => `${version}/`),
  ]) {
    const html = read(`${product.route}/${prefix}`);
    assert.ok(
      html.includes('theme-doc-sidebar-container'),
      `${product.name} ${prefix} overview sidebar missing`,
    );
    assert.ok(html.includes('Start building with'), `${product.name} ${prefix} overview missing`);
  }
  assert.ok(
    read(`${product.route}/quickstart`).includes('theme-doc-sidebar-container'),
    `${product.name} quickstart sidebar missing`,
  );
}
assert.ok(!navbar(read('')).includes('>Products<'));
assert.ok(!navbar(read('')).includes('>Docs<'));
for (const prefix of ['', ...metadata.outboxVersions.slice(1).map((version) => `${version}/`)]) {
  assert.ok(
    !read(`outbox/${prefix}`).includes('/outbox/next/migrations/2-0-0/'),
    `Upcoming migration guide leaked into Outbox ${prefix || 'stable'} overview or sidebar`,
  );
}
assert.ok(read('outbox/next').includes('/outbox/next/migrations/2-0-0/'));

for (const product of ['outbox', 'once']) {
  for (const policy of ['security-policy']) {
    const route = `${product}/${policy}`;
    assert.ok(existsSync(path.join('build', route, 'index.html')), `Missing policy: ${route}`);
    assert.ok(
      navbar(read('')).includes(`/${route}/`),
      `Policy missing from Community menu: ${route}`,
    );
  }
  assert.ok(
    read(`${product}/security-policy`).includes(`namastack-${product}/security/advisories/new`),
    `Private reporting must target the correct repository: ${product}`,
  );
}

assert.ok(read('support-and-update-policy').includes('Namastack Once'));
assert.ok(read('support-and-update-policy').includes('Namastack Outbox'));
assert.ok(navbar(read('')).includes('/support-and-update-policy/'));
for (const product of ['outbox', 'once']) {
  assert.ok(
    read(`${product}/support-and-update-policy`).includes('url=/support-and-update-policy/'),
  );
  assert.ok(read(`${product}/security-policy`).includes('href="/support-and-update-policy/"'));
}

for (const product of metadata.products) {
  for (const prefix of [
    '',
    'next/',
    ...product.versions.slice(1).map((version) => `${version}/`),
  ]) {
    const html = read(`${product.route}/${prefix}reference`).replace(/<!--[\s\S]*?-->/g, '');
    assert.ok(
      html.includes(`Technical reference for Namastack ${product.name}`),
      `${product.name} ${prefix} Reference landing page missing`,
    );
    assert.ok(html.includes('theme-doc-sidebar-container'));
  }
  for (const version of product.versions) {
    const sidebars = JSON.parse(
      readFileSync(`${product.id}_versioned_sidebars/version-${version}-sidebars.json`, 'utf8'),
    );
    const items = Object.values(sidebars)[0].filter((item) => item.type !== 'html');
    assert.equal(items[0], 'overview');
    assert.equal(items[1], 'quickstart');
    assert.equal(items[2].label, 'Reference');
    assert.equal(items[2].collapsible, false);
    assert.equal(items[2].link.id, 'reference/index');
  }
}
for (const prefix of ['', 'next/']) {
  assert.ok(read(`once/${prefix}reference/usage/integrations`).includes('effectively-once'));
  assert.ok(
    read(`once/${prefix}persistence/jdbc`).includes(
      `url=/once/${prefix}reference/persistence/jdbc/`,
    ),
  );
}
