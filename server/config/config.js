import Joi from "@hapi/joi";
require("dotenv").config();
const envVarsSchema = Joi.object({
	NODE_ENV: Joi.string()
		.allow("development", "production", "test", "provision")
		.default("development"),
	PORT: Joi.number().default(3000),
	SOCKET_PORT: Joi.number().default(3001),
	PROTOCAL: Joi.string().default("http://"),
	SERVER_KEY: Joi.string().default(
		"AAAASJ0KUko:APA91bHTozUBfxIps3Ysxj7UkiieN-nz4iQcOjPu4b7CZavBCeVCI18Urr5Rmh2c5jKce4TxMDoQxnGkUynbzrDlaGuaQJyuXKvMlk1cvZOUY9zMjbeMGk49WjAb74GFwFwFXOA8KQlG"
	),
	API_VERSION: Joi.string()
		.default("1.0")
		.description("API Version"),
	SECURITY_SALT: Joi.string()
		.default("SECURE$U#&*123")
		.description("API Version"),
	JWT_TOKEN_EXPIRE: Joi.string()
		.default("5d")
		.description("JWT Token Expired in Days"),
	JWT_SECRET: Joi.string()
		.required()
		.default("MARKET$U#&*123")
		.description("JWT Secret Code"),
	BASE_URL: Joi.string().default("localhost"),
	COMMON_MAIL: Joi.string()
		.default("stevej.india@gmail.com")
		.description("Common Email Id"),
	COMMON_MAIL_PASSWORD: Joi.string()
		.default("gis123456")
		.description("Common Email Id Password"),
	SMTP_SERVICE: Joi.string()
		.default("gmail")
		.description("Email SMTP service"),
	SMTP_HOST: Joi.string()
		.default("smtp.gmail.com")
		.description("Email SMTP host"),
	SMTP_PORT: Joi.number().default(587),
	UPLOAD_PATH: Joi.string()
		.default("/uploads")
		.description("uploads"),
	PG_DB: Joi.string()
		.default("marketplace")
		.description("marketplace"),
	PG_PORT: Joi.number().default(5432),
	PG_HOST: Joi.string().default("localhost"),
	PG_USER: Joi.string()
		.default("postgres")
		.description("postgres"),
	PG_PASSWORD: Joi.string()
		.default("root")
		.allow("")
		.description("marketplace")
})
	.unknown()
	.required();

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const config = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	socketPort: envVars.SOCKET_PORT,
	apiVersion: envVars.API_VERSION,
	jwtSecret: envVars.JWT_SECRET,
	jwtTokenExpire: envVars.JWT_TOKEN_EXPIRE,
	uploadPath: envVars.UPLOAD_PATH,
	SECURITY_SALT: envVars.SECURITY_SALT,
	commonEmail: envVars.COMMON_MAIL,
	commonEmailPwd: envVars.COMMON_MAIL_PASSWORD,
	BASE_URL: envVars.BASE_URL,
	PROTOCAL: envVars.PROTOCAL,
	SERVER_KEY: envVars.SERVER_KEY,
	postgres: {
		db: envVars.PG_DB,
		port: envVars.PG_PORT,
		host: envVars.PG_HOST,
		user: envVars.PG_USER,
		password: envVars.PG_PASSWORD
	},
	smtpService: envVars.SMTP_SERVICE,
	smtpHost: envVars.SMTP_HOST,
	smtpPort: envVars.SMTP_PORT
};

export default config;
