import bcryptService from "../services/bcrypt.service";
module.exports = (sequelize, DataTypes) => {
	const Users = sequelize.define(
		"Users",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			firstName: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			lastName: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			userName: {
				type: DataTypes.STRING(64),
				unique: true,
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			companyName: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			companyId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			companyUEN: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			serviceId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			email: {
				type: DataTypes.STRING(64),
				allowNull: false,
				unique: true
			},
			password: {
				type: DataTypes.STRING(128),
				allowNull: false
			},
			userImage: {
				type: DataTypes.STRING,
				allowNull: true
			},
			gender: {
				type: DataTypes.ENUM,
				values: ["male", "female", "others"],
				defaultValue: null,
				allowNull: true
			},
			mobile: {
				type: DataTypes.STRING(11),
				allowNull: true
			},
			address: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			countryCode: {
				type: DataTypes.STRING(10),
				allowNull: true
			},
			location: {
				type: DataTypes.JSONB(),
				allowNull: true
			},
			roleName: {
				type: DataTypes.ENUM,
				values: [
					"superadmin",
					"admin",
					"customer",
					"business",
					"employee"
				],
				defaultValue: "customer",
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(20),
				allowNull: true
			},
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			isBlock: {
				type: DataTypes.BOOLEAN,
				defaultValue: true
			},
			isOnline: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			configJson: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Users",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Users.associate = models => {
		Users.hasMany(models.SocialAuth, { foreignKey: "userId" });
		Users.hasMany(models.UserOtp, { foreignKey: "userId" });
		Users.hasMany(models.UserSessions, { foreignKey: "userId" });
		Users.hasMany(models.Products, { foreignKey: "userId" });
		Users.hasMany(models.Wishlists, { foreignKey: "userId" });
		Users.hasMany(models.Reports, { foreignKey: "userId" });
		Users.hasMany(models.ProductOffers, { foreignKey: "userId" });
		Users.hasMany(models.Supports, { foreignKey: "userId" });
	};

	Users.beforeCreate(user => {
		if (user && user.password) {
			user.password = bcryptService().password(user.password);
		}
	});

	Users.beforeUpdate(user => {
		if (user && user.password) {
			user.password = bcryptService().password(user.password);
		}
	});

	Users.beforeBulkUpdate(user => {
		if (user.attributes && user.attributes.password) {
			user.attributes.password = bcryptService().updatePassword(
				user.attributes.password
			);
		}
	});

	return Users;
};
