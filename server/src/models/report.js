module.exports = (sequelize, DataTypes) => {
	const Reports = sequelize.define(
		"Reports",
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
				allowNull: true
			},
			reason: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			reportType: {
				type: DataTypes.ENUM,
				values: ["user", "product", "others"],
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			status: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Reports",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Reports.associate = models => {
		Reports.belongsTo(models.Users, { foreignKey: "userId" });
		Reports.belongsTo(models.Products, { foreignKey: "productId" });
	};

	return Reports;
};
