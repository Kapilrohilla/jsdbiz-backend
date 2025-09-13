const app = require('../app');
const db = app.get('db');
const config = app.get('config');

const port = app.get('port');

(async () => {
	try {
		await db.sequelize.authenticate();
		// Auto-create tables from models in non-production
		if (config.app.env !== 'production') {
			await db.sequelize.sync();
		}
		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
		});
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
})();


