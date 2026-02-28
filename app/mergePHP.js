const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const localesDir = '_locales';
const translatedDir = 'translated';

function parsePhpFile(filePath) {
  const phpCommand = `php -r "echo json_encode(include '${filePath.replace(/'/g, "\\'")}');"`;
  try {
    const output = execSync(phpCommand, { encoding: 'utf-8' });
    return JSON.parse(output);
  } catch (err) {
    console.error(`❌ Failed to parse ${filePath}:`, err.message);
    return {};
  }
}

function stringifyToPhp(obj) {
  let php = `<?php\n\nreturn [\n`;
  for (const [key, value] of Object.entries(obj)) {
    php += `    '${key}' => '${value.replace(/'/g, "\\'")}',\n`;
  }
  php += `];\n`;
  return php;
}

function mergePhpTranslations(localePath, translatedPath) {
  if (!fs.existsSync(translatedPath)) return;

  const original = parsePhpFile(localePath);
  const translated = parsePhpFile(translatedPath);

  const merged = { ...original };
  let hasChanges = false;

  for (const [key, value] of Object.entries(translated)) {
    if (!original.hasOwnProperty(key) || original[key] !== value) {
      merged[key] = value;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(localePath, stringifyToPhp(merged), 'utf-8');
    console.log(`✅ Merged: ${localePath}`);
  } else {
    console.log(`ℹ️  No changes: ${localePath}`);
  }
}

function processLocales() {
  const languages = fs.readdirSync(localesDir);

  for (const lang of languages) {
    const localeFile = path.join(localesDir, lang, 'collections.php');
    const translatedFile = path.join(translatedDir, lang, 'collections.php');

    if (fs.existsSync(localeFile)) {
      mergePhpTranslations(localeFile, translatedFile);
    } else {
      console.warn(`⚠️ Skipped (no original): ${localeFile}`);
    }
  }
}

processLocales();
