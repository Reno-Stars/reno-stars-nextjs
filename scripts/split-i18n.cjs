#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'zh', 'ja', 'ko', 'es'];
const ROOT = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT, 'messages');

for (const locale of LOCALES) {
  const monolith = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(monolith)) {
    console.error(`missing: ${monolith}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(monolith, 'utf8'));
  const localeDir = path.join(MESSAGES_DIR, locale);
  fs.mkdirSync(localeDir, { recursive: true });

  const namespaces = Object.keys(data).sort();
  for (const ns of namespaces) {
    const out = path.join(localeDir, `${ns}.json`);
    fs.writeFileSync(out, JSON.stringify({ [ns]: data[ns] }, null, 2) + '\n');
  }
  console.log(`${locale}: wrote ${namespaces.length} namespace files`);
}
