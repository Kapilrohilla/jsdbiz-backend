const express = require('express');
const cors = require('cors');
const config = require('./config/appconfig.js');
const path = require('path');
const { FileStorageService } = require('./utils/file_storage_service');
const logger = require('./utils/logger');

const app = express();
app.set('config', config);
app.use(express.json());
app.use(cors());

// Initialize upload directories and serve uploads statically
FileStorageService.initializeUploadDirectory();
app.use('/uploads', require('express').static(path.join(process.cwd(), 'uploads')));

// Removed force-exit on SIGINT; graceful shutdown handled in server/start.js

app.set('db', require('./models/index.js'));

app.set('port', process.env.DEV_APP_PORT || config.app.port || 3000);

// Request logging: logs method, URL, status and duration for every API hit
app.use((req, res, next) => {
	const start = process.hrtime();
	res.on('finish', () => {
		const diff = process.hrtime(start);
		const durationMs = Math.round((diff[0] * 1e3) + (diff[1] / 1e6));
		const meta = {
			method: req.method,
			url: req.originalUrl || req.url,
			status: res.statusCode,
			durationMs
		};
		logger.info('HTTP request completed', meta);
	});
	return next();
});

app.use(require('./router/index.js'));

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// 404 handler (forward to error handler)
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Global error handler
// Ensures all errors are logged to terminal and a consistent JSON response is returned
app.use((err, req, res, next) => {
	const status = err.status || 500;
	const isProd = (process.env.NODE_ENV || (app.get('config') && app.get('config').app && app.get('config').app.env)) === 'production';
	const requestMeta = {
		method: req.method,
		url: req.originalUrl || req.url,
		status,
		ip: req.ip,
		headers: { 'user-agent': req.get && req.get('user-agent') },
		body: req.body,
		params: req.params,
		query: req.query,
	};

	// Log the error with stack
	logger.error(err.message || 'Unhandled error', err);
	logger.warn('Request context for error', requestMeta);

	if (res.headersSent) {
		return next(err);
	}

	const response = { type: 'error', message: err.message || 'Internal Server Error' };
	if (!isProd && err.stack) {
		response.stack = err.stack;
	}
	return res.status(status).json(response);
});

module.exports = app;



