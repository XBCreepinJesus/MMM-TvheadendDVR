Module.register("MMM-TvheadendDVR", {
	defaults: {
		server: null,
		username: null,
		password: null,
		basicAuth: false,

		// Update interval
		updateInterval: 5 * 60 * 1000, // 5 minutes
		loadDelay: 0,

		templateName: "default",

		// Use in templates to limit size of list
		maxRecordings: 5,

		// Time formats used by Moment.js
		timeFormats: {
			now: "[Finishes at] LT",
			today: "[Today at] LT",
			tomorrow: "[Tomorrow at] LT",
			thisWeek: "dddd [at] LT",
			nextWeekOn: "MMM DD [at] LT"
		},
	},

	// DVR entry storage
	recordings: null,

	// Load stylesheets
	getStyles: function () {
		return ["font-awesome.css", this.file("templates/" + this.config.templateName + ".css")];
	},

	// Load scripts
	getScripts: function () {
		return ["moment.js"];
	},

	start: function () {
		// Add template filters
		this.addFilters();

		// Schedule first update (after loadDelay)
		setTimeout(() => {
			this.getRecordings();
		}, this.config.loadDelay);
	},

	getRecordings() {
		// Send notification and config to node helper
		this.sendSocketNotification("MMM-TVHEADENDDVR_GET_RECORDINGS",
			{
				url: this.getUrl(),
				username: this.config.username,
				password: this.config.password,
				basicAuth: this.config.basicAuth,
			}
		);

		// Schedule next update
		setTimeout(() => {
			this.getRecordings();
		}, this.config.updateInterval);
	},

	socketNotificationReceived: function (notification, data) {
		// Update display on receiving list of recordings
		if (notification === "MMM-TVHEADENDDVR_RECORDINGS") {
			this.recordings = data;

			// Refresh module display
			this.updateDom();
		};
	},

	notificationReceived: function (notification) {
		// Fore an update when this notification is received
		if (notification === "MMM-TvheadendDVR_FORCE_UPDATE")
			this.getRecordings();
	},

	getUrl() {
		let url = "http://" +
			this.config.server +

			// Use 'grid_upcoming' to exclude past/completed recordings
			"/api/dvr/entry/grid_upcoming";

		return url;
	},

	getTemplate: function () {
		return `templates/${this.config.templateName}.njk`;
	},

	getTemplateData: function () {
		return {
			config: this.config,
			recordings: this.recordings.slice(0, Math.min(this.recordings.length, this.config.maxRecordings))
		};
	},

	addFilters() {
		this.nunjucksEnvironment().addFilter(
			"getTime",
			function (time, currentlyRecording) {
				if (currentlyRecording) {
					return moment.unix(time)
						.format(this.config.timeFormats.now);
				}
				else {
					return moment.unix(time)
						.calendar(null, {
							sameDay: this.config.timeFormats.today,
							nextDay: this.config.timeFormats.tomorrow,
							nextWeek: this.config.timeFormats.thisWeek,
							sameElse: this.config.timeFormats.nextWeekOn
						});
				}
			}.bind(this)
		);
	},
});
