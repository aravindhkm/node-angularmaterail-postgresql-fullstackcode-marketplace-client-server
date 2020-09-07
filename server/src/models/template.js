module.exports = (sequelize, DataTypes) => {
	const Templates = sequelize.define(
		"Templates",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false
			},
			templateValue: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(64),
				defaultValue: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Templates",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Templates.associate = models => {};

	return Templates;
};
