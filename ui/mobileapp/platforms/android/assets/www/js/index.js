var setColorButton = document.getElementById("setColorButton"),
	fadeToColorButton = document.getElementById("fadeToColorButton"),
	onButton = document.getElementById("onButton"),
	offButton = document.getElementById("offButton"),
	// fireButton = document.getElementById("fire-button"),
	// stopButton = document.getElementById("stop-button"),
	colorPicker = document.getElementById("colorPicker"),
	// modeSelect = document.getElementById("mode-dropdown"),
	durationField = document.getElementById("fadeDurationInput"),
	startProgramButton = document.getElementById("startProgramButton"),
	stopProgramButton = document.getElementById("stopProgramButton"),
	programsDropdown = document.getElementById("programsDropdown");

var url = "http://192.168.178.91:8888/";

setColorButton.addEventListener("click", setStaticColor);
fadeToColorButton.addEventListener("click", fadeToColor);
onButton.addEventListener("click", turnOn);
offButton.addEventListener("click", turnOff);
startProgramButton.addEventListener("click", startProgram);
stopProgramButton.addEventListener("click", stopProgram);


// fireButton.addEventListener("click", startFireProgram);
// stopButton.addEventListener("click", stopFireProgram);

$.get(url + "programs", function(data) {
		for (var i = 0; i < data.programs.length; i++) {
			var item = document.createElement("option");
			item.text = data.programs[i];
			programsDropdown.add(item);
		}
	}
);

function turnOn() {
	var color = hexToRgb(colorPicker.value);
	$.post(url + "show", {
		r: color.r,
		g: color.g,
		b: color.b,
		mode: "fade",
		dur: 200
	});
}

function turnOff() {
	$.post(url + "show", {
		r: 0,
		g: 0,
		b: 0,
		mode: "fade",
		dur: 200
	});
}

function setStaticColor() {
	var color = hexToRgb(colorPicker.value);
	$.post(url + "show", {
		r: color.r,
		g: color.g,
		b: color.b,
		mode: "static"
	});
}

function fadeToColor() {
	var color = hexToRgb(colorPicker.value);
	$.post(url + "show", {
		r: color.r,
		g: color.g,
		b: color.b,
		mode: "fade",
		dur: durationField.value
	});
}

function startProgram() {
	$.post(url + "show", {
		mode: "program",
		name: programsDropdown.value
	});
}

function stopProgram() {
	$.post(url + "show", {
		mode: "stop"
	});
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}