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
const countriesModel = require('./countries');
db.Countries = countriesModel(sequelize, Sequelize);
const countryVisaEligibilitiesModel = require('./country_visa_eligibilities');
db.CountryVisaEligibilities = countryVisaEligibilitiesModel(sequelize, Sequelize);

// Associations
db.Users.hasMany(db.VisaApplications, { foreignKey: 'user_id', as: 'visa_applications' });
db.VisaApplications.belongsTo(db.Users, { foreignKey: 'user_id', as: 'user' });
db.VisaApplications.belongsTo(db.Countries, { foreignKey: 'from_country_id', as: 'from_country' });
db.VisaApplications.belongsTo(db.Countries, { foreignKey: 'to_country_id', as: 'to_country' });
db.VisaApplications.belongsTo(db.Countries, { foreignKey: 'destination_country_id', as: 'destination_country' });
db.VisaApplications.belongsTo(db.Countries, { foreignKey: 'own_country_id', as: 'own_country' });
db.Countries.hasMany(db.VisaApplications, { foreignKey: 'from_country_id', as: 'from_applications' });
db.Countries.hasMany(db.VisaApplications, { foreignKey: 'to_country_id', as: 'to_applications' });
db.Countries.hasMany(db.VisaApplications, { foreignKey: 'destination_country_id', as: 'destination_applications' });
db.Countries.hasMany(db.VisaApplications, { foreignKey: 'own_country_id', as: 'own_applications' });
db.VisaApplications.hasMany(db.TravelInfos, { foreignKey: 'visa_application_id', as: 'travel_infos' });
db.TravelInfos.belongsTo(db.VisaApplications, { foreignKey: 'visa_application_id', as: 'visa_application' });
// TravelInfos country associations
db.TravelInfos.belongsTo(db.Countries, { foreignKey: 'nationality_country_id', as: 'nationality_country' });
db.TravelInfos.belongsTo(db.Countries, { foreignKey: 'country_of_birth_id', as: 'country_of_birth' });
db.TravelInfos.belongsTo(db.Countries, { foreignKey: 'country_of_residence_id', as: 'country_of_residence' });
db.Countries.hasMany(db.TravelInfos, { foreignKey: 'nationality_country_id', as: 'nationality_country_travel_infos' });
db.Countries.hasMany(db.TravelInfos, { foreignKey: 'country_of_birth_id', as: 'born_travel_infos' });
db.Countries.hasMany(db.TravelInfos, { foreignKey: 'country_of_residence_id', as: 'resident_travel_infos' });
db.VisaApplications.hasMany(db.Payments, { foreignKey: 'visa_application_id', as: 'payments' });
db.Payments.belongsTo(db.VisaApplications, { foreignKey: 'visa_application_id', as: 'visa_application' });
db.VisaApplications.hasMany(db.ApplicationDocuments, { foreignKey: 'visa_application_id', as: 'application_documents' });
db.ApplicationDocuments.belongsTo(db.VisaApplications, { foreignKey: 'visa_application_id', as: 'visa_application' });
db.Users.hasMany(db.ApplicationDocuments, { foreignKey: 'uploaded_by', as: 'uploaded_documents' });
db.ApplicationDocuments.belongsTo(db.Users, { foreignKey: 'uploaded_by', as: 'uploader' });

// Country associations
db.CountryVisaEligibilities.belongsTo(db.Countries, { foreignKey: 'from_country_id', as: 'from_country' });
db.CountryVisaEligibilities.belongsTo(db.Countries, { foreignKey: 'to_country_id', as: 'to_country' });
db.Countries.hasMany(db.CountryVisaEligibilities, { foreignKey: 'from_country_id', as: 'from_eligibilities' });
db.Countries.hasMany(db.CountryVisaEligibilities, { foreignKey: 'to_country_id', as: 'to_eligibilities' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

