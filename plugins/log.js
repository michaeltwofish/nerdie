// @todo Create a web server to access the logs it holds.
// @todo Make logs searchable.
// @todo Link between days

var fs = require('fs'),
	path = require('path');
require('date-utils');

var NerdieInterface = require('../nerdie_interface.js');
var logs;

function Log(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	logs = parentNerdie.config.logs;
	if (logs.charAt(0) != '/') {
		// __dirname is this script, we need to be relative to nerdie
		// @ todo Need to find nerdie more reliably, this might be a user plugin
		logs = path.join(__dirname, '..', logs);
	}
}
Log.prototype.init = function () {
	this.pluginInterface.registerPattern('^(?!\\[off\\]).*', this.logHandler);
};

Log.prototype.logHandler = function (msg) {
	var date = new Date();
	var entry = [date.toFormat('HH24:MI:SS'), msg.user, msg.text].join(' : ') + '\n';
  // Strip leading #
	var channel = msg.source.replace(/^#+/, '');

	var channel_path = path.join(logs, channel);

	path.exists(channel_path, function(exists) {
		if (!exists) {
			fs.mkdir(channel_path, 0755);
			console.log('Made channel log directory ' + channel_path);
		}
	});

	// Log files are dates
	var logfile = path.join(channel_path, date.toFormat('YYYY-MM-DD'));
	fs.open(logfile, 'a', 0666, function(err, fd) {
		if (err) {
			console.log("file descripter: ", fd);
			console.log("entry: ", entry);
			throw err;
		}

		fs.writeSync(fd, entry);
		fs.close(fd);
	});

};

module.exports = Log;
