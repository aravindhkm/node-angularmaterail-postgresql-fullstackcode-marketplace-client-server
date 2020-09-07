import express from "express";
import moment from "moment";
import _ from "lodash";
import authService from "../services/auth.service";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import productRoutes from "./product.route";
import categoryRoutes from "./category.route";
import chatRoutes from "./chat.route";
import sharedRoutes from "./shared.route";

const router = express.Router(); // eslint-disable-line new-cap

import svgCaptcha from "svg-captcha";

/**
 * @param token
 */
function _validateToken(token) {
	console.log("_validateToken", token);

	return new Promise(async (resolve, reject) => {
		const decoded = await authService.decode(token);
		const currentTime = moment().unix();
		if (decoded && currentTime < decoded.exp) {
			resolve({
				status: "true",
				msg: "Successful Authorization!",
				decoded
			});
		} else {
			console.log("TOKEN EXPIREDDDDD");
			reject({ status: false, msg: "Invalid Token" });
		}
	});
}

/** GET /health-check - Check service health */
router.get("/health-check", (req, res) => res.send("OK!!!"));

router.get("/captcha", function(req, res) {
	// var captcha = svgCaptcha.createMathExpr({
	// 	mathMin: 1,
	// 	mathMax: 9,
	// 	mathOperator: "+"
	// });
	var captcha = svgCaptcha.create();
	// req.session.captcha = captcha.text;

	console.log("captcha", captcha);
	res.type("svg");
	res.status(200).send(captcha.data);
});

router.use((req, res, next) => {
	console.log("req.url");
	console.log(req.url);
	const allowedUrls = [
		"/users/create",
		"/users/resendOtp",
		"/auth/login",
		"/auth/socialLogin",
		"/auth/verifyOtp",
		"/auth/resetPassword",
		"/auth/forgotPassword"
	];

	if (
		req.method !== "OPTIONS" &&
		!_.includes(allowedUrls, req.url.split("?")[0])
	) {
		const token =
			req.headers["Authorization"] || req.headers["authorization"];
		_validateToken(token).then(
			res => {
				console.log("_validateToken", res);
				next();
			},
			err => {
				res.status(403).send({
					status: "false",
					msg: "Failed to authenticate user - USER",
					err
				});
			}
		);
	} else {
		next();
	}
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/chats", chatRoutes);
router.use("/shared", sharedRoutes);

export default router;
