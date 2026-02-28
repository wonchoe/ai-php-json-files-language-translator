const fs = require('fs');
const path = require('path');

const localesDir = '_locales';
const translatedDir = 'translated';

function mergeJsonFiles(localePath, translatedPath) {
  if (!fs.existsSync(translatedPath)) return;

  const original = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  const translated = JSON.parse(fs.readFileSync(translatedPath, 'utf-8'));

  const result = { ...original };

  for (const [key, value] of Object.entries(translated)) {
    result[key] = value;
  }

  fs.writeFileSync(localePath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`✅ Merged: ${localePath}`);
}

function processLocales() {
  const languages = fs.readdirSync(localesDir);

  for (const lang of languages) {
    const localeFile = path.join(localesDir, lang, 'messages.json');
    const translatedFile = path.join(translatedDir, lang, 'messages.json');

    if (fs.existsSync(localeFile)) {
      mergeJsonFiles(localeFile, translatedFile);
    } else {
      console.warn(`⚠️ Skipped (no original): ${localeFile}`);
    }
  }
}

processLocales();
