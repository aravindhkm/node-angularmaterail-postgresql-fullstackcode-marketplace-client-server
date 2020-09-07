import { validationResult, check } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";

const { Categories, Products } = db;
const Op = db.Sequelize.Op;

const CategoryController = () => {
	const create = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const catObj = utils.getReqValues(req);
			console.log("reqObjreqObjreqObj", catObj);
			const reqObj = catObj.categoryData
				? JSON.parse(catObj.categoryData)
				: [];

			let catData = [];
			let whereCodn = {};
			whereCodn["isDeleted"] = 0;

			if (reqObj.name) {
				whereCodn["name"] = reqObj.name;
			}
			if (req.files && req.files.categoryImage) {
				let imageDatas = _.map(req.files.categoryImage, "filename");
				reqObj.imageName =
					imageDatas && imageDatas[0] ? imageDatas[0] : null;
			}
			if (_.size(reqObj) > 0) {
				if (reqObj.categoryId) {
					await Categories.update(reqObj, {
						where: { id: reqObj["categoryId"] }
					});
				} else {
					catData = await Categories.findOne({
						where: whereCodn,
						attributes: {
							exclude: ["createdAt", "updatedAt"]
						}
					});
					if (_.size(catData) > 0) {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.CATEGORY_ALREADY_EXISTS
						});
					}

					catData = await Categories.create(reqObj);
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
				.json({ status: false, message: label.SOMETHING_WRONG });
		}
	};

	const getCategories = async (req, res) => {
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

			if (reqObj.categoryId) {
				cond["id"] = reqObj.categoryId;
			}
			if (reqObj["searchTxt"]) {
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
					}
				];
			}
			const page = reqObj.page ? reqObj.page : 1;
			const limit = reqObj.limit ? reqObj.limit : 10;
			const offset = (page - 1) * limit;

			let catData = await Categories.findAndCountAll({
				where: cond,
				offset: offset,
				limit: limit,
				attributes: attributes,
				order: [["id", "DESC"]]
			});

			if (_.size(catData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: catData
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

	const deleteCategory = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.categoryId) {
				let updateObj = { isDeleted: 1, updatedAt: new Date() };
				await Categories.update(updateObj, {
					where: { id: reqObj.categoryId }
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

	const getCategoryWithCount = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			cond["isDeleted"] = 0;
			let attributes = {
				exclude: ["createdAt", "updatedAt"]
			};
			if (reqObj["searchTxt"]) {
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
					}
				];
			}
			let catData = await Categories.findAll({
				where: cond,
				attributes: attributes
			});
			let productCount = await Products.findAll({
				where: { isDeleted: 0, isBlock: false },
				required: false,
				attributes: [
					"categoryId",
					[
						db.sequelize.fn(
							"COUNT",
							db.sequelize.col("Products.categoryId")
						),
						"productCount"
					]
				],
				group: ["Products.categoryId"]
			});
			if (_.size(catData) <= 0) {
				return res.status(httpStatus.OK).json({
					status: true,
					message: label.NO_DATA
				});
			}
			let categoryData = [];
			catData.forEach(async (element, index) => {
				let cateObj = {};
				let countData = _.filter(productCount, [
					"categoryId",
					element.id
				]);

				let countValue =
					countData &&
					countData[0] &&
					countData[0].dataValues &&
					countData[0].dataValues.productCount
						? countData[0].dataValues.productCount
						: 0;

				cateObj = {
					id: element.id,
					name: element.name,
					description: element.description,
					imageName: element.imageName,
					productCount: countValue,
					isDeleted: element.isDeleted
				};
				categoryData.push(cateObj);
			});
			return res.status(httpStatus.OK).json({
				status: true,
				message: label.LABEL_SUCCESS,
				data: categoryData
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
		create,
		getCategories,
		deleteCategory,
		getCategoryWithCount
	};
};

export default CategoryController();
