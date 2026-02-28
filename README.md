# 🤖 AI-Powered Language File Translator

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-required-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)

**Professional-grade AI translation tool for PHP, JSON, and text files**

Supports 49+ languages • Batch processing • Smart caching • Concurrent translation

[Features](#-key-features) • [Quick Start](#-quick-start) • [Examples](#-usage-examples) • [Configuration](#️-configuration)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
- [Configuration](#️-configuration)
- [Supported Languages](#-supported-languages)
- [API Models](#-supported-ai-models)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)

---

## 🎯 Overview

This is a **production-ready AI translation system** designed for developers who need to translate:

- **Laravel/PHP** language files (\`resources/lang/*/messages.php\`)
- **Chrome Extension** locale files (\`_locales/*/messages.json\`)
- **JSON** configuration files
- **Plain text** files (\`.txt\`, \`.md\`, \`.html\`, \`.xml\`, etc.)

**Why use this tool?**

✅ **Smart Translation**: Preserves formatting, placeholders, and special characters  
✅ **Incremental Updates**: Only translates new/changed strings  
✅ **Batch Processing**: Handles hundreds of files efficiently  
✅ **Quality Control**: Length ratio checks prevent poor translations  
✅ **Concurrent Processing**: Multiple files translated simultaneously  
✅ **Multiple API Keys**: Automatic rotation to avoid rate limits

---

## 🚀 Key Features

### 1. **Intelligent Translation**
- **Contextual awareness**: Understands UI text, error messages, and technical terms
- **Brand name preservation**: Never translates product names or brands
- **Placeholder protection**: Preserves \`$1\`, \`{user}\`, \`:name\` variables
- **Format retention**: Maintains original text structure and formatting

### 2. **Smart Caching System**
- **Incremental translation**: Skips already translated strings
- **Quality validation**: Re-translates strings with suspiciously short length
- **Version control friendly**: Creates clean diffs for git commits

### 3. **Production-Ready**
- **Error handling**: Automatic retries with exponential backoff
- **Rate limiting**: Multiple API key rotation
- **Cancellation support**: Stop translation mid-process
- **Real-time progress**: Live console output with color coding

---

## 📦 Prerequisites

> ⚠️ **Required**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed

- **Docker Desktop** (Windows/Mac/Linux)
- **OpenRouter API Key** - Get one at [openrouter.ai](https://openrouter.ai)
- **8GB RAM** minimum (16GB recommended for large projects)

---

## �� Quick Start

### Step 1: Clone or Download

\`\`\`bash
git clone https://github.com/wonchoe/ai-php-json-files-language-translator.git
cd ai-php-json-files-language-translator
\`\`\`

### Step 2: Build Docker Container

**Windows:** Double-click \`Build.bat\`

**Linux/Mac:**
\`\`\`bash
chmod +x Build.bat && ./Build.bat
\`\`\`

### Step 3: Start the Server

**Windows:** Double-click \`StartServer.bat\`

**Linux/Mac:**
\`\`\`bash
chmod +x StartServer.bat && ./StartServer.bat
\`\`\`

Server starts on \`http://localhost:3001\`

### Step 4: Add Files

Place source files in \`input/\` folder:

\`\`\`
input/
├── messages.php
└── en/
    └── errors.php
\`\`\`

### Step 5: Translate

1. Open \`http://localhost:3001\`
2. Select file type: **PHP Arrays**, **JSON**, or **Plain Text**
3. Enter target languages: \`uk\` or \`uk,fr,de,es\`
4. Paste OpenRouter API key
5. Click **START TRANSLATION** 🚀

### Step 6: Get Results

\`\`\`
output/
├── uk/
│   └── messages.php
├── fr/
│   └── messages.php
└── de/
    └── messages.php
\`\`\`

---

## 📚 Usage Examples

### Example 1: Laravel Files

**Input** (\`input/en/messages.php\`):
\`\`\`php
<?php
return [
    'welcome' => 'Welcome to our app',
    'hello' => 'Hello, :name!',
];
\`\`\`

**Config:** Languages: \`uk,de\` | Model: \`gemini-2.0-flash-exp:free\`

**Output** (\`output/uk/messages.php\`):
\`\`\`php
<?php
return [
    'welcome' => 'Ласкаво просимо до нашого додатку',
    'hello' => 'Привіт, :name!',
];
\`\`\`

---

### Example 2: Chrome Extension

**Input** (\`input/_locales/en/messages.json\`):
\`\`\`json
{
  "app_name": {
    "message": "My Extension"
  },
  "button_save": {
    "message": "Save"
  }
}
\`\`\`

**Config:** Type: JSON | Languages: \`uk,es,ja\`

**Output** (\`output/uk/_locales/uk/messages.json\`):
\`\`\`json
{
  "app_name": {
    "message": "Моє розширення"
  },
  "button_save": {
    "message": "Зберегти"
  }
}
\`\`\`

---

### Example 3: Multiple Files

**Input:**
\`\`\`
input/en/
├── auth.php (50 strings)
├── validation.php (100 strings)
└── passwords.php (20 strings)
\`\`\`

**Config:** Languages: \`uk,ru,pl\` | Concurrency: 5

**Result:** 3 languages × 3 files = **9 files translated in ~2 minutes**

---

## ⚙️ Configuration

### Interface Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Max Concurrency** | 5 | Files processed at once |
| **Batch Char Limit** | 12000 | Characters per API call |
| **Retry Delay** | 2000ms | Wait between retries |
| **Max Errors** | 10 | Stop after N errors |

### Multiple API Keys

Add keys separated by commas for rotation:
\`\`\`
sk-or-v1-xxxxx,sk-or-v1-yyyyy,sk-or-v1-zzzzz
\`\`\`

---

## 🌍 Supported Languages (49)

\`\`\`
ar am bg bn ca cs da de el en es et fa fi fil
fr gu he hi hr hu id it ja kn ko lt lv ml mr
ms nl no pl pt ro ru sk sl sr sv sw ta te th
tr uk vi zh_CN zh_TW pt_BR pt_PT es_419
\`\`\`

**Usage examples:**
- Single: \`uk\`
- Multiple: \`uk,de,fr\`
- Regional: \`en_US,en_GB,pt_BR,pt_PT\`

---

## �� Supported AI Models

### Recommended (FREE)

| Model | Speed | Quality |
|-------|-------|---------|
| \`google/gemini-2.0-flash-exp:free\` | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| \`google/gemini-2.0-flash-thinking-exp-1219:free\` | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| \`meta-llama/llama-3.1-8b-instruct:free\` | ⚡⚡⚡ | ⭐⭐⭐ |

### Premium

- \`anthropic/claude-3.5-sonnet\` - Highest quality
- \`openai/gpt-4o\` - Maximum accuracy
- \`openai/gpt-3.5-turbo\` - Fast & cheap

**Browse all**: [openrouter.ai/models](https://openrouter.ai/models)

---

## 🔧 Troubleshooting

### ❌ Translation stops early

**Fix:**
1. Check API balance: [openrouter.ai/credits](https://openrouter.ai/credits)
2. Add multiple API keys
3. Reduce concurrency to 2-3

### ❌ Translations too short

**Fix:**
1. Switch to better model (\`claude-3.5-sonnet\`)
2. Reduce batch size to 5000
3. Tool auto-retranslates strings <40% length

### ❌ Docker won't start

**Fix:**
1. Ensure Docker Desktop is running
2. Check port 3001: \`netstat -an | findstr 3001\`
3. Rebuild: \`docker-compose down && docker-compose up --build\`

### ❌ Rate limit errors

**Fix:**
1. Use multiple API keys
2. Reduce concurrency to 1-2
3. Use free models

---

## 🚀 Advanced Usage

### Custom Prompts

Edit \`app/translate.cjs\` line 168:

\`\`\`javascript
const prompt = \`Translate to \${languageName}.
Preserve placeholders like $1, :name.
Do NOT translate brand names.
Text: "\${cleanText}"\`;
\`\`\`

### CI/CD Integration

\`\`\`yaml
# .github/workflows/translate.yml
name: Auto-translate
on:
  push:
    paths: ['lang/en/**']
jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: docker-compose up -d
\`\`\`

---

## 📊 Performance

| Files | Strings | Languages | Time |
|-------|---------|-----------|------|
| 5 | 50 | 3 | ~30s |
| 20 | 500 | 5 | ~3min |
| 50 | 2000 | 10 | ~15min |

*Using gemini-2.0-flash-exp, concurrency: 5*

---

## 👥 Use Cases

✅ **Laravel Developers** - \`resources/lang/\` files  
✅ **Chrome Extensions** - \`_locales/\` internationalization  
✅ **Mobile Apps** - JSON string files  
✅ **Documentation** - Multi-language README  
✅ **SEO** - Localized content  

---

## 📄 License

MIT License - Free for commercial use

---

## 🙌 Credits

Built by [Wonchoe](https://github.com/wonchoe)

Powered by:
- [OpenRouter AI](https://openrouter.ai) - Multi-model API
- [Docker](https://www.docker.com) - Containerization
- [Node.js](https://nodejs.org) + [Express.js](https://expressjs.com)

---

## 🔗 Links

- **Repository**: [GitHub](https://github.com/wonchoe/ai-php-json-files-language-translator)
- **OpenRouter**: [Dashboard](https://openrouter.ai/activity)
- **Issues**: [Report Bug](https://github.com/wonchoe/ai-php-json-files-language-translator/issues)

---

<div align="center">

**⭐ Star if useful!**

Made with 🤖 • Used in production 🌍 • Loved by developers 💙

</div>
