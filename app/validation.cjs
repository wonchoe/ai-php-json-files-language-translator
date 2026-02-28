/**
 * Quality validation for translations
 */

function validateTranslation(original, translated, language) {
  const warnings = [];
  const errors = [];
  
  // Check if translation is empty
  if (!translated || translated.trim() === '') {
    errors.push('Translation is empty');
    return { valid: false, warnings, errors, score: 0 };
  }
  
  // Check if translation is same as original (might indicate failure)
  if (original === translated && language !== 'en') {
    warnings.push('Translation identical to original');
  }
  
  // Check length ratio (should be between 50% and 200%)
  const ratio = translated.length / original.length;
  if (ratio < 0.5) {
    warnings.push(`Translation too short (${Math.round(ratio * 100)}% of original)`);
  } else if (ratio > 2.0) {
    warnings.push(`Translation too long (${Math.round(ratio * 100)}% of original)`);
  }
  
  // Check placeholder preservation
  const originalPlaceholders = extractPlaceholders(original);
  const translatedPlaceholders = extractPlaceholders(translated);
  
  for (const placeholder of originalPlaceholders) {
    if (!translatedPlaceholders.includes(placeholder)) {
      errors.push(`Missing placeholder: ${placeholder}`);
    }
  }
  
  for (const placeholder of translatedPlaceholders) {
    if (!originalPlaceholders.includes(placeholder)) {
      errors.push(`Extra placeholder: ${placeholder}`);
    }
  }
  
  // Check HTML tags preservation
  const originalTags = extractHtmlTags(original);
  const translatedTags = extractHtmlTags(translated);
  
  if (originalTags.length !== translatedTags.length) {
    warnings.push(`HTML tag count mismatch (original: ${originalTags.length}, translated: ${translatedTags.length})`);
  }
  
  // Calculate quality score (0-100)
  let score = 100;
  score -= errors.length * 30;
  score -= warnings.length * 10;
  score = Math.max(0, score);
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
    score,
    ratio: Math.round(ratio * 100) / 100
  };
}

function extractPlaceholders(text) {
  const patterns = [
    /:(\w+)/g,           // Laravel :placeholder
    /\{(\w+)\}/g,        // {placeholder}
    /%s|%d|%\w+/g,       // printf style %s, %d
    /\$\w+/g             // $variable
  ];
  
  const placeholders = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      placeholders.push(match[0]);
    }
  }
  
  return [...new Set(placeholders)];
}

function extractHtmlTags(text) {
  const tagPattern = /<\/?[\w\s="/.':;#-\/]+>/gi;
  return (text.match(tagPattern) || []);
}

function applyGlossary(text, glossary, language) {
  if (!glossary) return text;
  
  // Preserve terms that should not be translated
  if (glossary.preserve && Array.isArray(glossary.preserve)) {
    // These terms are preserved automatically by instructing the AI
  }
  
  // Force specific translations
  if (glossary.force && typeof glossary.force === 'object') {
    for (const [term, translations] of Object.entries(glossary.force)) {
      if (translations[language]) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        text = text.replace(regex, translations[language]);
      }
    }
  }
  
  return text;
}

module.exports = {
  validateTranslation,
  extractPlaceholders,
  extractHtmlTags,
  applyGlossary
};
