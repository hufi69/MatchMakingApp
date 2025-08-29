const { Server } = require("socket.io");
const { allowedOrigins } = require("../config");
const User = require("../models/User");

class AppSocketService {
	constructor() {
		this.appSocket = null;
		this.userSocketMap = new Map(); // userId -> Set<socketId>
		this.socketUserMap = new Map(); // socketId -> userId
	}

	start(server) {
		this.appSocket = new Server(server, {
			cors: {
				credentials: true,
				origin: (origin, callback) => {
					if (!origin) return callback(null, true);
					if (allowedOrigins.indexOf(origin) === -1) {
						const msg = "The CORS policy for this site does not allow access from the specified Origin.";
						return callback(new Error(msg), false);
					}
					return callback(null, true);
				},
			},
		});

		this.setupConnectionHandlers();
		console.log("AppSocketService started.");
	}

	setupConnectionHandlers() {
		this.appSocket.use(async (socket, next) => {
			const userId = socket.handshake.auth.userId;
			if (!userId) {
				return next(new Error("User ID not provided"));
			}

			try {
				// Verify user exists and is active
				const user = await User.findById(userId);
				if (!user) {
					return next(new Error("Invalid user"));
				}

				if (!user.isActive) {
					return next(new Error("User account is deactivated"));
				}

				socket.userId = userId;
				next();
			} catch (error) {
				return next(error);
			}
		});

		this.appSocket.on("connection", async (socket) => {
			const userId = socket.userId;

			console.log(`Client connected - Socket ID: ${socket.id}, User ID: ${userId}`);

			// Setup user socket mapping
			if (!this.userSocketMap.has(userId)) {
				this.userSocketMap.set(userId, new Set());
			}
			this.userSocketMap.get(userId).add(socket.id);
			this.socketUserMap.set(socket.id, userId);

			const sockets = await this.appSocket.fetchSockets();
			console.log(
				"----------------------------------------------------------- 🔌🔌🔌 ---------------------------------------------------------------",
				"\n\n",
				"     Total Set of sockets connected to our server: ",
				sockets.length,
				"\n\n",
				"     Active Users: ",
				Array.from(this.userSocketMap.keys()),
				"\n\n",
				"     Active Connections per User: ",
				Array.from(this.userSocketMap.entries()).map(([userId, sockets]) => `${userId}: ${sockets.size} connections`),
				"\n\n----------------------------------------------------------- 🔌🔌🔌 -----------------------------------------------------------",
				"\n\n"
			);

			socket.on("disconnect", () => {
				console.log(`Client disconnected - Socket ID: ${socket.id}, User ID: ${userId}`);

				// Clean up user socket mapping
				const userSockets = this.userSocketMap.get(userId);
				if (userSockets) {
					userSockets.delete(socket.id);
					if (userSockets.size === 0) {
						this.userSocketMap.delete(userId);
					}
				}

				this.socketUserMap.delete(socket.id);
			});
		});
	}

	// Send message to a specific user
	sendMessageToUser(userId, event, message) {
		const socketIds = this.userSocketMap.get(userId);
		if (socketIds && socketIds.size > 0) {
			socketIds.forEach((socketId) => {
				this.appSocket.to(socketId).emit(event, message);
			});
		} else {
			console.log(`User ${userId} not connected`);
			console.log("Connected Users: ", this.getConnectedUsersStatus());
		}
	}

	// Send user status update notification
	notifyUserStatusUpdate(userId, status, message) {
		this.sendMessageToUser(userId, "user_status_update", {
			status,
			message,
			timestamp: new Date().toISOString()
		});
	}

	// Force logout a user from all devices
	forceLogoutUser(userId) {
		console.log(`Force logging out user ${userId} from all devices`);
		this.sendMessageToUser(userId, "force_logout", {
			message: "You have been logged out from all devices",
			reason: "admin_action"
		});
	}

	// Block a user (disable their account and force logout)
	async blockUser(userId) {
		try {
			// Update user status in database
			await User.findByIdAndUpdate(userId, { isActive: false });
			
			// Force logout from all devices
			this.forceLogoutUser(userId);
			
			console.log(`User ${userId} has been blocked and logged out from all devices`);
		} catch (error) {
			console.error(`Error blocking user ${userId}:`, error);
		}
	}

	// Unblock a user (enable their account)
	async unblockUser(userId) {
		try {
			// Update user status in database
			await User.findByIdAndUpdate(userId, { isActive: true });
			
			console.log(`User ${userId} has been unblocked`);
		} catch (error) {
			console.error(`Error unblocking user ${userId}:`, error);
		}
	}

	// Get user connection count
	getUserConnectionCount(userId) {
		const sockets = this.userSocketMap.get(userId);
		return sockets ? sockets.size : 0;
	}

	// Get socket IDs for a user
	getSocketIdsForUser(userId) {
		const sockets = this.userSocketMap.get(userId);
		return sockets ? Array.from(sockets) : [];
	}

	// Check if a user is connected
	isUserConnected(userId) {
		const sockets = this.userSocketMap.get(userId);
		return sockets ? sockets.size > 0 : false;
	}

	// Get connected users status
	getConnectedUsersStatus() {
		const status = {};
		for (const [userId, sockets] of this.userSocketMap.entries()) {
			status[userId] = {
				connectionCount: sockets.size,
				socketIds: Array.from(sockets),
			};
		}
		return status;
	}

	// Broadcast to all connected clients
	broadcast(event, message) {
		this.appSocket.emit(event, message);
	}

	// Get all connected clients
	async getAllClients() {
		const clients = await this.appSocket.fetchSockets();
		return clients.map((socket) => ({
			socketId: socket.id,
			userId: this.socketUserMap.get(socket.id),
		}));
	}
}

module.exports = AppSocketService;
