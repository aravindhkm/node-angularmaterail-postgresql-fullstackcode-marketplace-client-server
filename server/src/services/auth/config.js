var ids = {
	github: {
		clientID: "c58262eec6e65efbfbe0",
		clientSecret: "3ee1abf1d6e92e35591c783b7df99db685d8c614",
		callbackURL: "http://localhost:3000/auth/github/callback"
	},
	linkedin: {
		clientID: "861bkj69q737by",
		clientSecret: "oz8QJvnDHjtZvq5d",
		callbackURL: "http://localhost:3000/auth/linkedin/callback"
	},
	google: {
		clientID:
			"519451847473-hp4r44gg771bg2vgj5rglkjng7iicek1.apps.googleusercontent.com",

		clientSecret: "cS2Ol7-WDlt8HwQOP6r75Y2B",
		// clientID:
		// 	"98132034019-qsse18drnb45kua3h15f95e9ptvjemf5.apps.googleusercontent.com",

		// clientSecret: "ZvgJF37OmPYuSQahePwPBQ2H",
		callbackURL: "http://localhost:3000/auth/google/callback"
	},
	twitter: {
		clientID: "P9Xt02Z4MC647KO62PsVw",
		clientSecret: "r5JjlXqsVih48bSsKKQQFn0m7MbfhUyKaVCgNQp1cw",
		callbackURL: "http://localhost:3000/auth/twitter/callback"
	},
	facebook: {
		clientID: "1215239902154723",
		clientSecret: "9c2633e637549c51759dabdc043d3fa3",
		callbackURL: "http://localhost:3000/auth/facebook/callback"
	}
};

module.exports = ids;
