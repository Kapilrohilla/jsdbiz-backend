const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const TravelInfos = sequelize.define(
    "TravelInfos",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      visa_application_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { 
        model: "VisaApplications",
        key: "id" 
        },
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nationality_country_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: "Countries", 
        key: "id"
        },
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country_of_birth_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: "Countries", 
        key: "id"
        },
      },
      country_of_residence_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: "Countries", 
        key: "id"
        },
      },
      passport_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passport_expiration_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      passport_issue_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );


  return TravelInfos;
};
