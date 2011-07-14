var request = require('request');
var async = require('async');

var NerdieInterface = require('../nerdie_interface.js')
, config = null;

function GetTime(parentNerdie) {
	this.pluginInterface = new NerdieInterface(parentNerdie, this);
	config = parentNerdie.config.plugins.time;
}

GetTime.prototype.init = function () {
	this.pluginInterface.registerPattern(
		this.pluginInterface.anchoredPattern('time', false),
		this.time
	);
};

GetTime.prototype.time = function(msg) {

	var sum = '';

	async.forEachSeries(
		config, 
		function(item, callback){
			uri = 'http://www.timeapi.org/' + encodeURIComponent(item.zone) + '/now?\\a%20\\b%20\\d%20\\I:\\M%20\\p%20\\Y';
			request({uri: uri}, function (error, response, body) {
				console.log('Result for ', item, response.statusCode, body);
				if(sum != '') {
					sum += '  |  ';
				}
				if (!error && response.statusCode == 200) {
					sum += item.placename + ': ' + body;
				} else {
					sum += item.placename + ': ' + 'API Error';
				}
				callback();
			});
		},
		function(result) {
			msg.say(msg.user + ": " + sum);
		}
	);

};

module.exports = GetTime;
