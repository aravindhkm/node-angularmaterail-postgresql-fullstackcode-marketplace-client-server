module.exports = (sequelize, DataTypes) => {
	const Products = sequelize.define(
		"Products",
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
			categoryId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			productName: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			location: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			imageName: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			videoName: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true
			},
			status: {
				type: DataTypes.ENUM,
				values: ["sold", "instock", "outstock"],
				defaultValue: "instock"
			},
			propertyJson: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			isBlock: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Products",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Products.associate = models => {
		Products.belongsTo(models.Categories, { foreignKey: "categoryId" });
		Products.hasMany(models.Channels, { foreignKey: "productId" });
		Products.hasMany(models.Wishlists, { foreignKey: "productId" });
		Products.hasMany(models.Reports, { foreignKey: "productId" });
		Products.hasMany(models.ProductOffers, { foreignKey: "productId" });
	};

	return Products;
};
