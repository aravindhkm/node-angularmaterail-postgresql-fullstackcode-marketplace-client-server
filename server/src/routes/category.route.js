import multer from "multer";
import path from "path";
import fs from "fs";
import { check, body, oneOf, query } from "express-validator";
import categoryCtrl from "../controllers/category.controller";
import config from "../../config/config";
import express from "express";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const filePath = path.resolve(tmpPath + "uploads/categories");
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		console.log(filePath, fs.existsSync(filePath));
		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath, { recursive: true });
		}
		callback(null, filePath);
	},
	filename(req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage });

router
	.post(
		"/create",

		upload.fields([
			{
				name: "categoryImage"
			}
		]),
		categoryCtrl.create
	)

	.get("/list", categoryCtrl.getCategories)

	.get("/getCategories", categoryCtrl.getCategoryWithCount)

	.delete(
		"/deleteCategory",
		[
			query("categoryId")
				.exists()
				.withMessage("categoryId is required")
		],
		categoryCtrl.deleteCategory
	);

export default router;
