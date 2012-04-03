var config = null;

function Reload(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	config = (parentNerdie.config) ? parentNerdie.config : {};
	loadedPlugins = (parentNerdie.loadedPlugins) ? parentNerdie.loadedPlugins : {};
	nerdie = parentNerdie;
}

Reload.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('reload', true),
		this.reload
	);
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('reload', false),
		this.reload
	);
};

Reload.prototype.reload = function(msg) {
	var plugin = null
	  , name = null;

	console.log(config);
	if (config.admins.indexOf(msg.user) === -1) {
		msg.msg('You do not have permissions for reloading.');
		return;
	}
	if(msg.match_data[2] == undefined) {
		process.exit(0);
	}
	else {
		console.log('Reloading ' + msg.match_data[2]);
		plugin = msg.match_data[2];
		for(var name in loadedPlugins) {
			if(name.match('/' + plugin + '$')) {
				// console.log(name, loadedPlugins[name]);
				name += '.js';
				delete(require.cache[ require.resolve(name) ]);

				pluginLoader = require(name);
				plugin = new pluginLoader(nerdie);

				if ('object' == typeof plugin.pluginInterface) {
					plugin.pluginInterface.addListener('registerPattern', function (pattern, callback) {
						console.log('Registered pattern: ' + pattern);
						j.watch_for(pattern, callback);
					});
				}
				nerdie.loadedPlugins[name] = plugin;
			}
		}
	}
};

module.exports = Reload;
