module.exports = (sequelize, DataTypes) => {
	const UserFollowers = sequelize.define(
		"UserFollowers",
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
			followersId: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "UserFollowers",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	UserFollowers.associate = models => {};

	return UserFollowers;
};
