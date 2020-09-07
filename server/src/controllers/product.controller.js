import { validationResult, check } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
import shared from "./shared.controller";

const { Products, Wishlists, Categories, Reports } = db;
const Op = db.Sequelize.Op;

const ProductController = () => {
	const create = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const productObj = utils.getReqValues(req);
			console.log("reqObjreqObjreqObj", productObj);
			const reqObj = productObj.productData
				? JSON.parse(productObj.productData)
				: [];

			if (req.files && req.files.productImage) {
				let imageDatas = _.map(req.files.productImage, "filename");
				reqObj.imageName =
					imageDatas && imageDatas[0] ? imageDatas[0] : null;
			}
			if (req.files && req.files.productVideo) {
				let videoDatas = _.map(req.files.productVideo, "filename");
				reqObj.videoName =
					videoDatas && videoDatas[0] ? videoDatas[0] : null;
			}
			if (_.size(reqObj) > 0) {
				if (reqObj.productId) {
					await Products.update(reqObj, {
						where: { id: reqObj["productId"] }
					});
				} else {
					await Products.create(reqObj);
					if (reqObj.userId) {
						let auditObj = {
							userId: reqObj.userId,
							title: "Create Product",
							description: "Product Created Successfully",
							type: "product"
						};
						shared.createAudit(auditObj);
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

	const getProducts = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let favCond = {};
			cond["isDeleted"] = 0;
			cond["status"] = "instock";
			if (reqObj.type == "all") {
				cond["isBlock"] = [false, true];
			} else {
				cond["isBlock"] = false;
			}
			if (reqObj.userId) {
				favCond["userId"] = reqObj.userId;
			}
			if (reqObj.userId && reqObj.type == "profile") {
				cond["userId"] = reqObj.userId;
			}
			// if (reqObj.userId && reqObj.type == "list") {
			// 	cond["userId"] = { $ne: reqObj.userId };
			// }

			if (reqObj.productId) {
				cond["id"] = reqObj.productId;
			}
			if (reqObj.categoryId) {
				cond["categoryId"] = reqObj.categoryId;
			}

			let orderBy = [
				["price", "ASC"],
				["id", "DESC"]
			];
			if (reqObj.userId && reqObj.type == "new") {
				let reportData = await Reports.findAll({
					where: { userId: reqObj.userId, status: "block" },
					raw: true
				});

				if (reportData && reportData.length > 0) {
					let productIds = [];
					reportData.forEach(value => {
						if (value && value.productId) {
							productIds.push(value.productId);
						}
					});
					cond["id"] = { $ne: productIds };
				}
				cond["userId"] = { $ne: reqObj.userId };
				orderBy = [["createdAt", "DESC"]];
			}

			if (reqObj.filterValue == "high") {
				orderBy = [["price", "DESC"]];
			}
			let attributes = "";
			let page = reqObj.page ? reqObj.page : 1;
			let limit = reqObj.limit ? reqObj.limit : 10;
			let offset = (page - 1) * limit;

			if (reqObj["searchTxt"]) {
				cond[Op.or] = [
					{
						productName: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						description: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					}
				];
			}
			let queryObj = {
				where: cond,
				include: [
					{ model: Wishlists, where: favCond, required: false }
				],
				offset: offset,
				limit: limit,
				order: orderBy,
				attributes: attributes,
				order: [["id", "DESC"]]
			};
			if (reqObj.type == "export") {
				attributes = [
					"productName",
					"location",
					"description",
					"quantity",
					"price",
					"status",
					"propertyJson",
					"isBlock"
				];
				queryObj = {
					where: cond,
					order: orderBy,
					attributes: attributes,
					order: [["id", "DESC"]]
				};
			}

			let productData = await Products.findAndCountAll(queryObj);

			if (_.size(productData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			let categoryData = await Categories.findAll({
				where: { isDeleted: 0 }
			});
			productData.categoryData = categoryData ? categoryData : [];
			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: productData
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
			if (reqObj.productId) {
				let cond = {};
				cond["updatedAt"] = new Date();
				if (reqObj.type == "sold") {
					cond["status"] = "sold";
				} else {
					cond["isBlock"] =
						reqObj.isBlock && reqObj.isBlock == true ? true : false;
				}
				// reqObj.isBlock =
				// 	reqObj.isBlock && reqObj.isBlock == true ? true : false;
				await Products.update(cond, {
					where: { id: reqObj.productId },
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
						return res.status(httpStatus.BAD_REQUEST).json(err);
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

	const deleteProduct = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.productId) {
				let updateObj = { isDeleted: 1, updatedAt: new Date() };
				await Products.update(updateObj, {
					where: { id: reqObj.productId }
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

	const getFavourites = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let attributes = {
				exclude: ["createdAt", "updatedAt"]
			};
			cond["isDeleted"] = 0;
			if (reqObj.userId) {
				cond["userId"] = reqObj.userId;
			}

			const page = reqObj.page ? reqObj.page : 1;
			const limit = reqObj.limit ? reqObj.limit : 10;
			const offset = (page - 1) * limit;

			let productData = await Products.findAndCountAll({
				where: { isDeleted: 0, status: "instock" },
				include: [{ model: Wishlists, where: cond }],
				offset: offset,
				limit: limit,
				attributes: attributes
			});

			if (_.size(productData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			let countData = await Wishlists.count({
				where: cond
			});
			productData.count = countData;
			if (reqObj.userId) {
				let auditObj = {
					userId: reqObj.userId,
					title: "Get Favourites",
					description: "Favourites Product Listed Successfully",
					type: "favourite"
				};
				shared.createAudit(auditObj);
			}
			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: productData
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

	const createFavourite = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (_.size(reqObj) > 0) {
				if (reqObj.type == "remove") {
					await Wishlists.destroy({
						where: { productId: reqObj["productId"] }
					});
				} else {
					await Wishlists.create(reqObj);
				}
				if (reqObj.userId) {
					let auditObj = {
						userId: reqObj.userId,
						title: "Create Favourite",
						description: "Create Favourite Product Successfully",
						type: reqObj.type + "favourite"
					};
					shared.createAudit(auditObj);
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

	return {
		create,
		getProducts,
		updateStatus,
		deleteProduct,
		getFavourites,
		createFavourite
	};
};

export default ProductController();
