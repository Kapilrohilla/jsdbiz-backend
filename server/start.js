const app = require('../app');
const db = app.get('db');
const config = app.get('config');
const logger = require('../utils/logger');
const { sendCrashNotification, sendShutdownNotification } = require('../utils/email');

const port = app.get('port');

let server;

(async () => {
	try {
		await db.sequelize.authenticate();
		// Safe sync in non-production. Avoid ALTER to prevent excessive index creation.
		if (config.app.env !== 'production') {
			if (process.env.DB_SYNC_ALTER === 'true') {
				// Opt-in only when explicitly requested
				await db.sequelize.sync({ alter: true });
			} else {
				await db.sequelize.sync();
			}
		}
		server = app.listen(port, () => {
			logger.info(`Server listening on port ${port}`);
		});
	} catch (err) {
		logger.error('Failed to start server', err);
		process.exit(1);
	}
})();

// Process-level error handlers to log unhandled errors to terminal
async function shutdown(reason, code = 0) {
    logger.info(`Initiating graceful shutdown due to: ${reason}`);
    const forceExit = setTimeout(() => {
        logger.error('Forced exit due to shutdown timeout');
        process.exit(code || 1);
    }, 10000);

    try {
        await sendShutdownNotification(reason);
    } catch (e) {
        logger.warn('Failed to send shutdown notification', e);
    }

    if (server && server.close) {
        await new Promise((resolve) => server.close(resolve));
    }
    clearTimeout(forceExit);
    process.exit(code);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', async (reason) => {
    logger.error('Unhandled Promise Rejection', reason instanceof Error ? reason : { reason });
    if (reason instanceof Error) {
        try { await sendCrashNotification(reason); } catch (_) {}
    }
});

process.on('uncaughtException', async (err) => {
    logger.error('Uncaught Exception', err);
    try { await sendCrashNotification(err); } catch (_) {}
    shutdown('uncaughtException', 1);
});



