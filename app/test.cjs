/**
 * Automated tests for translation quality
 */

const { validateTranslation, extractPlaceholders, extractHtmlTags } = require('./validation.cjs');
const chalk = require('chalk');

function runTests() {
  console.log(chalk.bold.blue('\n🧪 Running Translation Validation Tests...\n'));
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Placeholder preservation
  console.log(chalk.bold('Test 1: Placeholder Preservation'));
  const test1 = validateTranslation(
    'Hello :name, you have :count messages',
    'Привіт :name, у вас є :count повідомлень',
    'uk'
  );
  if (test1.valid && test1.errors.length === 0) {
    console.log(chalk.green('✅ PASSED: Placeholders preserved correctly'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: Placeholder preservation test'));
    console.log('Errors:', test1.errors);
    failed++;
  }
  
  // Test 2: Missing placeholder detection
  console.log(chalk.bold('\nTest 2: Missing Placeholder Detection'));
  const test2 = validateTranslation(
    'Hello :name, you have :count messages',
    'Привіт, у вас є повідомлень',
    'uk'
  );
  if (!test2.valid && test2.errors.length > 0) {
    console.log(chalk.green('✅ PASSED: Missing placeholders detected'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: Should detect missing placeholders'));
    failed++;
  }
  
  // Test 3: HTML tag preservation
  console.log(chalk.bold('\nTest 3: HTML Tag Preservation'));
  const test3Original = 'Click <a href="#">here</a> to continue';
  const test3Translated = 'Натисніть <a href="#">тут</a> щоб продовжити';
  const test3 = validateTranslation(test3Original, test3Translated, 'uk');
  if (test3.warnings.length === 0 || !test3.warnings.some(w => w.includes('HTML tag'))) {
    console.log(chalk.green('✅ PASSED: HTML tags preserved correctly'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: HTML tag preservation test'));
    console.log('Warnings:', test3.warnings);
    failed++;
  }
  
  // Test 4: Empty translation detection
  console.log(chalk.bold('\nTest 4: Empty Translation Detection'));
  const test4 = validateTranslation('Hello world', '', 'uk');
  if (!test4.valid && test4.errors.some(e => e.includes('empty'))) {
    console.log(chalk.green('✅ PASSED: Empty translation detected'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: Should detect empty translation'));
    failed++;
  }
  
  // Test 5: Length ratio warning
  console.log(chalk.bold('\nTest 5: Length Ratio Warning'));
  const test5 = validateTranslation('Hi', 'This is a very long translation that is way too long', 'uk');
  if (test5.warnings.some(w => w.includes('too long'))) {
    console.log(chalk.green('✅ PASSED: Length ratio warning triggered'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: Should warn about length ratio'));
    failed++;
  }
  
  // Test 6: Quality score calculation
  console.log(chalk.bold('\nTest 6: Quality Score Calculation'));
  const test6 = validateTranslation(
    'Welcome to our app',
    'Ласкаво просимо до нашого додатку',
    'uk'
  );
  if (test6.score >= 80 && test6.valid) {
    console.log(chalk.green(`✅ PASSED: Quality score is ${test6.score}/100`));
    passed++;
  } else {
    console.log(chalk.red(`❌ FAILED: Quality score too low (${test6.score}/100)`));
    failed++;
  }
  
  // Test 7: Extract placeholders
  console.log(chalk.bold('\nTest 7: Extract Placeholders'));
  const placeholders = extractPlaceholders('Hello :name, you have {count} items and $price total');
  if (placeholders.includes(':name') && placeholders.includes('{count}') && placeholders.includes('$price')) {
    console.log(chalk.green('✅ PASSED: Extracted all placeholder types'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: Placeholder extraction incomplete'));
    console.log('Found:', placeholders);
    failed++;
  }
  
  // Test 8: Extract HTML tags
  console.log(chalk.bold('\nTest 8: Extract HTML Tags'));
  const tags = extractHtmlTags('<div class="test">Hello <b>world</b></div>');
  if (tags.length === 4) { // <div>, <b>, </b>, </div>
    console.log(chalk.green('✅ PASSED: Extracted all HTML tags'));
    passed++;
  } else {
    console.log(chalk.red('❌ FAILED: HTML tag extraction incorrect'));
    console.log('Found:', tags);
    failed++;
  }
  
  // Summary
  console.log(chalk.bold.blue('\n' + '='.repeat(50)));
  console.log(chalk.bold.blue('Test Summary:'));
  console.log(chalk.green(`✅ Passed: ${passed}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.bold.blue(`Total: ${passed + failed}`));
  console.log(chalk.bold.blue('='.repeat(50) + '\n'));
  
  if (failed === 0) {
    console.log(chalk.bold.green('🎉 All tests passed! Translation validation is working correctly.\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('⚠️ Some tests failed. Please review the validation logic.\n'));
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
