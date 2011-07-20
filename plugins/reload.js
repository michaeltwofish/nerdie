var NerdieInterface = require('nerdie_interface.js')
  , config = null;

function Reload(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	config = (parentNerdie.config) ? parentNerdie.config : {};
}

Reload.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('reload', true),
		this.reload
	);
};

Reload.prototype.reload = function(msg) {
	console.log(config);
	if (config.admins.indexOf(msg.user) === -1) {
		msg.msg('You do not have permissions for reloading.');
		return;
	}
	process.exit(0);
};

module.exports = Reload;
