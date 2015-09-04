var fs = require("fs"),
	os = require("os"),
	piblaster = require("pi-blaster.js");

var isPi = os.hostname() === "raspberrypi";
var conf = JSON.parse(fs.readFileSync("./config.json"));

var stopProgram = false;

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

function play(program) {
	stopProgram = false;
	// read the program code
	var code = fs.readFileSync(program).toString();

	// define some util functions that can be used in the programs
	function set(r, g, b) {
		showColor({
			red: r,
			green: g,
			blue: b
		});
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

exports.fade = fade;
exports.show = showColor;
exports.play = play;
exports.stop = stop;