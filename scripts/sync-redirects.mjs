import {readFileSync, writeFileSync} from 'node:fs';
import metadata from '../site-products.cjs';
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
config.redirects = metadata.getLegacyRedirects();
writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
