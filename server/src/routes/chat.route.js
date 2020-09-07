import multer from "multer";
import path from "path";
import fs from "fs";
import { check, body, oneOf, query } from "express-validator";
import chatCtrl from "../controllers/chat.controller";
import config from "../../config/config";
import express from "express";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const filePath = path.resolve(tmpPath + "uploads");
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
		[
			check("userId")
				.exists()
				.withMessage("senderId is required"),
			check("productId")
				.exists()
				.withMessage("productId is required"),
			check("members")
				.exists()
				.withMessage("receiverId is required")
		],
		chatCtrl.create
	)

	.get("/list", chatCtrl.getChats)

	.get("/getChannels", chatCtrl.getChannels)

	.post(
		"/updateStatus",
		[
			check("offerId")
				.exists()
				.withMessage("offerId is required"),
			check("chatId")
				.exists()
				.withMessage("chatId is required"),
			check("status")
				.exists()
				.withMessage("status is required")
		],
		chatCtrl.updateStatus
	);

export default router;
