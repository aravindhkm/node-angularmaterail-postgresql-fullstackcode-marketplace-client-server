module.exports = (sequelize, DataTypes) => {
	const ProductOffers = sequelize.define(
		"ProductOffers",
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
				allowNull: false
			},
			productId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			channelId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			chatId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			unitPrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true
			},
			totalPrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true
			},
			status: {
				type: DataTypes.ENUM,
				values: ["Pending", "Accepted", "Declined"],
				defaultValue: "Pending"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProductOffers",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProductOffers.associate = models => {
		ProductOffers.belongsTo(models.Products, { foreignKey: "productId" });
	};

	return ProductOffers;
};
