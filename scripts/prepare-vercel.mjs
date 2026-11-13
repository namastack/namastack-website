import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {getTransformedRoutes} from '@vercel/routing-utils';

export function withLegacyRedirects(output, redirects) {
  assert.equal(output.version, 3, 'Expected Vercel Build Output API version 3');
  const {routes, error} = getTransformedRoutes({redirects});
  if (error) throw new Error(error.message);
  // Redirect before filesystem handling: the static host fallback pages must
  // not take precedence over the HTTP redirects configured in vercel.json.
  const signatures = new Set(routes.map((route) => JSON.stringify(route)));
  return {
    ...output,
    routes: [
      ...routes,
      ...(output.routes ?? []).filter((route) => !signatures.has(JSON.stringify(route))),
    ],
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = '.vercel/output/config.json';
  const output = JSON.parse(readFileSync(path, 'utf8'));
  const {redirects} = JSON.parse(readFileSync('vercel.json', 'utf8'));
  writeFileSync(path, JSON.stringify(withLegacyRedirects(output, redirects), null, 2) + '\n');
  console.log(`Prepared ${redirects.length} legacy HTTP redirects for the prebuilt deployment`);
}
