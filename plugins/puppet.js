var NerdieInterface = require('../nerdie_interface.js')
  , nerdie = null;

function Puppet(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	nerdie = parentNerdie;
}

Puppet.prototype.init = function () {
	this.pluginInterface.registerPattern(
		new RegExp('^(#\\w+)\\s+(.+)$'),
		this.puppet
	);
};

Puppet.prototype.puppet = function(msg) {
	if (msg.user != msg.source) return;
	if (nerdie.config.admins.indexOf(msg.user) === -1) {
		msg.msg('You do not have permissions for puppeteering.');
		return;
	}
	else {
		nerdie.bot.say(msg.match_data[1], msg.match_data[2]);
	}
};

module.exports = Puppet;
