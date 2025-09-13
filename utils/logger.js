const formatTimestamp = () => new Date().toISOString();

const print = (level, message, meta) => {
	const timestamp = formatTimestamp();
	const text = `[${level.toUpperCase()}] ${timestamp} - ${message}`;
	if (level === 'warn') {
		if (meta !== undefined) {
			console.warn(text, meta);
		} else {
			console.warn(text);
		}
		return;
	}
	if (meta !== undefined) {
		console.log(text, meta);
	} else {
		console.log(text);
	}
};

const logger = {
	info(message, meta) {
		print('info', message, meta);
	},
	warn(message, meta) {
		print('warn', message, meta);
	},
};

module.exports = logger;
