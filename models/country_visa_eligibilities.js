const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const CountryVisaEligibilities = sequelize.define(
    "CountryVisaEligibilities",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      from_country_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Countries",
          key: "id",
        },
      },
      to_country_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Countries",
          key: "id",
        },
      },
      is_eligible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  return CountryVisaEligibilities;
};
