Module.register("MMM-TvheadendDVRStatus", {
	defaults: {
		server: null,
		username: null,
		password: null,

		templateName: "default",

		maxRecordings: 5,

		// Time formats used by Moment.js
		timeFormats: {
			now: "[Finishes at] LT",
			today: "[Today at] LT",
			tomorrow: "[Tomorrow at] LT",
			thisWeek: "dddd [at] LT",
			nextWeekOn: "dddd DD [at] LT"
		},

		// Update interval
		updateInterval: 5 * 60 * 1000, // 5 minutes

		// Log certain things (for testing/curiosity)
		logData: false
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

		// Trigger DVR Entries update
		this.getRecordings();
	},

	getRecordings() {
		this.getData()
			.then(data => {
				this.recordings = data.entries
					// Sort based on start time
					.sort((a, b) => a.start - b.start)

					// Cut down to maximum number of entries as stated in config
					.slice(0, Math.min(data.entries.length, this.config.maxRecordings));

				if (this.config.logData) Log.info(this.recordings);
			})
			.catch(error => {
				Log.error(error);
			})
			.finally(() => {
				this.updateDom();

				setTimeout(() => {
					this.getDvrEntries();
				}, this.config.updateInterval);
			});
	},

	async getData() {
		const response = await fetch(this.getUrl(), { headers: this.getHeaders() });

		if (response.ok) return response.json();
		else {
			Log.error("Error: ", response.status, response.statusText);
		}
	},

	getUrl() {
		let url = "http://" +
			this.config.server +

			// Use 'grid_upcoming' to exclude past/completed recordings
			"/api/dvr/entry/grid_upcoming";

		return url;
	},

	getHeaders() {
		let headers = {
			accept: "application/json",
			Authorization: "Basic " + btoa(this.config.username + ":" + this.config.password)
		};

		return headers;
	},

	getTemplate: function () {
		return `templates/${this.config.templateName}.njk`;
	},

	getTemplateData: function () {
		return {
			config: this.config,
			recordings: this.recordings
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
