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

test('legacy docs redirect before static fallback pages; product page remains available', () => {
  assert.deepEqual(redirect('/outbox/quickstart/'), {
    status: 308,
    location: '/docs/outbox/quickstart/',
  });
  assert.deepEqual(redirect('/outbox/reference/database/'), {
    status: 308,
    location: '/docs/outbox/reference/database/',
  });
  assert.equal(redirect('/outbox/'), undefined);
  assert.deepEqual(redirect('/docs/quickstart/'), {
    status: 308,
    location: '/docs/outbox/quickstart/',
  });
  assert.equal(redirect('/docs/outbox/quickstart/'), undefined);
  assert.equal(redirect('/docs/once/quickstart/'), undefined);
  assert.equal(redirect('/docs/'), undefined);
  assert.equal(redirect('/once/'), undefined);
  assert.equal(configured.routes.at(-1).handle, 'filesystem');
  assert.deepEqual(configured.overrides, output.overrides);
});

test('archived and latest legacy URLs retain separate targets and redirect permanence', () => {
  assert.deepEqual(redirect(`/outbox/${metadata.outboxVersions[1]}/quickstart/`), {
    status: 308,
    location: `/docs/outbox/${metadata.outboxVersions[1]}/quickstart/`,
  });
  assert.deepEqual(redirect(`/outbox/${metadata.outboxVersions[0]}/quickstart/`), {
    status: 307,
    location: '/docs/outbox/quickstart/',
  });
});

test('configuration is idempotent and rejects unsupported output formats', () => {
  assert.deepEqual(withLegacyRedirects(configured, redirects), configured);
  assert.throws(() => withLegacyRedirects({version: 2}, redirects));
});

test('historical namespaces redirect directly to the correct product and shared pages', () => {
  assert.deepEqual(redirect('/docs/next/reference/'), {
    status: 308,
    location: '/docs/outbox/next/reference/',
  });
  assert.deepEqual(redirect('/docs/1.10.x/quickstart/'), {
    status: 308,
    location: '/docs/outbox/1.10.x/quickstart/',
  });
  assert.deepEqual(redirect('/outbox/sponsor/'), {status: 308, location: '/sponsor/'});
  assert.deepEqual(redirect('/docs/legal-notice/'), {status: 308, location: '/legal-notice/'});
});

test('committed HTTP redirects stay in sync with the product version catalog', async () => {
  const {default: metadata} = await import('../site-products.cjs');
  assert.deepEqual(redirects, metadata.getLegacyRedirects());
});
