module.exports = (sequelize, DataTypes) => {
	const Notifications = sequelize.define(
		"Notifications",
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
			toUserId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			channelId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			productId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			offerId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			title: {
				type: DataTypes.STRING(255),
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			status: {
				type: DataTypes.ENUM,
				values: ["read", "unread"],
				defaultValue: "unread"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Notifications",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Notifications.associate = models => {
		Notifications.belongsTo(models.Users, { foreignKey: "toUserId" });
	};

	return Notifications;
};
