var fs = require("fs"),
	os = require("os"),
	piblaster = require("pi-blaster.js");

var isPi = os.hostname() === "raspberrypi";
var conf = JSON.parse(fs.readFileSync("./config.json"));

function showColor(color) {
	if (isPi) {
		// we are on the raspberry
		piblaster.setPwm(conf.pins.red, color.red / 255);
		piblaster.setPwm(conf.pins.green, color.green / 255);
		piblaster.setPwm(conf.pins.blue, color.blue / 255);
	} else {
		// we are somewhere else, so no leds...
		console.log("Show:");
		console.log(JSON.stringify(color));
	}
}

function fade(from, to, dur) {
	var fadeStep = parseInt(conf.msFadeStep),
		steps = dur / fadeStep,
		rStep = (to.red - from.red) / steps,
		gStep = (to.green - from.green) / steps,
		bStep = (to.blue - from.blue) / steps,
		aStep = (to.alpha - from.alpha) / steps;

	var taken = 0;
	function step() {
		showColor({
			red: from.red + taken * rStep,
			green: from.green + taken * gStep,
			blue: from.blue + taken * bStep,
			alpha: from.alpha + taken * aStep,
		});
		// to not shoot over target, always show to color as last one
		if (taken < steps - 1) {
			setTimeout(step, fadeStep);
		} else {
			setTimeout(function() {
				showColor(to);
			}, fadeStep);
		}
		taken++;
	}
	step();
}

// var from = {
// 	red: 0,
// 	blue: 0,
// 	green: 0,
// 	alpha: 255
// }
// var to = {
// 	red: 255,
// 	blue: 255,
// 	green: 255,
// 	alpha: 255
// }
// fade(from, to, 5000);

exports.fade = fade;
exports.show = showColor;