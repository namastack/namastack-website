import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {withLegacyRedirects} from './prepare-vercel.mjs';

const {redirects} = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const output = {version: 3, routes: [{handle: 'filesystem'}], overrides: {'404.html': {path: '404'}}};
const configured = withLegacyRedirects(output, redirects);
function redirect(path) {
  const route = configured.routes.find(route => route.src && new RegExp(route.src).test(path));
  if (!route) return undefined;
  return {status: route.status, location: path.replace(new RegExp(route.src), route.headers.Location)};
}

test('legacy docs redirect before static fallback pages; product page remains available', () => {
  assert.deepEqual(redirect('/outbox/quickstart/'), {status: 308, location: '/docs/quickstart/'});
  assert.deepEqual(redirect('/outbox/reference/database/'), {status: 308, location: '/docs/reference/database/'});
  assert.equal(redirect('/outbox/'), undefined);
  assert.equal(redirect('/docs/quickstart/'), undefined);
  assert.equal(configured.routes.at(-1).handle, 'filesystem');
  assert.deepEqual(configured.overrides, output.overrides);
});

test('archived and latest legacy URLs retain separate targets and redirect permanence', () => {
  assert.deepEqual(redirect('/outbox/1.10.x/quickstart/'), {status: 308, location: '/docs/1.10.x/quickstart/'});
  assert.deepEqual(redirect('/outbox/1.11.x/quickstart/'), {status: 307, location: '/docs/quickstart/'});
});

test('configuration is idempotent and rejects unsupported output formats', () => {
  assert.deepEqual(withLegacyRedirects(configured, redirects), configured);
  assert.throws(() => withLegacyRedirects({version: 2}, redirects));
});
