module.exports = {
	apps: [
		{
			name: "aesthira-server",
			script: "./app.js",
			instances: "1",
			exec_mode: "cluster",
			watch: true,
			watch_delay: 1000,
			ignore_watch: ["node_modules", "public"],
			env: {
				PORT: "8000",
				NODE_ENV: "production",
			},
		},
	],
};