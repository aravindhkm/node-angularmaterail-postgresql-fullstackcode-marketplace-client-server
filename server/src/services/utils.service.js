import _ from "lodash";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import config from "../../config/config";
const saltRounds = 10;
import db from "../../config/sequelize";

import shared from "../controllers/shared.controller";

const { Users, Settings, UserOtp, Templates } = db;
export default {
	generateOTP() {
		const min = 100000;
		const max = 999999;

		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	getReqValues(req) {
		return _.pickBy(_.extend(req.body, req.params, req.query), _.identity);
	},

	// password(user) {
	// 	const salt = bcrypt.genSaltSync(saltRounds);
	// 	const hash = bcrypt.hashSync(user.password, salt);

	// 	return hash;
	// },
	// updatePassword(pass) {
	// 	const salt = bcrypt.genSaltSync(saltRounds);
	// 	const hash = bcrypt.hashSync(pass, salt);

	// 	return hash;
	// },
	// comparePassword(pw, hash) {
	// 	const pass = bcrypt.compareSync(pw, hash);

	// 	return pass;
	// },

	unLinkFilePath(filePath) {
		return new Promise(resolve => {
			fs.unlink(filePath, err => {
				if (err) {
					resolve({ status: false, message: err });
				} else {
					resolve({ status: true });
				}
			});
		});
	},

	getActivityLogs(notify) {
		return new Promise(resolve => {
			try {
				const filePath = path.join(
					__dirname,
					"../constant/activitylog.json"
				);

				fs.readFile(filePath, "utf8", (err, res) => {
					if (err) {
						resolve({ status: false, message: err });
					} else {
						const notifyInfo = JSON.parse(res);

						resolve({ status: true, data: notifyInfo[notify] });
					}
				});
			} catch (error) {
				resolve({ status: false, message: error });
			}
		});
	},

	async sendVerificationEmail(mailData, type) {
		let emailFlag = false;
		let otp = this.generateOTP();

		let smtpTransport = nodemailer.createTransport({
			service: config.smtpService,
			host: config.smtpHost,
			port: config.smtpPort,
			auth: {
				user: config.commonEmail, // generated ethereal user
				pass: config.commonEmailPwd // generated ethereal password
			}
		});
		let templateData = await Templates.findOne({ where: { type: type } });
		let htmlToSend =
			"Hello " +
			mailData.userName +
			"," +
			"\n\n" +
			"Please Use this OTP to Reset :" +
			otp;
		var mailOptions = {
			to: mailData.email,
			from: "******",
			subject: "MarketPlace - OTP Number:",
			cc: "*******"
		};

		mailOptions["text"] = htmlToSend;
		if (_.size(templateData) > 0) {
			const template = Handlebars.compile(templateData.templateValue);
			const replacements = {
				otp: otp
			};
			htmlToSend = template(replacements);
			mailOptions["html"] = htmlToSend;
		}

		smtpTransport.verify(function(error, success) {
			if (error) {
				console.log(error);
			} else {
				console.log("Server is ready to take our messages");
			}
		});

		smtpTransport.sendMail(mailOptions, async function(err) {
			console.log("errerr", err);
			if (err) {
				console.log("errrrr");
				emailFlag = false;
			} else {
				if (mailData) {
					let auditObj = {
						userId: mailData.id,
						title: "Forgot Password",
						description: "OTP value successfully sent",
						type: "auth"
					};
					shared.createAudit(auditObj);
				}
				await UserOtp.update(
					{ isDeleted: 1, updatedAt: new Date() },
					{
						where: { userId: mailData.id }
					}
				);
				await UserOtp.create({
					userId: mailData.id,
					otp: otp,
					otpExpire: 1,
					type: type,
					email: mailData.email
				});
				emailFlag = true;
			}
		});
		return emailFlag;
	},

	readHTMLFile(path, callback) {
		fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
			if (err) {
				console.log(err);
				callback(err);
			} else {
				console.log(html);
				callback(null, html);
			}
		});
	},

	initialUserRecords() {
		fs.readFile(
			config.uploadPath + "server/config/initialRecords.json",
			(err, data) => {
				if (data) {
					const initialRecords = JSON.parse(data);
					Object.keys(initialRecords).forEach(async tableName => {
						if (tableName == "Users") {
							_.forEach(
								initialRecords[tableName],
								async records => {
									try {
										await this.createInitialRecord(
											tableName,
											records
										);
									} catch (err) {
										console.error(
											"Initial Record Error",
											err
										);
									}
								}
							);
						} else {
							await this.createInitialRecord(
								tableName,
								initialRecords[tableName]
							);
						}
					});
				}
			}
		);
	},

	async createInitialRecord(tableName, records) {
		try {
			if (tableName == "Users") {
				await Users.create(records);
			} else if (tableName == "Settings") {
				await Settings.bulkCreate(records);
			}
		} catch (err) {
			console.log("err" + err);
		}
	}
};
