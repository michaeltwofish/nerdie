var NerdieInterface = require('../nerdie_interface.js')
  , nerdie = null;

function Puppet(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	nerdie = parentNerdie;
}

Puppet.prototype.init = function () {
	this.pluginInterface.registerPattern(
		new RegExp('^(act|say)\s+(##?\\w+)\\s+(.+)$'),
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
		if( msg.match_data[1] == 'say' ) {
			nerdie.bot.say(msg.match_data[2], msg.match_data[3]);
		}
		else {
			nerdie.bot.action(msg.match_data[2], msg.match_data[3]);
		}
	}
};

module.exports = Puppet;
