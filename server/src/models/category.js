module.exports = (sequelize, DataTypes) => {
	const Categories = sequelize.define(
		"Categories",
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
			type: {
				type: DataTypes.ENUM,
				values: ["category", "service", "others"],
				defaultValue: "category",
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Categories",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Categories.associate = models => {
		Categories.hasMany(models.Products, { foreignKey: "categoryId" });
	};

	return Categories;
};
