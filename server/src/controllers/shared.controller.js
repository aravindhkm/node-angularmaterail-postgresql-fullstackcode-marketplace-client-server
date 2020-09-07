import { validationResult, check } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
import config from "../../config/config";
import FCM from "fcm-node";

const {
	Users,
	Reports,
	Notifications,
	AuditLogs,
	Settings,
	Templates,
	Supports,
	Products,
	Banners,
	UserSessions,
	Chats,
	ProductOffers
} = db;
const Op = db.Sequelize.Op;

const SharedController = () => {
	const list = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let modelName;
			let cond = {};
			let includeModel = "";
			cond["isDeleted"] = 0;
			let userAttr = {
				exclude: ["createdAt", "updatedAt", "password"]
			};

			let userCond = {};
			userCond["roleName"] = ["customer", "business", "employee"];
			userCond["status"] = true;
			userCond["isBlock"] = true;
			userCond["isDeleted"] = 0;

			if (reqObj.type == "report") {
				modelName = Reports;

				let pdtCond = {};
				pdtCond["isDeleted"] = 0;
				pdtCond["isBlock"] = false;
				includeModel = [
					{
						model: Users,
						where: userCond,
						required: false,
						attributes: userAttr
					},
					{ model: Products, where: pdtCond, required: false }
				];

				cond["status"] = { $or: [null, "block"] };
			}
			if (reqObj.type == "template") {
				modelName = Templates;
				if (reqObj.templateId) {
					cond["id"] = reqObj.templateId;
				}
			}
			if (reqObj.type == "support") {
				modelName = Supports;
				includeModel = [
					{
						model: Users,
						attributes: userAttr
					}
				];
				if (reqObj.supportId) {
					cond["id"] = reqObj.supportId;
				}
			}
			if (reqObj.type == "setting") {
				modelName = Settings;
			}
			if (reqObj.type == "notification") {
				modelName = Notifications;
				cond["status"] = "unread";
				if (reqObj.userId) {
					includeModel = [
						{
							model: Users,
							where: userCond,
							required: false,
							attributes: userAttr
						}
					];
					cond["toUserId"] = reqObj.userId;
				}
			}

			if (reqObj.type == "banner") {
				modelName = Banners;
				if (reqObj.bannerId) {
					cond["id"] = reqObj.bannerId;
				}
			}

			if (reqObj["searchTxt"] && reqObj.type == "report") {
				cond[Op.or] = [
					{
						reportType: reqObj["searchTxt"]
					}
				];
			}
			if (reqObj["searchTxt"] && reqObj.type == "support") {
				cond[Op.or] = [
					{
						name: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						description: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						type: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						"$User.userName$": {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					}
				];
			}

			const page = reqObj.page ? reqObj.page : 1;
			const limit = reqObj.limit ? reqObj.limit : 10;
			const offset = (page - 1) * limit;
			// let attributes = { exclude: ["createdAt", "updatedAt"] };

			let listData = await modelName.findAndCountAll({
				where: cond,
				offset: offset,
				include: includeModel,
				order: [["id", "DESC"]],
				limit: limit
			});

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: listData
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const createTemplate = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (_.size(reqObj) > 0) {
				if (reqObj.templateId) {
					await Templates.update(reqObj, {
						where: { id: reqObj["templateId"] }
					});
				} else {
					await Templates.create(reqObj);
				}

				return res.status(httpStatus.OK).json({
					status: true,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const createSupport = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (_.size(reqObj) > 0) {
				if (reqObj.supportId) {
					await Supports.update(reqObj, {
						where: { id: reqObj["supportId"] }
					});
				} else {
					await Supports.create(reqObj);
				}
				if (reqObj.userId) {
					let auditObj = {
						userId: reqObj.userId,
						title: "Contact Support",
						description: "Contact Support Form Submitted",
						type: "support"
					};
					await createAudit(auditObj);
				}
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const createReport = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (_.size(reqObj) > 0) {
				await Reports.create(reqObj);
				if (reqObj.userId) {
					let auditObj = {
						userId: reqObj.userId,
						title: "Reports",
						description: reqObj.reason,
						type: reqObj.reportType + "report"
					};
					await createAudit(auditObj);
				}
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const updateStatus = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let modelName, status;
			let cond = {};
			if (reqObj.reportId) {
				status = reqObj.status ? reqObj.status : null;
				let ids = reqObj.reportId.split(",");
				cond["id"] = ids;
				modelName = Reports;
				if (reqObj.type == "user" && reqObj.userId) {
					await Users.update(
						{ status: false, updatedAt: new Date() },
						{ where: { id: reqObj.userId } }
					);
				}
				if (reqObj.type == "product" && reqObj.productId) {
					await Products.update(
						{ isBlock: true, updatedAt: new Date() },
						{ where: { id: reqObj.productId } }
					);
				}
			}
			if (reqObj.supportId) {
				let idsa = reqObj.supportId.split(",");
				cond["id"] = idsa;
				status = reqObj.status ? reqObj.status : null;
				modelName = Supports;
			}

			if (reqObj.settingId) {
				cond["id"] = reqObj.settingId;
				status = reqObj.status ? reqObj.status : false;
				modelName = Settings;
			}
			if (reqObj.notifyId) {
				cond["id"] = reqObj.notifyId;
				status = reqObj.status ? reqObj.status : "unread";
				modelName = Notifications;
			}
			if (reqObj.userId && reqObj.type == "notification") {
				cond["toUserId"] = reqObj.userId;
				status = reqObj.status ? reqObj.status : "unread";
				modelName = Notifications;
			}
			let updateObj = {
				status: status,
				updatedAt: new Date()
			};

			await modelName
				.update(updateObj, {
					where: cond,
					returning: true,
					raw: true,
					plain: true
				})
				.then(async updatedData => {
					if (_.size(updatedData) > 0) {
						updatedData = updatedData.filter(value => {
							return value != undefined;
						});
						return res.status(httpStatus.OK).json({
							status: true,
							message: label.UPDATE_SUCCESS,
							data: updatedData
						});
					}
				})
				.catch(err => {
					return res
						.status(httpStatus.BAD_REQUEST)
						.json({ status: false, message: err });
				});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const createAudit = async auditData => {
		await AuditLogs.create(auditData);
		return true;
	};

	const createBanner = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const bannerObj = utils.getReqValues(req);

			const reqObj = bannerObj.bannerData
				? JSON.parse(bannerObj.bannerData)
				: [];
			if (_.size(reqObj) > 0) {
				if (req.files && req.files.bannerImage) {
					let imageDatas = _.map(req.files.bannerImage, "filename");
					reqObj.imageName =
						imageDatas && imageDatas[0] ? imageDatas[0] : null;
				}

				if (reqObj.bannerId) {
					await Banners.update(reqObj, {
						where: { id: reqObj["bannerId"] }
					});
				} else {
					await Banners.create(reqObj);
				}

				return res.status(httpStatus.OK).json({
					status: true,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const deleteBanner = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.bannerId) {
				await Banners.destroy({
					where: { id: reqObj.bannerId }
				});

				return res.status(httpStatus.OK).json({
					status: true,
					message: label.DELETE_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.SOMETHING_WRONG
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

	const responses = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let attributes = {
				exclude: ["createdAt", "updatedAt", "password"]
			};
			cond["isDeleted"] = 0;
			cond["status"] = true;
			cond["isBlock"] = true;
			if (reqObj.userId) {
				cond["id"] = reqObj.userId;
				attributes = "";
			}
			cond["roleName"] = ["customer", "business", "employee"];

			if (reqObj["searchTxt"]) {
				cond[Op.or] = [
					{
						firstName: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						email: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						userName: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						mobile: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					}
				];
			}

			const page = reqObj.page ? reqObj.page : 1;
			const limit = reqObj.limit ? reqObj.limit : 10;
			const offset = (page - 1) * limit;

			let queryObj = {
				where: cond,
				offset: offset,
				order: [["id", "DESC"]],
				limit: limit,
				attributes: attributes,
				raw: true
			};

			let userData = await Users.findAndCountAll(queryObj);

			if (_.size(userData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			for (let i = 0; i < userData.rows.length; i++) {
				console.log(userData.id, "userData.id========");
				userData.rows[i] = {
					id: userData.rows[i].id,
					firstName: userData.rows[i].firstName,
					lastName: userData.rows[i].lastName,
					userName: userData.rows[i].userName,
					email: userData.rows[i].email,
					mobile: userData.rows[i].mobile,
					address: userData.rows[i].address,
					countryCode: userData.rows[i].countryCode,
					location: userData.rows[i].location,
					status: userData.rows[i].status,
					roleName: userData.rows[i].roleName,
					userImage: userData.rows[i].userImage,
					responseData: await getChatResponses(userData.rows[i].id)
				};
				// userData.rows[i].responseData = await getChatResponses(
				// 	userData.rows[i].id
				// );
			}
			console.log(JSON.stringify(userData), "userData============");
			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: userData
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const getChatResponses = async userId => {
		let responseTimeData = await Chats.findAll({
			where: {
				userId: userId,
				toUserId: { $ne: userId },
				responseTime: { $ne: null }
			},
			attributes: [
				[
					db.sequelize.fn("AVG", db.sequelize.col("responseTime")),
					"responseTime"
				]
			],
			group: ["userId"],
			raw: true
		});
		console.log(responseTimeData, "responseTimeData=============");
		let totalUsers = await Chats.findAll({
			where: { userId: { $ne: userId }, toUserId: userId },
			attributes: [
				[
					db.sequelize.fn("count", db.sequelize.col("userId")),
					"totalCount"
				]
			],
			group: ["toUserId"],
			raw: true
		});

		console.log(totalUsers, "totalUsers=============");

		let responseUsers = await Chats.findAll({
			where: { userId: userId, toUserId: { $ne: userId } },
			attributes: [
				[
					db.sequelize.fn("count", db.sequelize.col("userId")),
					"responseCount"
				]
			],
			group: ["userId"],
			raw: true
		});

		console.log(responseUsers, "responseUsers=============");
		let respCnt =
			responseUsers && responseUsers[0]
				? responseUsers[0].responseCount
				: 0;

		console.log(respCnt, "respCnt=============");
		let totCnt = totalUsers && totalUsers[0] ? totalUsers[0].totalCount : 0;
		console.log(totCnt, "totCnt=============");
		// if (totCnt > respCnt) {
		let responseRate = (parseInt(respCnt) / 100) * parseInt(totCnt);
		// }
		let reponseObj = {
			userId: userId,
			responseTime:
				responseTimeData &&
				responseTimeData[0] &&
				responseTimeData[0].responseTime
					? parseFloat(responseTimeData[0].responseTime).toFixed(2)
					: 0,
			responseRate: responseRate ? responseRate + "%" : 0 + "%"
		};
		return reponseObj;
	};

	const createNotification = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (_.size(reqObj) > 0) {
				await sendPushNotification(reqObj, reqObj.toUserId);

				return res.status(httpStatus.OK).json({
					status: true,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};

	const getDeviceTokens = async userIds => {
		let deviceTokens = [];
		let cond = {};
		cond["isDeleted"] = 0;
		cond["isBlock"] = true;
		cond["status"] = true;
		cond["configJson.notification"] = true;
		if (userIds && userIds.length > 0) {
			cond["id"] = { $in: userIds };
		} else {
			cond["id"] = userIds;
		}

		let userData = await Users.findAll({
			where: cond,
			raw: true
		});
		let ids = _.map(userData, "id");
		let userSessionData = await UserSessions.findAll({
			where: { userId: { $in: ids }, isDeleted: 0 }
		});
		if (userSessionData) {
			userSessionData.forEach(value => {
				if (value.deviceToken) deviceTokens.push(value.deviceToken);
			});
		}

		return deviceTokens ? deviceTokens : [];
	};

	const sendPushNotification = async (notificationdata, userId) => {
		console.log(notificationdata, "notificationdata=========");

		console.log(userId, "userId=========");

		let tokens = await getDeviceTokens(userId);
		console.log(tokens, "tokens=========");
		if (tokens && tokens.length > 0) {
			var serverKey = config.SERVER_KEY;
			var fcm_a = new FCM(serverKey);
			var bodyObj = {
				message: notificationdata.message
					? notificationdata.message
					: null,
				type: notificationdata.type ? notificationdata.type : null,
				fromUser: notificationdata.userId
					? notificationdata.userId
					: null,
				toUser: notificationdata.toUserId
					? notificationdata.toUserId
					: null,
				productId: notificationdata.productId
					? notificationdata.productId
					: null,
				channelId: notificationdata.channelId
					? notificationdata.channelId
					: null
			};
			console.log(bodyObj, "bodyObj=========");
			var message = {
				// to:
				// 	"cG4bZ4b3To6MHNbOx385oH:APA91bEyOPPYQIqHty8Y3zLIvMtJNhAd6Y2gMOPfzP6YyypZXUvOrCgvEnbqwDoFb2jhwQogwnAGsuvU6TwA4sugn6bwoL0UYhCbyHiyBaARL-sMuV1beRQ-BH60Q63GT9Owt8mbzsN7",
				// to: userInput.accessToken, // send single
				registration_ids: tokens, //-- send multiple
				collapse_key: "your_collapse_key",
				aps: {
					alert: {
						title: notificationdata.title,
						message: notificationdata.message
							? notificationdata.message
							: null
					},
					body: bodyObj
				},
				data: {
					title: notificationdata.title,
					body: bodyObj
				}
			};
			fcm_a.send(message, async (err, response) => {
				if (err) {
					console.log("Something has gone wrong!", err);
				} else {
					if (notificationdata.toUserId) {
						let toUsers =
							notificationdata.toUserId &&
							notificationdata.toUserId.length > 0
								? notificationdata.toUserId
								: [notificationdata.toUserId];
						if (toUsers && toUsers.length > 0) {
							let createArray = [];
							toUsers.forEach(element => {
								let createObj = {
									userId: notificationdata.userId,
									toUserId: element,
									title: notificationdata.title,
									description: notificationdata.message,
									productId: notificationdata.productId
										? notificationdata.productId
										: null,
									channelId: notificationdata.channelId
										? notificationdata.channelId
										: null,
									type: notificationdata.type
								};
								createArray.push(createObj);
							});
							await Notifications.bulkCreate(createArray);
						}
					}

					console.log("Successfully sent with response: ", response);
				}
			});
		}
	};

	const dashboardReport = async (req, res) => {
		try {
			let stockData = await Products.findAll({
				where: { isDeleted: 0, isBlock: false, status: "instock" },
				attributes: [
					"userId",
					[
						db.sequelize.fn("COUNT", db.sequelize.col("userId")),
						"productCount"
					]
				],
				group: ["userId"],
				order: [[db.sequelize.literal(`"productCount"`), "DESC"]],
				limit: 5
			});

			let soldData = await Products.findAll({
				where: { isDeleted: 0, isBlock: false, status: "sold" },
				attributes: [
					"userId",
					[
						db.sequelize.fn("COUNT", db.sequelize.col("userId")),
						"productCount"
					]
				],
				group: ["userId"],
				order: [[db.sequelize.literal(`"productCount"`), "DESC"]],
				limit: 5
			});

			let offerData = await ProductOffers.findAll({
				where: { isDeleted: 0 },
				attributes: [
					"toUserId",
					"status",
					[
						db.sequelize.fn("COUNT", db.sequelize.col("toUserId")),
						"offerCount"
					]
				],
				group: ["toUserId", "status"],
				order: [[db.sequelize.literal(`"offerCount"`), "DESC"]],
				limit: 5
			});

			let userData = await Users.findAll({
				where: { status: true, isBlock: true, isDeleted: 0 },
				attributes: ["id", "firstName", "lastName", "userName"]
			});

			let reportData = {};
			reportData = {
				stockProducts: stockData ? stockData : [],
				soldProducts: soldData ? soldData : [],
				userData: userData ? userData : [],
				offerData: offerData ? offerData : []
			};

			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: reportData
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res
				.status(err.statusCode)
				.json({ status: false, message: err });
		}
	};
	return {
		list,
		responses,
		createSupport,
		createTemplate,
		createReport,
		createBanner,
		updateStatus,
		createAudit,
		deleteBanner,
		createNotification,
		sendPushNotification,
		dashboardReport
	};
};

export default SharedController();
