module.exports = (sequelize, DataTypes) => {
	const AuditLogs = sequelize.define(
		"AuditLogs",
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
			title: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "AuditLogs",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	AuditLogs.associate = models => {};

	return AuditLogs;
};
