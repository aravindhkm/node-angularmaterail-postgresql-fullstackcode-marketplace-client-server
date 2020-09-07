import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import { v1 as uuidv1 } from "uuid";
// import popupTools from "popup-tools";
import { uniqueNamesGenerator, NumberDictionary } from "unique-names-generator";
import str from "string-sanitizer";

import utils from "../services/utils.service";
import bcryptService from "../services/bcrypt.service";
import authService from "../services/auth.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
import shared from "./shared.controller";

const { Users, SocialAuth, UserSessions, UserOtp } = db;
const Op = db.Sequelize.Op;

const attr = [
	"id",
	"firstName",
	"lastName",
	"userName",
	"email",
	"userImage",
	"gender",
	"mobile",
	"address",
	"configJson"
];

const AuthController = () => {
	const login = async (req, res) => {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let whereCodn = {};
			if (reqObj.type == "web") {
				whereCodn["roleName"] = ["admin", "superadmin"];
			} else {
				whereCodn["roleName"] = ["customer", "business", "employee"];
			}
			if (reqObj.email) {
				whereCodn["email"] = reqObj.email;
			}
			if (reqObj.userName) {
				whereCodn["userName"] = reqObj.userName;
			}
			if (reqObj.mobile) {
				whereCodn["mobile"] = reqObj.mobile;
			}

			whereCodn["isDeleted"] = 0;
			whereCodn["status"] = true;
			whereCodn["isBlock"] = true;
			let userData = await Users.findOne({
				where: whereCodn
			});
			if (userData) {
				let auth = await bcryptService().comparePassword(
					reqObj.password,
					userData.password
				);
				if (auth) {
					let token = await authService.issue(userData.userName);
					let deviceToken = reqObj.deviceToken
						? reqObj.deviceToken
						: null;

					let udid = uuidv1();
					let sessionObj = {
						userId: userData.id,
						udid: udid,
						token: token,
						deviceToken: deviceToken,
						deviceInfo: reqObj.deviceInfo
							? reqObj.deviceInfo
							: reqObj.type
							? { device: reqObj.type }
							: null
					};
					await UserSessions.destroy({
						where: { deviceToken: deviceToken }
					});
					let sessions = await UserSessions.create(sessionObj);

					await Users.update(
						{ type: "normal", updatedAt: new Date() },
						{
							where: { id: userData.id }
						}
					);

					let loggedUser = _.pick(userData, attr);

					loggedUser.sessionData = _.pick(sessions, [
						"udid",
						"token"
					]);
					if (userData) {
						let auditObj = {
							userId: userData.id,
							title: "User Login",
							description: "LoggedIn Successfully",
							type: "auth"
						};
						shared.createAudit(auditObj);
					}
					return res.status(httpStatus.OK).json({
						status: true,
						message: label.LOGIN_SUCCESS,
						data: loggedUser
					});
				} else {
					return res.status(httpStatus.BAD_REQUEST).json({
						status: false,
						message: label.WRONG_PSW
					});
				}
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.LOGIN_FAILED
				});
			}
		} catch (err) {
			console.log("errr===>", err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const forgotPassword = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userInput = utils.getReqValues(req);

			let whereCodn = {
				status: true,
				isBlock: true,
				isDeleted: 0
			};

			if (userInput.email) {
				whereCodn["email"] = userInput.email;
			}

			let userData = await Users.findOne({
				where: whereCodn
			});

			if (userData) {
				let mailResponse = await utils.sendVerificationEmail(
					userData,
					"forgotPassword"
				);
				if (mailResponse) {
					if (userData) {
						let auditObj = {
							userId: userData.id,
							title: "Forgot Password",
							description: "OTP value successfully sent",
							type: "auth"
						};
						shared.createAudit(auditObj);
					}
				}
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.OTP_SUCCESS
				});
			} else {
				return res.status(httpStatus.OK).json({
					status: false,
					message: label.NO_DATA
				});
			}
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const resetPassword = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userInput = utils.getReqValues(req);
			const { password, email } = userInput;

			let whereCodn = {};
			whereCodn["isDeleted"] = 0;
			whereCodn["isBlock"] = true;
			whereCodn["status"] = true;
			whereCodn["email"] = email;
			await Users.findOne({
				where: whereCodn
			})
				.then(async function(response) {
					if (response) {
						await Users.update(
							{ password: password, updatedAt: new Date() },
							{
								where: whereCodn
							}
						);
						if (response) {
							let auditObj = {
								userId: response.id,
								title: "Reset Password",
								description: "Password reset successfully",
								type: "auth"
							};
							shared.createAudit(auditObj);
						}
						return res.status(httpStatus.OK).json({
							status: true,
							message: label.PASS_RESET_SUCCESS
						});
					} else {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.EMAIL_OTP_INVALID
						});
					}
				})
				.catch(function(err) {
					return res.status(httpStatus.BAD_REQUEST).json({
						status: false,
						message: label.PASS_RESET_FAILED
					});
				});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const verifyOtp = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userInput = utils.getReqValues(req);
			const { email, otp, type } = userInput;

			let whereCodn = {};
			whereCodn["isDeleted"] = 0;
			whereCodn["email"] = email;
			whereCodn["otp"] = otp;
			whereCodn["type"] = type;

			await UserOtp.findOne({
				where: whereCodn
			})
				.then(async function(response) {
					if (response) {
						await UserOtp.update(
							{ isDeleted: 1, updatedAt: new Date() },
							{
								where: { email: email }
							}
						);
						await Users.update(
							{ status: true, updatedAt: new Date() },
							{
								where: { email: email }
							}
						);
						if (response) {
							let auditObj = {
								userId: response.id,
								title: "Verify OTP",
								description: "OTP verified successfully.",
								type: "auth"
							};
							shared.createAudit(auditObj);
						}
						return res.status(httpStatus.OK).json({
							status: true,
							message: label.OTP_VRIFY_SUCCESS
						});
					} else {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.OTP_VRIFY_FAILED
						});
					}
				})
				.catch(function(err) {
					console.log(err);
				});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const socialLogin = async (req, res) => {
		try {
			let {
				provider,
				photos,
				id,
				name,
				displayName,
				username,
				email,
				mobile
			} = req.body;
			const numberDictionary = NumberDictionary.generate({
				min: 100,
				max: 999
			});

			let providerId = id;
			let first_name = name && name ? name : null;
			let userName = username
				? username
				: uniqueNamesGenerator({
						dictionaries: [
							[str.sanitize(displayName)],
							numberDictionary
						],
						length: 2,
						separator: "",
						style: "lowerCase"
				  });
			let emailName = email ? email : null;
			let profilePic = photos ? photos : null;

			let usrObj = {};

			if ((!providerId && !emailName) || (!providerId && !mobile)) {
				throw "Invalid user";
			}

			console.log(
				`req.session.passport: ${JSON.stringify(req.session.passport)}`
			);
			console.log(
				`req.session.passport - 1 : ${JSON.stringify(req.session)}`
			);

			let whereCodn = {};
			whereCodn["isDeleted"] = 0;
			whereCodn["status"] = true;
			whereCodn["isBlock"] = true;
			whereCodn["type"] = "social";
			if (mobile) {
				whereCodn["mobile"] = mobile;
			}

			if (emailName) {
				whereCodn["email"] = emailName;
			}

			let userData = await Users.findOne({
				where: whereCodn,
				attributes: attr
			});

			console.log("userData", userData);

			if (userData) {
				console.log("userData", userData.firstName);

				let cond = {};
				cond["userId"] = userData.id;
				cond["provider"] = provider;
				cond["providerId"] = id;

				let authData = await SocialAuth.findOne({
					where: cond,
					attributes: ["id"]
				});

				console.log("authDataauthDataauthData", authData);
				let authObj = {
					userId: userData.id,
					provider: provider,
					providerId: providerId,
					providerData: req.body
				};

				if (!authData) {
					await SocialAuth.create(authObj);
				} else {
					authData.id = authData.id;
					authData.userId = userData.id;
					authData.provider = provider;
					authData.providerId = providerId;
					authData.providerData = req.body;

					await authData.save();
				}
			} else {
				usrObj["email"] = emailName;
				usrObj["displayName"] = displayName;
				usrObj["userName"] = userName;
				usrObj["password"] = userName + "@12345";
				usrObj["type"] = "social";
				usrObj["firstName"] = first_name;
				usrObj["mobile"] = mobile ? mobile : null;
				usrObj["profileImg"] = profilePic;
				usrObj["status"] = true;

				console.log("usrObjusrObj", usrObj);

				userData = await Users.create(usrObj);

				await SocialAuth.create({
					userId: userData.id,
					provider: provider,
					providerId: providerId,
					providerData: req.user
				});
			}

			let loggedUser = _.pick(userData, attr);

			let udid = uuidv1();
			let token = await authService.issue({
				userId: userData.id,
				provider: provider,
				udid: udid
			});

			let sessions = await UserSessions.create({
				userId: userData.id,
				udid: udid,
				token: token,
				deviceInfo: { provider: provider, device: "web" }
			});
			if (userData) {
				let auditObj = {
					userId: userData.id,
					title: "Social Login",
					description: "LoggedIn Successfully.",
					type: "auth"
				};
				shared.createAudit(auditObj);
			}
			loggedUser.sessionData = _.pick(sessions, ["udid", "token"]);

			console.log("reqObjreqObjreqObjreqObj", loggedUser);
			return res.status(httpStatus.OK).json({
				status: true,
				msg: label.LOGIN_SUCCESS,
				data: loggedUser
			});
		} catch (err) {
			return res
				.status(httpStatus.BAD_REQUEST)
				.json({ status: false, message: err });
		}
		/*res.send(popupTools.popupResponse(loggedUser));
		} catch (err) {
			console.log("errr===>", err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			res.send(popupTools.popupResponse(err));
		}*/
	};

	return {
		login,
		forgotPassword,
		resetPassword,
		verifyOtp,
		socialLogin
	};
};

export default AuthController();
