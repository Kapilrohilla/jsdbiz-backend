const Sequelize = require('sequelize');
const config = require('../config/appconfig');

const sequelize = new Sequelize(
	config.db.database,
	config.db.username,
	config.db.password,
	{
		host: config.db.host,
		port: config.db.port,
		dialect: config.db.dialect,
		logging: config.db.logging,
		timezone: '+00:00',
	}
);

const db = {};

// Initialize models
const usersModel = require('./users');
db.Users = usersModel(sequelize, Sequelize);
const visaApplicationModel = require('./visa_application');
db.VisaApplications = visaApplicationModel(sequelize, Sequelize);
const travelInfoModel = require('./travel_info');
db.TravelInfos = travelInfoModel(sequelize, Sequelize);
const paymentsModel = require('./payments');
db.Payments = paymentsModel(sequelize, Sequelize);
const applicationDocumentsModel = require('./application_documents');
db.ApplicationDocuments = applicationDocumentsModel(sequelize, Sequelize);

// Associations
db.Users.hasMany(db.VisaApplications, { foreignKey: 'user_id', as: 'visa_applications' });
db.VisaApplications.belongsTo(db.Users, { foreignKey: 'user_id', as: 'user' });
db.VisaApplications.hasMany(db.TravelInfos, { foreignKey: 'visa_application_id', as: 'travel_infos' });
db.TravelInfos.belongsTo(db.VisaApplications, { foreignKey: 'visa_application_id', as: 'visa_application' });
db.VisaApplications.hasMany(db.Payments, { foreignKey: 'visa_application_id', as: 'payments' });
db.Payments.belongsTo(db.VisaApplications, { foreignKey: 'visa_application_id', as: 'visa_application' });
db.VisaApplications.hasMany(db.ApplicationDocuments, { foreignKey: 'visa_application_id', as: 'application_documents' });
db.ApplicationDocuments.belongsTo(db.VisaApplications, { foreignKey: 'visa_application_id', as: 'visa_application' });
db.Users.hasMany(db.ApplicationDocuments, { foreignKey: 'uploaded_by', as: 'uploaded_documents' });
db.ApplicationDocuments.belongsTo(db.Users, { foreignKey: 'uploaded_by', as: 'uploader' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

