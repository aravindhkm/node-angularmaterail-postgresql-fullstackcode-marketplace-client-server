module.exports = (sequelize, DataTypes) => {
	const Banners = sequelize.define(
		"Banners",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			imageName: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Banners",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Banners.associate = models => {};

	return Banners;
};
