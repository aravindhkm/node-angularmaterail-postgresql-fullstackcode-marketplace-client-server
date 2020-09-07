import multer from "multer";
import path from "path";
import fs from "fs";
import { check, body, oneOf, query } from "express-validator";
import sharedCtrl from "../controllers/shared.controller";
import config from "../../config/config";
import express from "express";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const filePath = path.resolve(tmpPath + "uploads/banners");
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
	.get(
		"/list",
		[
			check("type")
				.exists()
				.withMessage("type is required")
		],
		sharedCtrl.list
	)
	.get("/responses", sharedCtrl.responses)

	.post(
		"/createSupport",
		[
			check("userId")
				.exists()
				.withMessage("userId is required"),
			check("type")
				.exists()
				.withMessage("type is required"),
			check("name")
				.exists()
				.withMessage("name is required")
		],
		sharedCtrl.createSupport
	)

	.post(
		"/createBanner",
		upload.fields([
			{
				name: "bannerImage"
			}
		]),
		sharedCtrl.createBanner
	)

	.delete(
		"/deleteBanner",
		[
			query("bannerId")
				.exists()
				.withMessage("bannerId is required")
		],
		sharedCtrl.deleteBanner
	)

	.post(
		"/createReport",
		[
			check("userId")
				.exists()
				.withMessage("userId is required"),
			check("reason")
				.exists()
				.withMessage("reason is required"),
			check("reportType")
				.exists()
				.withMessage("reportType is required")
		],
		sharedCtrl.createReport
	)

	.post(
		"/createNotification",
		[
			check("userId")
				.exists()
				.withMessage("userId is required"),
			check("toUserId")
				.exists()
				.withMessage("type is required"),
			check("title")
				.exists()
				.withMessage("title is required"),
			check("description")
				.exists()
				.withMessage("description is required"),
			check("type")
				.exists()
				.withMessage("type is required")
		],
		sharedCtrl.createNotification
	)

	.post(
		"/createTemplate",
		[
			check("name")
				.exists()
				.withMessage("name is required"),
			check("type")
				.exists()
				.withMessage("type is required"),
			check("templateValue")
				.exists()
				.withMessage("templateValue is required")
		],
		sharedCtrl.createTemplate
	)

	.get("/dashboardReport", sharedCtrl.dashboardReport)

	.post(
		"/updateStatus",
		[
			oneOf([
				check("reportId")
					.exists()
					.withMessage("reportId is required"),
				check("supportId")
					.exists()
					.withMessage("supportId is required"),
				check("settingId")
					.exists()
					.withMessage("settingId is required"),
				check("notifyId")
					.exists()
					.withMessage("notifyId is required"),
				check("userId")
					.exists()
					.withMessage("userId is required")
			])
		],
		sharedCtrl.updateStatus
	);

export default router;
