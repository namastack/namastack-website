import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import metadata from '../site-products.cjs';
import {withLegacyRedirects} from './prepare-vercel.mjs';

const {redirects} = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const output = {
  version: 3,
  routes: [{handle: 'filesystem'}],
  overrides: {'404.html': {path: '404'}},
};
const configured = withLegacyRedirects(output, redirects);
function redirect(path) {
  const route = configured.routes.find((route) => route.src && new RegExp(route.src).test(path));
  if (!route) return undefined;
  return {
    status: route.status,
    location: path.replace(new RegExp(route.src), route.headers.Location),
  };
}

test('canonical product overviews, documentation and archives are served directly', () => {
  for (const path of [
    '/',
    '/docs/',
    '/outbox/',
    '/once/',
    '/outbox/quickstart/',
    '/once/quickstart/',
    '/outbox/next/migrations/2-0-0/',
    `/outbox/${metadata.outboxVersions[1]}/quickstart/`,
    '/once/next/',
  ]) {
    assert.equal(redirect(path), undefined, `Unexpected redirect at ${path}`);
  }
  assert.equal(configured.routes.at(-1).handle, 'filesystem');
  assert.deepEqual(configured.overrides, output.overrides);
});

test('old namespaces preserve the product, version and trailing slash without redirect chains', () => {
  for (const [source, location] of [
    ['/docs/quickstart/', '/outbox/quickstart/'],
    ['/docs/outbox/', '/outbox/'],
    ['/docs/once/', '/once/'],
    ['/docs/outbox/quickstart/', '/outbox/quickstart/'],
    ['/docs/once/quickstart/', '/once/quickstart/'],
    ['/docs/next/reference/', '/outbox/next/reference/'],
    ['/docs/1.10.x/quickstart/', '/outbox/1.10.x/quickstart/'],
    ['/docs/outbox/1.10.x/quickstart/', '/outbox/1.10.x/quickstart/'],
    ['/docs/once/next/configuration/', '/once/next/reference/configuration/'],
  ]) {
    assert.deepEqual(redirect(source), {status: 308, location});
    assert.equal(redirect(location), undefined, `Redirect chain at ${location}`);
  }
});

test('latest explicit versions redirect temporarily and independently', () => {
  for (const product of metadata.products) {
    for (const prefix of ['', '/docs']) {
      assert.deepEqual(redirect(`${prefix}/${product.route}/${product.versions[0]}/quickstart/`), {
        status: 307,
        location: `/${product.route}/quickstart/`,
      });
    }
  }
  assert.deepEqual(redirect(`/docs/${metadata.outboxVersions[0]}/quickstart/`), {
    status: 307,
    location: '/outbox/quickstart/',
  });
});

test('shared pages redirect directly before broader namespace rules', () => {
  for (const prefix of ['/docs', '/docs/outbox', '/outbox', '/docs/once', '/once']) {
    assert.deepEqual(redirect(`${prefix}/sponsor/`), {status: 308, location: '/sponsor/'});
    assert.deepEqual(redirect(`${prefix}/legal-notice/`), {
      status: 308,
      location: '/legal-notice/',
    });
  }
  assert.deepEqual(redirect('/docs/support-and-update-policy/'), {
    status: 308,
    location: '/support-and-update-policy/',
  });
});

test('configuration is idempotent and rejects unsupported output formats', () => {
  assert.deepEqual(withLegacyRedirects(configured, redirects), configured);
  assert.throws(() => withLegacyRedirects({version: 2}, redirects));
});

test('committed HTTP redirects stay in sync with the product version catalog', () => {
  assert.deepEqual(redirects, metadata.getLegacyRedirects());
});

test('both product support URLs redirect directly to the shared policy', () => {
  for (const prefix of ['/outbox', '/once', '/docs/outbox', '/docs/once']) {
    assert.deepEqual(redirect(`${prefix}/support-and-update-policy/`), {
      status: 308,
      location: '/support-and-update-policy/',
    });
  }
  assert.equal(redirect('/support-and-update-policy/'), undefined);
});

test('Once legacy topic URLs preserve version and move directly into Reference', () => {
  for (const namespace of ['/once', '/docs/once']) {
    for (const prefix of ['', 'next/']) {
      for (const topic of [
        'concepts/transactions',
        'usage/integrations',
        'persistence/jdbc',
        'operations/retention',
        'configuration',
        'examples',
      ]) {
        const location = `/once/${prefix}reference/${topic}/`;
        assert.deepEqual(redirect(`${namespace}/${prefix}${topic}/`), {status: 308, location});
        assert.equal(redirect(location), undefined);
      }
    }
  }
  assert.deepEqual(redirect(`/once/${metadata.onceVersions[0]}/persistence/jdbc/`), {
    status: 307,
    location: '/once/reference/persistence/jdbc/',
  });
});
