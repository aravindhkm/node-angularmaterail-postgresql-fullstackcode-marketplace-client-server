module.exports = (sequelize, DataTypes) => {
	const Channels = sequelize.define(
		"Channels",
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
			productId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			channelType: {
				type: DataTypes.STRING(32),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Channels",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Channels.associate = models => {
		Channels.belongsTo(models.Users, { foreignKey: "userId" });
		Channels.hasMany(models.Chats, { foreignKey: "channelId" });
		Channels.hasMany(models.ChannelMembers, { foreignKey: "channelId" });
		Channels.hasMany(models.ProductOffers, { foreignKey: "channelId" });
	};

	return Channels;
};
