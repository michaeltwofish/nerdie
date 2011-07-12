var NerdieInterface = require('../nerdie_interface.js');

var db;
var publicReminders = 3;
var myInterface;
var delay = 3600;
var preamble = "I was asked to remind you ";

function Remind(parentNerdie) {
	this.pluginInterface = new NerdieInterface(
		parentNerdie,
		this,
		{db: true}
	);
	myInterface = this.pluginInterface;
}
Remind.prototype.init = function () {
	this.pluginInterface.registerPattern(
		'.',
		activityHandler
	);
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('remind', true),
		remindHandler
	);
};
Remind.prototype.gotDb = function (incomingDb) {
	db = incomingDb;
}
var isChannel = function (source) {
	// check source (# or & means it's a channel)
	var first = source.substr(0, 1);
	if ('#' === first || '&' === first) {
		return true;
	}
	return false;
};
var remindHandler = function (msg) {
	if (!isChannel(msg.source)) {
		msg.say('You must user reminders within the channel where they will be relayed.');
		return;
	}
	var txt = msg.match_data[2];
	var remindNick = txt.substr(0, txt.indexOf(' '));
	var remindMsg = txt.substr(txt.indexOf(' ') + 1);
	if (!remindNick || !remindMsg) {
		// no nick or message supplied
		return
	}
  if (remindNick == 'me') {
		remindNick = msg.user;
	}
	db.set(
		myInterface.uniqueId(),
		{
			recipient: remindNick,
			source: msg.source,
			msg: {
				time: Date.now(),
				sender: msg.user,
				content: remindMsg
			}
		},
		function (err) {
			if (err) {
				msg.say("Unable to save message: " + err);
			} else {
				msg.say("Ok, " + msg.user + ". Message stored.");
			}
		}
	);
};
var ago = function (ts) {
	var timeDiff = (Date.now() - ts) / 1000;

	var days = Math.floor(timeDiff / 86400);
	if (days > 0) {
		return days + ' day' + (days > 1 ? 's' : '');
	}

	var hours = Math.floor(timeDiff / 3600);
	if (hours > 0) {
		return hours + ' hour' + (hours > 1 ? 's' : '');
	}

	var minutes = Math.floor(timeDiff / 60);
	if (minutes > 0) {
		return minutes + ' minute' + (minutes > 1 ? 's' : '');
	}

	return 'seconds';
};
var activityHandler = function (msg) {
	if (!isChannel(msg.source)) {
		return; // early; nothing to see here
	}
	db.fetch({},
		function (doc, key) {
			if (doc.source == msg.source && doc.recipient == msg.user && ((Date.now() - doc.msg.time) / 1000 > delay)) {
				return true;
			}
		},
		function (err, results) {
			if (err) {
				if ('No Records' !== err.message) {
					throw err;
				}
				return;
			}
			results.forEach(function (data) {
				msg.say(msg.user + ": (from: " + data.msg.sender + ", " + ago(data.msg.time) + " ago) " + preamble + data.msg.content);
				db.remove(data._key, function () {})
			});
		}
	);
}

module.exports = Remind;

