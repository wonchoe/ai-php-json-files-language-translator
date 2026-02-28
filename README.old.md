# 🤖 AI PHP / JSON / File Language Translator

> ⚠️ **Before you start:** You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed if you're on Windows or another operating system. This project won’t work without Docker.

---

## 💡 What is this?

This is an **AI-powered file translator** built for:

- PHP language array files (e.g., Laravel translations)
- JSON files (chome extension language files etc)
- All other formats (PHP, TXT, HTML, XML, etc.)

It uses modern AI models via [OpenRouter API](https://openrouter.ai) to automatically translate files in bulk, with full control over concurrency, batching, retries, and model selection.

---

## 📂 How it works

### 1. Clone the repository

```bash
git clone https://github.com/wonchoe/ai-php-json-files-language-translator.git
cd your-repo
```

### 2. Build the Docker container (only once)

```bash
Build.BAT
```

(Or double-click `Build.BAT` if you're on Windows.)

### 3. Start the server

```bash
StartServer.BAT
```

(Or just double-click `StartServer.BAT`.)

### 4. Use the web interface

1. Place your files in the `input/` folder  
2. Open the interface at `http://localhost:3000`  
3. Select the **file type**:
   - `PHP Arrays`
   - `JSON`
   - `Plain Text / Other`
4. Choose one or more **target languages** (`uk`, `fr`, `de`, or comma-separated: `uk,fr,de`)
5. Enter your **OpenRouter API key**
6. Click the 🟦 **START TRANSLATION** button

📝 Translated files will appear in the `output/` folder.

---

## 📁 Folder structure

```
/input     ← source files to translate
/output    ← translated output files
/app       ← Node.js translation logic
```

---

## ⚙️ Interface

<img src="Screenshot.jpg" alt="UI Screenshot" width="600">

Inside the browser you can configure:
- File type
- Target languages
- AI model
- API keys
- Max concurrency, retry delay, error threshold, and batch size

After clicking `START TRANSLATION`, the system will translate all `input/` files and save them in `output/`.

---

## 🗂 Supported file types

| Type        | Examples                   |
|-------------|----------------------------|
| PHP Arrays  | `.php`                     |
| JSON        | `.json`                    |
| Plain/Other | `.txt`, `.html`, `.xml`, `.yml`, `.md`, etc. |

> ✅ Works great for translating **Chrome Extension language files** (`_locales/.../messages.json`) for SEO localization and international Chrome Web Store presence.

---

## 🔑 API

Supports all models available via [OpenRouter.ai](https://openrouter.ai), including:

- `google/gemini-2.0-flash-lite-001`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-haiku`

---

## 👥 Who is it for?

- Laravel / PHP developers
- App & web developers working with localization files
- SEO experts working on Chrome extensions & multilingual apps
- Anyone who wants to bulk-translate structured files using AI

---

## 🙌 Author

This project was built to automate the translation of large-scale language files with fine-grained control and blazing speed using OpenRouter-powered AI.
