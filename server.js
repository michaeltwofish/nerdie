var jerk   = require('jerk')
  , events = require('events')
  , fs = require('fs')
  , config = require('./configulator');

// defaults:
if (undefined === config.prefix) {
	config.prefix = '!';
}

function Nerdie() {
	this.config = config;
	this.loadedPlugins = {};
	events.EventEmitter.call(this);
}
Nerdie.prototype = Object.create(events.EventEmitter.prototype, {
	constructor: {
		value: Nerdie,
		enumerable: false
	}
});

Nerdie.prototype.bot = jerk(function(j){
	var plugin = null
	  , nerdie = new Nerdie()
	  , name = null;

	fs.readdir('plugins', function(err, files) {
		if (err) {
			throw err;
		}
		files.forEach(function (filename) {
			var pluginLoader = null;
			if (!fs.statSync("./plugins/" + filename).isFile()) {
				// not a file
				return;
			}
			if (filename.match(/.+\.js$/i)) {
				name = "./plugins/" + filename.split('.').slice(0, -1).join('.');
				pluginLoader = require(name);
				plugin = new pluginLoader(nerdie);

				if ('object' == typeof plugin.pluginInterface) {
					plugin.pluginInterface.addListener('registerPattern', function (pattern, callback) {
						console.log('Registered pattern: ' + pattern);
						j.watch_for(pattern, callback);
					});
				}
				nerdie.loadedPlugins[name] = plugin;
				console.log('Loaded ' + name + ' plugin.');
			}
		});
		nerdie.emit('init', config, nerdie.loadedPlugins);
	});

}).connect(config);
