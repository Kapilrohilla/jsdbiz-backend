

require('dotenv').config();

// config.js
module.exports = {
	app: {
		port: process.env.DEV_APP_PORT || 3000,
		appName: process.env.APP_NAME || 'ivisa',
		env: process.env.NODE_ENV || 'development',
	},
	db: {
	    port: process.env.DB_PORT || 3306,
		database: process.env.DB_NAME || 'ivisa',
		password: process.env.DB_PASS || '123456789',
		username: process.env.DB_USER || 'root',
		host: process.env.DB_HOST || '127.0.0.1',
		dialect: 'mysql',
		logging: false,
	},
	winiston: {
			logpath: '/ivisaLogs/logs/',
	},
	auth: { 
		jwt_secret: process.env.JWT_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
		jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d',
		saltRounds: process.env.SALT_ROUND || 10,
		refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
		refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || '2d', // 2 days
	},

};
