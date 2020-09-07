module.exports = (sequelize, DataTypes) => {
	const ChannelMembers = sequelize.define(
		"ChannelMembers",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			channelId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			isAdmin: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ChannelMembers",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ChannelMembers.associate = models => {};

	return ChannelMembers;
};
