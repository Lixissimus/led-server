var fs = require("fs"),
	os = require("os"),
	piblaster = require("pi-blaster.js");

var isPi = os.hostname() === "raspberrypi";
var conf = JSON.parse(fs.readFileSync("./config.json"));

var stopProgram = false;
var currentColor = {
	red: 0,
	green: 0,
	blue: 0,
	alpha: 255
}

function showColor(color) {
	if (isPi) {
		// we are on the raspberry
		// normalize color value by 255
		piblaster.setPwm(conf.pins.red, color.red / 255);
		piblaster.setPwm(conf.pins.green, color.green / 255);
		piblaster.setPwm(conf.pins.blue, color.blue / 255);
	} else {
		// we are somewhere else, so no leds...
		console.log("Show:");
		console.log(JSON.stringify(color));
	}

	currentColor = color;
}

function fade(toColor, dur) {
	var fromColor = getCurrentColor();
	var fadeStep = parseInt(conf.msFadeStep),
		steps = dur / fadeStep,
		rStep = (toColor.red - fromColor.red) / steps,
		gStep = (toColor.green - fromColor.green) / steps,
		bStep = (toColor.blue - fromColor.blue) / steps,
		aStep = (toColor.alpha - fromColor.alpha) / steps;

	var taken = 0;
	function step() {
		showColor({
			red: fromColor.red + taken * rStep,
			green: fromColor.green + taken * gStep,
			blue: fromColor.blue + taken * bStep,
			alpha: fromColor.alpha + taken * aStep,
		});
		// to not shoot over target, always show toColor color as last one
		if (taken < steps - 1) {
			setTimeout(step, fadeStep);
		} else {
			setTimeout(function() {
				showColor(toColor);
			}, fadeStep);
		}
		taken++;
	}
	step();
}

function play(program) {
	stopProgram = false;
	// read the program code
	var code = fs.readFileSync(program).toString();

	// define some util functions that can be used in the programs

	// set a static color
	function set(r, g, b) {
		showColor({
			red: r,
			green: g,
			blue: b
		});
	}

	// fade to a color
	function fade(r, g, b) {
		
	}

	eval("var prog = " + code);

	// code to run the program
	var line = 0;
	function run() {
		if (line < prog.length) {
			var waittime = 0;
			while (typeof prog[line] === "number") {
				waittime += prog[line];
				line++;
			}

			setTimeout(function() {
				if (stopProgram) {
					return;
				}
				if (typeof prog[line] === "function") {
					prog[line]();
				}
				line++;
				run();
			}, waittime);
		} else {
			line = 0;
			if (!stopProgram) {
				run();
			}
		}
	}

	run();
}

function stop() {
	stopProgram = true;
}

function getCurrentColor() {
	return currentColor;
}

exports.fade = fade;
exports.show = showColor;
exports.play = play;
exports.stop = stop;