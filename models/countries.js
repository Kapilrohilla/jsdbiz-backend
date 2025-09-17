const { UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Countries = sequelize.define(
    'Countries',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      iso_code: {
        type: DataTypes.STRING(10),
        allowNull:true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flag_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  return Countries;
};


