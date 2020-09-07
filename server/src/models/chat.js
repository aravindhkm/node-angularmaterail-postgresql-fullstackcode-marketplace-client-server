module.exports = (sequelize, DataTypes) => {
	const Chats = sequelize.define(
		"Chats",
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
			channelId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			offerId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			toUserId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			responseTime: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			chatType: {
				type: DataTypes.ENUM,
				values: ["chat", "offer", "others"],
				defaultValue: "chat"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Chats",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Chats.associate = models => {
		Chats.hasOne(models.ProductOffers, { foreignKey: "chatId" });
	};

	return Chats;
};
