var NerdieInterface = require('../nerdie_interface.js');

function Twss(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
}
Twss.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('twss', false),
		this.sayIt
	);
};

Twss.prototype.sayIt = function(msg) {
	msg.say("That's what she said!");
};

module.exports = Twss;
