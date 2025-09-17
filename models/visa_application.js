const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const VisaApplications = sequelize.define(
    "VisaApplications",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      from_country_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "Countries", 
        key: "id"
        },
      },
      to_country_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "Countries",
        key: "id" 
        },
      },
      arrival_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      departure_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      destination_country_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: "Countries",
        key: "id" 
        },
      },
      own_country_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
        model: "Countries",
        key: "id" 
        },
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration_of_stay: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      visa_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flight_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      airline: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itinerary_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      purpose: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "submitted",
          "under_review",
          "approved",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "draft",
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  return VisaApplications;
};
