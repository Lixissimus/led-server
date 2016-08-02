'use strict'

let fs = require("fs"),
		os = require("os"),
		piblaster = require("pi-blaster.js");

let isPi = os.hostname() === "raspberrypi";
let conf = JSON.parse(fs.readFileSync("./config.json"));

let stopProgram = false;
let currentColor = {
	red: 0,
	green: 0,
	blue: 0,
	alpha: 255
}

function showColor(color) {
	if (isPi) {
		// we are on the raspberry
		// normalize color value
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

function fadeToColor(toColor, dur, then) {
	let fromColor = getCurrentColor(),
			fadeStep = parseInt(conf.msFadeStep),
			steps = dur / fadeStep,
			rStep = (toColor.red - fromColor.red) / steps,
			gStep = (toColor.green - fromColor.green) / steps,
			bStep = (toColor.blue - fromColor.blue) / steps,
			aStep = (toColor.alpha - fromColor.alpha) / steps;

	function step(taken) {
		return function() {
			showColor({
				red: fromColor.red + taken * rStep,
				green: fromColor.green + taken * gStep,
				blue: fromColor.blue + taken * bStep,
				alpha: fromColor.alpha + taken * aStep,
			});
		}
	}

	// schedule all steps for the fade
	for (let i = 0; i < steps - 1; i++) {
		schedule(step(i), fadeStep);
	}
	// schedule the last step to exactly hit toColor
	schedule(() => {
		showColor(toColor);
	}, fadeStep);
}

// -- functions related to playing programs --

// queue async calls and run them one after another
let asyncQueue = [],
		queueIsActive = false;

// create a job and put it in the queue
function schedule(fun, duration) {
	appendJob({
		code: fun,
		duration: duration
	});
}

// add a new job to the queue, eventually start the queue
function appendJob(job) {
	if (!queueIsActive) {
		queueIsActive = true;
		runJob(job);
	} else {
		asyncQueue.push(job);
	}
}

// run the code of a job
function runJob(job) {
	setTimeout(() => {
		job.code();
		next();
	}, job.duration);
}

// run next job or stop the queue
function next() {
	let nextJob = asyncQueue.shift();
	if (nextJob) {
		runJob(nextJob);
	} else {
		queueIsActive = false;
	}
}

// read a program from file and play it
function playProgram(program) {
	stopProgram = false;
	// read the program code
	let code = fs.readFileSync(program).toString();

	// -- define some util functions that can be used in the programs --

	// set a static color
	function set(r, g, b) {
		showColor({
			red: r,
			green: g,
			blue: b
		});
	}

	// fade to a color
	function fade(r, g, b, dur) {
		let color = {
			red: r,
			green: g,
			blue: b
		}
		fadeToColor(color, dur);
		// subsequent calls to fade start with the current color, so set that explicitly before the actual fade is done
		currentColor = color;
	}

	// sleep for some time
	function sleep(dur) {
		schedule(() => {
			// do nothing in here
		}, dur);
	}

	// -- end utils --

	// encapsulate the program in a function
	// var here?
	eval(`prog = function() {\n${code}\n}`);
	// run the program until it is stopped
	function run() {
		prog();
		if (!stopProgram) {
			schedule(run, 0);
		}		
	}
	run();
}

function stopCurrentProgram() {
	stopProgram = true;
}

// -- end playing programs --

function getCurrentColor() {
	return currentColor;
}

function setCurrentColor(color) {
	currentColor = color;
}

module.exports = {
	fade: fadeToColor,
	show: showColor,
	play: playProgram,
	stop: stopCurrentProgram,
	getCurrentColor: getCurrentColor
}
