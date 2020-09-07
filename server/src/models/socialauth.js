module.exports = (sequelize, DataTypes) => {
	const SocialAuth = sequelize.define(
		"SocialAuth",
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
			provider: {
				type: DataTypes.STRING(32),
				allowNull: true
			},
			providerId: {
				type: DataTypes.STRING(32),
				unique: true,
				allowNull: false
			},
			providerData: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "SocialAuth",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	SocialAuth.associate = models => {
		SocialAuth.belongsTo(models.Users, { foreignKey: "userId" });
	};

	return SocialAuth;
};
