module.exports = (sequelize, DataTypes) => {
	const UserOtp = sequelize.define(
		"UserOtp",
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
			email: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			otp: {
				type: DataTypes.STRING(10),
				allowNull: true
			},
			otpExpire: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			type: {
				type: DataTypes.STRING(32),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "UserOtp",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	UserOtp.associate = models => {};

	return UserOtp;
};
