import { validationResult, check } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
import shared from "./shared.controller";
const { Users, UserFollowers, Products, UserOtp, Wishlists, Reports } = db;
const Op = db.Sequelize.Op;

const UserController = () => {
	const create = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userObj = utils.getReqValues(req);
			console.log("reqObjreqObjreqObj", userObj);
			const reqObj = userObj.userData ? JSON.parse(userObj.userData) : [];

			let userData = [];
			let emailCond = {};
			let nameCond = {};
			let whereCodn = {};

			if (reqObj.email) {
				emailCond["email"] = reqObj.email;
			}
			if (reqObj.userName) {
				nameCond["userName"] = reqObj.userName;
			}
			whereCodn["isDeleted"] = 0;

			if (req.files && req.files.profileImage) {
				let imageDatas = _.map(req.files.profileImage, "filename");
				reqObj.userImage =
					imageDatas && imageDatas[0] ? imageDatas[0] : null;
			}
			if (_.size(reqObj) > 0) {
				if (reqObj.userId) {
					await Users.update(reqObj, {
						where: { id: reqObj["userId"] }
					});
				} else {
					let cond = { $or: [emailCond, nameCond], $and: whereCodn };
					userData = await Users.findOne({
						where: cond,
						attributes: {
							exclude: ["createdAt", "updatedAt", "password"]
						}
					});
					if (_.size(userData) > 0) {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.USER_ALREADY_EXISTS
						});
					}
					reqObj.configJson = { notification: true };
					userData = await Users.create(reqObj);
					if (userData) {
						let mailResponse = await utils.sendVerificationEmail(
							userData,
							"signup"
						);
						if (mailResponse) {
							if (userData) {
								let auditObj = {
									userId: userData.id,
									title: "Create User",
									description: "User Created Successfully",
									type: "user"
								};
								await shared.createAudit(auditObj);
							}
							console.log("OTP Sent Success====");
						} else {
							console.log("OTP Sent Failed====");
						}
					}
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

	const getUsers = async (req, res) => {
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
			let productData = [];
			cond["isDeleted"] = 0;
			if (reqObj.userId) {
				cond["id"] = reqObj.userId;
				attributes = "";

				productData = await Products.findAll({
					where: {
						userId: reqObj.userId,
						isBlock: false,
						isDeleted: 0
					},
					include: [{ model: Wishlists }]
				});
			}
			cond["roleName"] = ["customer", "business", "employee"];
			// if (reqObj.roleName) {
			// 	cond["roleName"] = reqObj.roleName;
			// }
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
				attributes: attributes
			};

			if (reqObj.type == "export") {
				attributes = [
					"firstName",
					"userName",
					"email",
					"roleName",
					"mobile",
					"status",
					"address"
				];
				queryObj = {
					where: cond,
					order: [["id", "DESC"]],
					attributes: attributes
				};
			}
			let followersObj = {};
			if (reqObj.type == "profile") {
				queryObj = {
					where: cond,
					offset: offset,
					include: [{ model: UserFollowers }, { model: Products }],
					order: [["id", "DESC"]],
					limit: limit,
					attributes: attributes
				};
				let followCnt = await UserFollowers.count({
					where: { userId: reqObj.userId }
				});
				let followersCnt = await UserFollowers.count({
					where: { toUserId: { $contains: reqObj.userId } }
				});
				followersObj = {
					following: followCnt ? followCnt : 0,
					followers: followersCnt ? followersCnt : 0
				};
			}

			let userData = await Users.findAndCountAll(queryObj);

			if (_.size(userData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			userData.followerData = followersObj;
			userData.productData = productData;
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

	const updateStatus = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.userId) {
				let updateObj = {};
				reqObj.status =
					reqObj.status && reqObj.status == true ? true : false;

				if (reqObj.type == "status") {
					updateObj = {
						status: reqObj.status,
						updatedAt: new Date()
					};
				}
				if (reqObj.type == "block") {
					updateObj = {
						isBlock: reqObj.status,
						updatedAt: new Date()
					};
				}
				if (reqObj.type == "setting") {
					updateObj = {
						configJson: { notification: reqObj.status },
						updatedAt: new Date()
					};
				}

				await Users.update(updateObj, {
					where: { id: reqObj.userId },
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

	const deleteUser = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.userId) {
				await Reports.destroy({
					where: { userId: reqObj.userId }
				});
				await Users.destroy({
					where: { id: reqObj.userId }
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

	const createFollowers = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let type = "Created";
			if (_.size(reqObj) > 0) {
				let followersData = await UserFollowers.findOne({
					where: { userId: reqObj.userId, isDeleted: 0 }
				});
				let followers = [];
				if (followersData) {
					if (!followersData.followersId) {
						followers.push(reqObj.toUserId);
					} else {
						followers = followersData.followersId;
						let alreadyFollowers = _.filter(followers, function(
							value
						) {
							return value == reqObj.toUserId;
						});
						if (alreadyFollowers.length === 0) {
							followers.push(reqObj.toUserId);
						} else {
							followers = _.filter(followers, function(
								removeValue
							) {
								return removeValue != reqObj.toUserId;
							});
						}
					}
					await UserFollowers.update(
						{ followersId: followers },
						{
							where: { id: reqObj["userId"] }
						}
					);
					type = "Updated";
				} else {
					let createObj = {
						userId: reqObj.userId,
						followersId: [reqObj.toUserId]
					};
					await UserFollowers.create(createObj);
					type = "Created";
				}
				if (reqObj.userId) {
					let auditObj = {
						userId: reqObj.userId,
						title: "Create Followers",
						description: "Followers" + type + "Successfully",
						type: "user"
					};
					await shared.createAudit(auditObj);
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

	const resendOtp = async (req, res) => {
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

			/*if (userInput.userName) {
				whereCodn["userName"] = userInput.userName;
			}*/

			let userData = await Users.findOne({
				where: whereCodn
			});

			if (userData) {
				let mailResponse = await utils.sendVerificationEmail(
					userData,
					"signup"
				);
				if (mailResponse) {
					if (userData) {
						let auditObj = {
							userId: userData.id,
							title: "Resend OTP",
							description: "OTP was sent successfully",
							type: "user"
						};
						await shared.createAudit(auditObj);
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

	return {
		create,
		getUsers,
		updateStatus,
		deleteUser,
		createFollowers,
		resendOtp
	};
};

export default UserController();
