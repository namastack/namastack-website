import {execFileSync} from 'node:child_process';
const [product, version] = process.argv.slice(2);
if (!['outbox', 'once'].includes(product) || !/^\d+\.\d+\.x$/.test(version ?? '')) {
  throw new Error(
    'Usage: npm run docs:version:outbox -- 2.0.x OR npm run docs:version:once -- 0.2.x',
  );
}
const command = product === 'outbox' ? 'docs:version' : 'docs:version:once';
execFileSync('npm', ['run', 'docusaurus', '--', command, version], {stdio: 'inherit'});
execFileSync(process.execPath, ['scripts/sync-redirects.mjs'], {stdio: 'inherit'});
