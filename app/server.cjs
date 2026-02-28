const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { runTranslation } = require('./translate.cjs');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3005;
const MAX_LOG_ENTRIES = 500; // Prevent memory overflow

let currentStatus = {
  running: false,
  log: [],
  done: false,
  totalFiles: 0,
  completedFiles: 0,
  currentFile: '',
  startTime: null,
  stats: {
    filesProcessed: 0,
    stringsTranslated: 0,
    errors: 0
  }
};
let cancelTranslation = false;
const activeSSEConnections = new Set();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS support
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser with size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.post('/translate', async (req, res) => {
  try {
    const lang = req.body.lang || 'uk';
    const fileType = req.body.fileType || 'php';
    const params = req.body.params || {};

    // Validate API keys
    if (!params.apiKeys && !params.KEYS) {
      return res.status(400).json({ 
        error: 'API keys are required',
        message: 'Please provide at least one OpenRouter API key'
      });
    }

    const apiKeys = params.apiKeys || params.KEYS;
    const keysArray = Array.isArray(apiKeys) ? apiKeys : apiKeys.split(',').map(k => k.trim());
    
    if (keysArray.length === 0 || !keysArray[0]) {
      return res.status(400).json({ 
        error: 'Valid API keys are required',
        message: 'API keys cannot be empty'
      });
    }

    // Validate file type
    if (!['php', 'json', 'files'].includes(fileType)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'File type must be one of: php, json, files'
      });
    }

    if (currentStatus.running) {
      return res.status(409).json({ 
        error: 'Translation in progress',
        message: 'Translation already in progress' 
      });
    }

    // Normalize params for backward compatibility
    const normalizedParams = {
      ...params,
      KEYS: keysArray,
      apiKeys: keysArray,
      MAX_CONCURRENCY: params.maxConcurrency || params.MAX_CONCURRENCY || 5,
      MAX_BATCH_CHAR_LIMIT: params.batchLimit || params.MAX_BATCH_CHAR_LIMIT || 12000,
      RETRY_DELAY: params.retryDelay || params.RETRY_DELAY || 2000,
      MAX_ERRORS: params.maxErrors || params.MAX_ERRORS || 10,
      activeModel: params.activeModel || 'google/gemini-2.0-flash-lite-001'
    };

    currentStatus = { 
      running: true, 
      log: [], 
      done: false,
      totalFiles: 0,
      completedFiles: 0,
      currentFile: '',
      startTime: Date.now(),
      stats: {
        filesProcessed: 0,
        stringsTranslated: 0,
        errors: 0
      }
    };
    cancelTranslation = false;

    res.json({ status: 'started' });

    runTranslation(lang, fileType, normalizedParams, (logLine, progressData) => {
      if (cancelTranslation) return;
      
      console.log(logLine);
      currentStatus.log.push(logLine);
      
      // Limit log size to prevent memory issues
      if (currentStatus.log.length > MAX_LOG_ENTRIES) {
        currentStatus.log = currentStatus.log.slice(-MAX_LOG_ENTRIES);
      }
      
      // Update progress
      if (progressData) {
        if (progressData.totalFiles) currentStatus.totalFiles = progressData.totalFiles;
        if (progressData.completedFiles !== undefined) currentStatus.completedFiles = progressData.completedFiles;
        if (progressData.currentFile) currentStatus.currentFile = progressData.currentFile;
        if (progressData.stringsTranslated) currentStatus.stats.stringsTranslated += progressData.stringsTranslated;
        if (progressData.error) currentStatus.stats.errors += 1;
        if (progressData.fileCompleted) currentStatus.stats.filesProcessed += 1;
      }
    }, () => cancelTranslation).then(() => {
      if (!cancelTranslation) {
        const duration = Math.round((Date.now() - currentStatus.startTime) / 1000);
        currentStatus.running = false;
        currentStatus.done = true;
        currentStatus.log.push(`✅ Translation complete! Duration: ${duration}s`);
        
        // Save to history
        saveHistory({
          languages: lang,
          filesCount: currentStatus.stats.filesProcessed,
          stringsTranslated: currentStatus.stats.stringsTranslated,
          duration: duration,
          model: normalizedParams.activeModel,
          success: true
        });
      }
    }).catch((err) => {
      console.error('Translation error:', err);
      const duration = currentStatus.startTime ? Math.round((Date.now() - currentStatus.startTime) / 1000) : 0;
      currentStatus.running = false;
      currentStatus.done = true;
      currentStatus.log.push(`❌ Translation failed: ${err.message}`);
      
      // Save failed attempt to history
      saveHistory({
        languages: lang,
        filesCount: currentStatus.stats.filesProcessed,
        stringsTranslated: currentStatus.stats.stringsTranslated,
        duration: duration,
        model: normalizedParams.activeModel,
        success: false,
        error: err.message
      });
    });
  } catch (error) {
    console.error('Error in /translate endpoint:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

app.post('/stop', (req, res) => {
  if (currentStatus.running) {
    cancelTranslation = true;
    currentStatus.running = false;
    currentStatus.done = true;
    currentStatus.log.push('🛑 Translation stopped by user');
    res.json({ message: 'Translation stopped' });
  } else {
    res.json({ message: 'No active translation to stop' });
  }
});

app.get('/status', (req, res) => {
  res.json(currentStatus);
});

// Progress endpoint
app.get('/progress', (req, res) => {
  const percent = currentStatus.totalFiles > 0 
    ? Math.round((currentStatus.completedFiles / currentStatus.totalFiles) * 100) 
    : 0;
  
  res.json({
    running: currentStatus.running,
    totalFiles: currentStatus.totalFiles,
    completedFiles: currentStatus.completedFiles,
    currentFile: currentStatus.currentFile,
    percent: percent,
    stats: currentStatus.stats
  });
});

// Streaming logs endpoint (SSE) with timeout
app.get('/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Add connection to active set
  activeSSEConnections.add(res);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({log: '📡 Connected to log stream', stats: currentStatus.stats})}\n\n`);
  
  const interval = setInterval(() => {
    if (currentStatus.log.length > 0) {
      const newLog = currentStatus.log[currentStatus.log.length - 1];
      try {
        res.write(`data: ${JSON.stringify({log: newLog, stats: currentStatus.stats})}\n\n`);
      } catch (err) {
        console.error('Error writing to SSE stream:', err);
        clearInterval(interval);
        activeSSEConnections.delete(res);
      }
    }
    
    if (currentStatus.done) {
      clearInterval(interval);
      activeSSEConnections.delete(res);
      res.end();
    }
  }, 500);
  
  // Set timeout for SSE connection (30 minutes)
  const timeout = setTimeout(() => {
    clearInterval(interval);
    activeSSEConnections.delete(res);
    res.end();
  }, 30 * 60 * 1000);
  
  req.on('close', () => {
    clearInterval(interval);
    clearTimeout(timeout);
    activeSSEConnections.delete(res);
  });
});

// History endpoint with error handling
app.get('/history', (req, res) => {
  try {
    const historyPath = path.join(__dirname, 'history.json');
    if (fs.existsSync(historyPath)) {
      const fileContent = fs.readFileSync(historyPath, 'utf-8');
      try {
        const history = JSON.parse(fileContent);
        res.json(Array.isArray(history) ? history : []);
      } catch (parseError) {
        console.error('Error parsing history.json:', parseError);
        // Backup corrupted file
        fs.writeFileSync(historyPath + '.corrupted', fileContent);
        res.json([]);
      }
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ 
      error: 'Failed to load history',
      message: error.message 
    });
  }
});

// Save history helper with error handling
function saveHistory(entry) {
  const historyPath = path.join(__dirname, 'history.json');
  let history = [];
  
  if (fs.existsSync(historyPath)) {
    try {
      const fileContent = fs.readFileSync(historyPath, 'utf-8');
      history = JSON.parse(fileContent);
      if (!Array.isArray(history)) {
        console.error('Invalid history format, resetting to empty array');
        history = [];
      }
    } catch (err) {
      console.error('Error loading history:', err);
      // Backup corrupted file
      try {
        const corrupted = fs.readFileSync(historyPath, 'utf-8');
        fs.writeFileSync(historyPath + '.backup', corrupted);
      } catch (backupErr) {
        console.error('Failed to backup corrupted history:', backupErr);
      }
      history = [];
    }
  }
  
  try {
    history.unshift({
      timestamp: new Date().toISOString(),
      languages: entry.languages,
      filesCount: entry.filesCount,
      stringsTranslated: entry.stringsTranslated,
      duration: entry.duration,
      model: entry.model,
      success: entry.success,
      error: entry.error || null
    });
    
    // Keep last 50 entries
    history = history.slice(0, 50);
    
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving history:', err);
  }
}

// Export configuration
app.get('/export-config', (req, res) => {
  const config = {
    maxConcurrency: parseInt(req.query.maxConcurrency) || 5,
    batchLimit: parseInt(req.query.batchLimit) || 12000,
    retryDelay: parseInt(req.query.retryDelay) || 2000,
    maxErrors: parseInt(req.query.maxErrors) || 10,
    model: req.query.model || 'google/gemini-2.0-flash-lite-001'
  };
  
  res.setHeader('Content-Disposition', 'attachment; filename=translator-config.json');
  res.json(config);
});

// Import configuration
app.post('/import-config', (req, res) => {
  const config = req.body;
  res.json({success: true, config});
});

// Cost estimation endpoint with validation
app.post('/estimate-cost', (req, res) => {
  try {
    const { filesCount, totalStrings, model } = req.body;
    
    // Pricing per 1K tokens (input) - Updated February 2026
    const pricing = {
      // Selected models
      'google/gemini-2.0-flash-lite-001': 0.00005,
      'google/gemini-2.5-flash-lite': 0.00004,
      'openai/gpt-5-nano': 0.0001
    };
    
    const avgTokensPerString = 50;
    const estimatedTokens = (totalStrings || 100) * avgTokensPerString;
    const pricePerToken = pricing[model] || 0;
    const estimatedCost = (estimatedTokens * pricePerToken).toFixed(4);
    
    res.json({
      filesCount: filesCount || 0,
      totalStrings: totalStrings || 0,
      estimatedTokens: estimatedTokens,
      estimatedCost: estimatedCost,
      currency: 'USD',
      isFree: pricePerToken === 0,
      model: model
    });
  } catch (error) {
    console.error('Error estimating cost:', error);
    res.status(500).json({ 
      error: 'Failed to estimate cost',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    translationRunning: currentStatus.running
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/status`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('\n🛑 Received shutdown signal, shutting down gracefully...');
  
  // Stop accepting new connections
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close all active SSE connections
    activeSSEConnections.forEach(res => {
      try {
        res.end();
      } catch (err) {
        console.error('Error closing SSE connection:', err);
      }
    });
    activeSSEConnections.clear();
    
    // If translation is running, stop it
    if (currentStatus.running) {
      console.log('⏹️  Stopping active translation...');
      cancelTranslation = true;
      currentStatus.running = false;
      currentStatus.done = true;
    }
    
    console.log('👋 Process terminated');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}
