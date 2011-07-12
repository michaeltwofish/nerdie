var NerdieInterface = require('../nerdie_interface.js')
  , nerdie = null;

function Channel(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	nerdie = parentNerdie;
}

Channel.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('join', true),
		this.join
	);
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('part', true),
		this.part
	);
};

Channel.prototype.join = function(msg) {
	if (nerdie.config.admins.indexOf(msg.user) === -1) {
		msg.msg('You do not have permissions for joining.');
		return;
	}
	else {
		var chan = msg.match_data[2];
		nerdie.bot.join(chan);
	}
};

Channel.prototype.part = function(msg) {
	if (nerdie.config.admins.indexOf(msg.user) === -1) {
		msg.msg('You do not have permissions for parting.');
		return;
	}
	else {
		var chan = msg.match_data[2];
		nerdie.bot.part(chan);
	}
};

module.exports = Channel;
