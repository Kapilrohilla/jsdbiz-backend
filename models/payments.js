const { UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Payments = sequelize.define("Payments", {
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
        defaultValue: "pending",
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: true,
      paranoid: true,
    });
  
    return Payments;
  };
  