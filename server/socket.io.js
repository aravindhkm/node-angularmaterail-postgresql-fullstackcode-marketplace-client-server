import express from "express";
import socketio from "socket.io";
import _ from "lodash";
import chatCtrl from "./src/controllers/chat.controller";
import config from "./config/config";
import db from "./config/sequelize";
const { Notifications } = db;
const app = express();

var server = require("http").createServer(app);

const io = socketio({
	serveClient: false
});

io.attach(server, {
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
});

app.get("/health-check", (req, res) => res.send("OK!!!"));

io.use(function(socket, next) {
	let userID = socket.request._query["userId"];
	let userSocketId = socket.id;
	const data = {
		id: userID,
		value: {
			$set: {
				socketId: userSocketId,
				online: "Y"
			}
		}
	};

	next();
	console.log("userSocketId-->", userSocketId, userID);
});

io.on("connection", socket => {
	console.log("socketsocket", socket.id);

	socket.on("TYPING", data => {
		let typing_socket = `TYPING_DISPLAY_${data.userName}`;
		if (data.typing === true) io.emit(typing_socket, data);
		else io.emit(typing_socket, data);
	});

	socket.on("NOTIFICATION", async (mes, callback) => {
		let countData = await Notifications.count({
			where: { status: "unread", isDeleted: 0 }
		});
		console.log(countData, "countData=========");
		io.emit("NOTIFICATION_COUNT", { countValue: countData });
	});

	socket.on("CHANNEL_CHAT", async (mes, callback) => {
		console.log("mesmesmes", mes);
		let chatData;
		let chat_socket;

		chatData = await chatCtrl.createChat(mes);
		console.log(chatData.chatData, "chatData=========");
		chat_socket = `CHATS_${chatData.chatData.channelId}`;

		console.log("chatData", chat_socket, chatData);

		io.emit(chat_socket, chatData);
		//Push Notification send
		// if (chatData.channelId) {
		// 	await chatCtrl.pushNotification(mes);
		// }
	});
	socket.on("disconnect", reason => {
		console.log("REASON", reason, socket.id);
	});
});

server.listen(config.socketPort, () => {
	console.log("Socket Server listening at port %d", config.socketPort);
});
