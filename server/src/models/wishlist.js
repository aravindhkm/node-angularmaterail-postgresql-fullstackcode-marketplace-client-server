module.exports = (sequelize, DataTypes) => {
	const Wishlists = sequelize.define(
		"Wishlists",
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
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Wishlists",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Wishlists.associate = models => {
		Wishlists.hasMany(models.Products, { foreignKey: "categoryId" });
	};

	return Wishlists;
};
