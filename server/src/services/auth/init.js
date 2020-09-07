import passport from "passport";


module.exports = function () {

	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (obj, done) {
		done(null, obj);
		// User.findById(id, function (err, user) {
		// 	done(err, user);
		// });
	});

};
