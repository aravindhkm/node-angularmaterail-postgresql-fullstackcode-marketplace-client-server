module.exports = (sequelize, DataTypes) => {
	const Supports = sequelize.define(
		"Supports",
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
			name: {
				type: DataTypes.STRING(255),
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(128),
				defaultValue: true
			},
			status: {
				type: DataTypes.ENUM,
				values: ["pending", "completed"],
				defaultValue: "pending"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Supports",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Supports.associate = models => {
		Supports.belongsTo(models.Users, { foreignKey: "userId" });
	};

	return Supports;
};
