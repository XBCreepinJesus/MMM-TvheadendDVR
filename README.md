# MMM-TvheadendDVR

A module for MagicMirror² showing the next scheduled [Tvheadend](https://tvheadend.org) recordings.

>![](/screenshots/demo.png)<br>My next five scheduled recordings (as an example - don't judge!).

---
## Installation

Install the module and required `digest-fetch` node.js module using Git into the modules directory of your MagicMirror installation:

```
git clone https://github.com/XBCreepinJesus/MMM-TvheadendDVR.git
cd MMM-TvheadendDVR/
npm install
```

Then add it to your `config.js` modules section like any other module:

```javascript
modules: [
    {
        module: "MMM-TvheadendDVR",
        header: "Upcoming TV recordings",    // for example
        position: "bottom_left",   // can be anywhere you like
        config: {
			server: "[your TVH server address and port]",
			username: "[username]",
			password: "[password]",
        },
    },
],
```

See below for details on configuring Tvheadend for access.

---
## Configuration

The required options are:
|Option|Description|
|---|---|
|`server`|Enter the server name/IP, including the port number for the web interface (typically 9981).<br>For example, `192.168.0.1:9981`|
|`username`<br>`password`|Username and password of an account with access to view recordings ([see below](#tvheadend-configuration)).|

<br>

The following configurations are all optional:
|Option|Default|Description|
|---|---|---|
|`basicAuth`|`false`|Set to `true` if you need to use basic (plain text) authentication ([see below](#tvheadend-configuration)).|
|`updateInterval`|`5*60*1000`|Time between updates (in milliseconds, so `5*60*1000` means 5 minutes).|
|`maxRecordings`|`5`|Maximum number of recordings to show.|
|`templateName`|`default`|The name of your custom template; e.g., for `custom.njk`, just use `custom`).|
|`timeFormats`||See below.|

<br>

You can also change the time formats used in the module by adding this to the config and adjusting where needed:
```javascript
timeFormats {
	now: "[Finishes at] LT",       // For currently recording programmes
	today: "[Today at] LT",        // For recordings happening the same day
	tomorrow: "[Tomorrow at] LT",  // For recordings happening the next day
	thisWeek: "dddd [at] LT",      // For recordings happening within the next week
	nextWeekOn: "MMM DD [at] LT"   // For all other dates
}
```

---
## Templates

This module uses Nunjucks templates to render its output. These are easier to use than writing HTML through Javascript, and has the benefit of allowing the end user to simply create a new template to use without having to recode the module.

The default template shows a list of scheduled recordings with their channel and start times. Currently recording programmes are shown with a red 'recording' symbol.


If you'd like to use a different template, create a `.njk` (and optional `.css`) file in the module directory and set the `templateName` option in the config to the name of your template (minus the .njk extension). For example, if you've created a template called `fabNewTemplate.njk`, adjust your module config to include `templateName: "fabNewTemplate"`.

The module will pass a list of scheduled recordings to the template as `recordings`. You can then iterate through the schedule using:
```
{% for r in recordings %}
	// Display each entry
{% endfor %}
```

You can make use of the `timeFormats` from above in the templates using the `getTime()` filter. Use `getTime(true)` to specify a currently recording programme which will use the `.now` format.

## Tvheadend configuration

This module will need to use an account that has access to the web interface and both 'Basic' and 'View all' access to the Video Recorder.

![](/screenshots/tvh_user.png)

You may also need to configure the Authentication Type under (in v4.3) Configuration > General > Base > HTTP Server Settings. Be sure to set the module to use the same type - if not set to Basic/Plain then MD5 Digest authentication will be used (default in Tvheadend 4.3+; previous versions use plain/basic).

To test authentication/permissions before loading the module, you can open the API page in a browser or use `curl`:
- For basic authentication: `curl -u [username]:[password] http://[server]/api/dvr/entry/grid_upcoming`
- For digest authentication: `curl -u [username]:[password] --digest http://[server]/api/dvr/entry/grid_upcoming`
