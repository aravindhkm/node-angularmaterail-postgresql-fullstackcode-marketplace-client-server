import multer from "multer";
import path from "path";
import fs from "fs";
import { check, body, oneOf, query } from "express-validator";
import userCtrl from "../controllers/user.controller";
import config from "../../config/config";
import express from "express";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const filePath = path.resolve(tmpPath + "uploads/users");
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
				name: "profileImage"
			}
		]),
		userCtrl.create
	)
	.get("/list", userCtrl.getUsers)

	.post(
		"/updateStatus",
		[
			check("userId")
				.exists()
				.withMessage("userId is required")
		],
		userCtrl.updateStatus
	)

	.post(
		"/createFollowers",
		[
			check("userId")
				.exists()
				.withMessage("userId is required"),
			check("toUserId")
				.exists()
				.withMessage("toUserId is required")
		],
		userCtrl.createFollowers
	)

	.delete(
		"/deleteUser",
		[
			query("userId")
				.exists()
				.withMessage("userId is required")
		],
		userCtrl.deleteUser
	)

	.post(
		"/resendOtp",
		[
			check("email")
				.exists()
				.withMessage("Email is required")
		],
		userCtrl.resendOtp
	);

export default router;
