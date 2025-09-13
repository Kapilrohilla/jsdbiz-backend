const express = require('express');
const cors = require('cors');
const config = require('./config/appconfig.js');

const app = express();
app.set('config', config);
app.use(express.json());
app.use(cors());

process.on('SIGINT', () => {
	console.log('stopping the server');
	process.exit();
});

app.set('db', require('./models/index.js'));

app.set('port', process.env.DEV_APP_PORT || config.app.port || 3000);

app.use(require('./router/index.js'));

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	res.status(err.status).json({ type: 'error', message: 'the url you are trying to reach is not hosted on our server' });
	next(err);
});

module.exports = app;


