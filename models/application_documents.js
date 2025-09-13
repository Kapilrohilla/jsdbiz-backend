const { UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const ApplicationDocuments = sequelize.define("ApplicationDocuments", {
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
      type: {
        type: DataTypes.ENUM("passport", "photo", "supporting_doc", "visa_approval"),
        allowNull: false,
      },
      file_url:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      uploaded_by: {
        type: DataTypes.UUID, 
      },
    }, {
      timestamps: true,
      paranoid: true,
    });
  
    return ApplicationDocuments;
  };
  