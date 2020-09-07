import express from "express";
import { check, oneOf } from "express-validator";
import authCtrl from "../controllers/auth.controller";

const router = express.Router();
const errorMessage =
	"Either any one of 'userName or email or Mobile is required";

// import passportFacebook from "../services/auth/facebook";
// import passportGoogle from "../services/auth/google";

router
	.post(
		"/login",
		[
			check("password")
				.exists()
				.withMessage("password is required"),
			check("type")
				.exists()
				.withMessage("type is required"),
			oneOf([
				check("userName")
					.exists()
					.withMessage(errorMessage),
				check("email")
					.exists()
					.withMessage(errorMessage)
			])
		],
		authCtrl.login
	)

	.post(
		"/forgotPassword",
		[
			check("email")
				.exists()
				.withMessage("Email is required")
		],
		authCtrl.forgotPassword
	)

	.post(
		"/resetPassword",
		[
			check("email")
				.exists()
				.withMessage("Email is required"),
			check("password")
				.exists()
				.withMessage("OTP is required")
		],
		authCtrl.resetPassword
	)
	.post(
		"/verifyOtp",
		[
			check("email")
				.exists()
				.withMessage("Email is required"),
			check("otp")
				.exists()
				.withMessage("OTP is required"),
			check("type")
				.exists()
				.withMessage("type is required")
		],
		authCtrl.verifyOtp
	)

	.post(
		"/socialLogin",
		[
			check("provider")
				.exists()
				.withMessage("provider is required"),
			check("id")
				.exists()
				.withMessage("id is required"),
			check("name")
				.exists()
				.withMessage("name is required"),
			check("displayName")
				.exists()
				.withMessage("displayName is required"),
			check("username")
				.exists()
				.withMessage("username is required"),
			oneOf([
				check("mobile")
					.exists()
					.withMessage("mobile is required"),
				check("email")
					.exists()
					.withMessage("email is required")
			])
		],
		authCtrl.socialLogin
	);

/*.get(
		"/google",
		passportGoogle.authenticate("google", { scope: ["email", "profile"] })
	)
	.get(
		"/google/callback",
		passportGoogle.authenticate("google", { failureRedirect: "/" }),
		authCtrl.socialCallback
	)

	.get("/facebook", passportFacebook.authenticate("facebook"))
	.get(
		"/facebook/callback",
		passportFacebook.authenticate("facebook", { failureRedirect: "/" }),
		authCtrl.socialCallback
	)*/

export default router;
