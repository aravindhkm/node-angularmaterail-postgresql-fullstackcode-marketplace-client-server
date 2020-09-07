import multer from "multer";
import path from "path";
import fs from "fs";
import { check, body, oneOf, query } from "express-validator";
import productCtrl from "../controllers/product.controller";
import config from "../../config/config";
import express from "express";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		var filePath = path.resolve(tmpPath + "uploads");
		if (file.fieldname === "productImage") {
			filePath = filePath + "/products/images";
		}
		if (file.fieldname === "productVideo") {
			filePath = filePath + "/products/videos";
		}
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
				name: "productImage"
			},
			{
				name: "productVideo"
			}
		]),
		productCtrl.create
	)

	.post(
		"/createFavourite",
		[
			check("userId")
				.exists()
				.withMessage("userId is required"),
			check("productId")
				.exists()
				.withMessage("productId is required"),
			check("type")
				.exists()
				.withMessage("type is required")
		],
		productCtrl.createFavourite
	)

	.get("/list", productCtrl.getProducts)

	.get(
		"/getFavourites",
		[
			check("userId")
				.exists()
				.withMessage("userId is required")
		],
		productCtrl.getFavourites
	)

	.post(
		"/updateStatus",
		[
			check("productId")
				.exists()
				.withMessage("productId is required")
		],
		productCtrl.updateStatus
	)

	.delete(
		"/deleteProduct",
		[
			query("productId")
				.exists()
				.withMessage("productId is required")
		],
		productCtrl.deleteProduct
	);

export default router;
