module.exports = (sequelize, DataTypes) => {
	const UserSessions = sequelize.define(
		"UserSessions",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			udid: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: true
			},
			token: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false
			},
			deviceToken: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: true
			},
			deviceInfo: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "UserSessions",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	UserSessions.associate = models => {
		UserSessions.belongsTo(models.Users, { foreignKey: "userId" });
	};

	return UserSessions;
};
