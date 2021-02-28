var NodeHelper = require("node_helper");
var fetch = require("digest-fetch");

module.exports = NodeHelper.create({
	start: function () {
		console.log("TvheadendDVR helper started; waiting for module...");
	},

	socketNotificationReceived: function (notification, data) {
		if (notification === "MMM-TVHEADENDDVR_GET_RECORDINGS") {
			this.getRecordings(data.url, data.username, data.password, data.basicAuth);
		}
	},

	getRecordings(url, username, password, basicAuth) {
		let recordings = {};
		const tvhServer = new fetch(username, password, { algorithm: "MD5", basic: basicAuth });

		tvhServer.fetch(url)
			.then(data => data.json())
			.then(data => {
				recordings = data.entries
					// Sort based on start time
					.sort((a, b) => a.start - b.start);

				this.sendSocketNotification("MMM-TVHEADENDDVR_RECORDINGS", recordings);
			})
			.catch(error => {
				console.log(error);
			});
	},
});
