
const { UUIDV4 } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	const Users = sequelize.define('Users', {
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: UUIDV4,
		  },
		first_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		last_name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull:false,
			unique: true,
			validate: { isEmail: true },
		},
		phone_number: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		last_login_date: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM("user", "admin"),
			defaultValue: "user",
		  },
	}, {
		timestamps: true,

		paranoid: true,
	});
	return Users;
};
