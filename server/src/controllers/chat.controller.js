import { validationResult, check } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import moment from "moment";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
import shared from "./shared.controller";
const { Channels, Chats, ChannelMembers, ProductOffers, Users, Products } = db;
const Op = db.Sequelize.Op;

const ChatController = () => {
	const create = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			console.log("reqObjreqObjreqObj", reqObj);

			if (_.size(reqObj) > 0) {
				let createObj = {
					userId: reqObj.userId,
					productId: reqObj.productId,
					name: reqObj.name,
					channelType: "single"
				};
				await Channels.create(createObj)
					.then(async response => {
						if (response && response.id) {
							let memberArray = [];
							if (reqObj.members && reqObj.members.length > 0) {
								reqObj.members.forEach(value => {
									let memberObj = {
										channelId: response.id,
										userId: value,
										isAdmin:
											reqObj.userId &&
											reqObj.userId == value
												? true
												: false
									};
									memberArray.push(memberObj);
								});
								await ChannelMembers.bulkCreate(memberArray);
							}
							if (reqObj.userId) {
								let auditObj = {
									userId: reqObj.userId,
									title: "Create Channel",
									description: "Channel Created Successfully",
									type: "chat"
								};
								await shared.createAudit(auditObj);
							}
							return res.status(httpStatus.OK).json({
								status: true,
								message: label.LABEL_SUCCESS,
								data: response
							});
						}
					})
					.catch(err => {
						console.log(err);
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.SOMETHING_WRONG
						});
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

	const createChat = async chatObj => {
		try {
			console.log("chatObjchatObjchatObj", chatObj);

			if (!chatObj.channelId && !chatObj.userId && !chatObj.toUserId) {
				throw {
					status: false,
					message: "Please provide channelId or userId or toUserId"
				};
			}
			let createObj = {
				userId: chatObj.userId,
				channelId: chatObj.channelId,
				toUserId: chatObj.toUserId,
				chatType: chatObj.chatType ? chatObj.chatType : "chat",
				message: chatObj.message ? chatObj.message : null
			};

			// Get response time
			let createdData = await Chats.findOne({
				where: {
					userId: chatObj.userId, //3
					channelId: chatObj.channelId,
					toUserId: chatObj.toUserId //40
				},
				order: [["createdAt", "ASC"]],
				limit: 1,
				raw: true
			});
			console.log(createdData, "createdData=====");
			if (_.size(createdData) <= 0) {
				let data = await Chats.findOne({
					where: {
						userId: chatObj.toUserId, //3
						channelId: chatObj.channelId,
						toUserId: chatObj.userId //40
					},
					order: [["createdAt", "ASC"]],
					limit: 1,
					raw: true
				});
				console.log(data, "data=====");
				if (_.size(data) > 0) {
					let diffDate = data.createdAt
						? moment(data.createdAt)
						: null;
					if (diffDate) {
						let duration = moment.duration(moment().diff(diffDate));
						createObj.responseTime = duration.asMinutes()
							? duration.asMinutes()
							: 0;
						console.log(
							createObj.responseTime,
							"createObj.responseTime====="
						);
					}
				}
			}
			// end
			createdData = await Chats.create(createObj);
			if (chatObj.chatType == "offer" && createdData && createdData.id) {
				let offerObj = {
					userId: chatObj.userId,
					channelId: chatObj.channelId,
					productId: chatObj.productId,
					chatId: createdData.id,
					toUserId: chatObj.toUserId,
					quantity: chatObj.quantity ? chatObj.quantity : null,
					unitPrice: chatObj.unitPrice ? chatObj.unitPrice : 0,
					totalPrice: chatObj.totalPrice ? chatObj.totalPrice : 0
				};
				await ProductOffers.create(offerObj)
					.then(async response => {
						if (response && response.id) {
							let updateObj = {
								offerId: response.id,
								updatedAt: new Date()
							};
							await Chats.update(updateObj, {
								where: { id: createdData.id }
							});
						}
					})
					.catch(err => {
						console.log(err);
					});
			}
			if (chatObj.toUserId) {
				let userDetails = await Users.findOne({
					where: { id: chatObj.userId }
				});
				let notifyObj = {
					title:
						userDetails && userDetails.userName
							? userDetails.userName + " messaged to you"
							: "Chat Notification",
					message: chatObj.message ? chatObj.message : null,
					type: "chat",
					userId: chatObj.userId ? chatObj.userId : null,
					channelId: chatObj.channelId ? chatObj.channelId : null,
					toUserId: chatObj.toUserId ? chatObj.toUserId : null,
					productId: chatObj.productId ? chatObj.productId : null
				};
				await shared.sendPushNotification(notifyObj, chatObj.toUserId);
			}

			if (chatObj.userId) {
				let auditObj = {
					userId: chatObj.userId,
					title: "Chatter",
					description:
						"This" +
						chatObj.userId +
						"Discussed about this Product" +
						chatObj.productId,
					type: "chat"
				};
				await shared.createAudit(auditObj);
			}

			return await _getChatById(createdData.id);
		} catch (err) {
			console.log("err-", err);
		}
	};

	const getChannels = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let cond = {};
			cond["isDeleted"] = 0;
			if (reqObj["searchTxt"]) {
				cond[Op.or] = [
					{
						firstName: {
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
			// const page = reqObj.page ? reqObj.page : 1;
			// const limit = reqObj.limit ? reqObj.limit : 10;
			// const offset = (page - 1) * limit;
			// let attributes = {
			// 	exclude: ["createdAt", "updatedAt"]
			// };
			let channelData = await Channels.findAndCountAll({
				where: { isDeleted: 0 },
				include: [{ model: Users, where: cond }]
				// offset: offset,
				// limit: limit,
				// attributes: attributes
			});

			if (_.size(channelData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}

			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: channelData
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

	const getChats = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let cond = {};
			cond["isDeleted"] = 0;
			if (reqObj.channelId) {
				cond["channelId"] = reqObj.channelId;
			}
			const page = reqObj.page ? reqObj.page : 1;
			const limit = reqObj.limit ? reqObj.limit : 10;
			const offset = (page - 1) * limit;

			let chatData = await Chats.findAll({
				where: cond,
				// offset: offset,
				// limit: limit,
				order: [["createdAt", "DESC"]]
			});
			let membersData;
			if (reqObj.channelId) {
				membersData = await ChannelMembers.findOne({
					where: { channelId: reqObj.channelId, isAdmin: false }
				});
			}
			if (_.size(chatData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			let offerData = await ProductOffers.findAll({
				where: cond,
				include: [{ model: Products }]
				// offset: offset,
				// limit: limit,
			});
			let userData = await Users.findAll({
				where: { status: true, isDeleted: 0 }
			});

			let chatDatas = {
				chatData: chatData ? chatData : [],
				offerData: offerData ? offerData : [],
				userData: userData ? userData : [],
				memberData: membersData ? membersData : []
			};

			// console.log(JSON.stringify(chatData), "chatData========");
			// chatData.offerData = offerData;
			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: chatDatas
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

	const updateStatus = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.offerId) {
				reqObj.status =
					reqObj.status && reqObj.status == "accept"
						? "Accepted"
						: "Declined";

				let updateObj = {
					status: reqObj.status,
					updatedAt: new Date()
				};

				await ProductOffers.update(updateObj, {
					where: { id: reqObj.offerId }
				});

				let chatData = await _getChatById(reqObj.chatId);
				if (chatData && chatData.chatData) {
					if (chatData.chatData.userId) {
						let auditObj = {
							userId: chatData.chatData.userId,
							title: "Chatter",
							description: "This Offer is" + reqObj.status,
							type: "chat"
						};
						await shared.createAudit(auditObj);
					}
					if (chatData && chatData.offerData) {
						let userDetails = await Users.findOne({
							where: { id: chatData.offerData.toUserId }
						});
						let notifyObj = {
							title:
								userDetails && userDetails.userName
									? userDetails.userName +
									  " response the offer request"
									: "Offer Notification",
							message: reqObj.status,
							type: "chat",
							userId: chatData.offerData.toUserId
								? chatData.offerData.toUserId
								: null,
							channelId: chatData.offerData.channelId
								? chatData.offerData.channelId
								: null,
							toUserId: chatData.offerData.userId
								? chatData.offerData.userId
								: null,
							productId: chatData.offerData.productId
								? chatData.offerData.productId
								: null
						};
						await shared.sendPushNotification(
							notifyObj,
							chatData.offerData.userId
						);
					}
				}

				return res.status(httpStatus.OK).json({
					status: true,
					message: label.UPDATE_SUCCESS,
					data: chatData
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

	const _getChatById = async chatId => {
		let chatData = await Chats.findOne({
			where: { id: chatId, isDeleted: 0 }
		});
		let offerData = await ProductOffers.findOne({
			where: { chatId: chatId, isDeleted: 0 }
		});
		let userData = await Users.findAll({
			where: { status: true, isDeleted: 0 }
		});
		let chatDatas = {
			chatData: chatData ? chatData : [],
			offerData: offerData ? offerData : [],
			userData: userData ? userData : []
		};
		return chatDatas;
	};
	return {
		create,
		createChat,
		getChannels,
		getChats,
		updateStatus
	};
};

export default ChatController();
