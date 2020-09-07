import { loggers } from "winston";
import config from "./config/config";
import app from "./config/express";
import socket from "./socket.io";
import db from "./config/sequelize";
// Get default logger
const logger = loggers.get(config.loggerName); // eslint-disable-line no-global-assign

// make bluebird default Promise
Promise = require("bluebird"); // eslint-disable-line no-global-assign

if (!module.parent) {
	app.listen(config.port, () => {
		logger.info(
			`The application has started on port ${config.port} (${config.env})`
		); // eslint-disable-line no-console
	});
}

export default app;
