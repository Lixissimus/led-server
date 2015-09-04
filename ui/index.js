var sendButton = document.getElementById("send"),
	fireButton = document.getElementById("fire"),
	stopButton = document.getElementById("stop"),
	colorPicker = document.getElementById("color"),
	modeSelect = document.getElementById("mode"),
	durationField = document.getElementById("duration");

var url = "http://192.168.178.91:8888/";

sendButton.addEventListener("click", sendRequest);
fireButton.addEventListener("click", startFireProgram);
stopButton.addEventListener("click", stopFireProgram);


function sendRequest() {
	var color = hexToRgb(colorPicker.value);
	$.post(url + "show", {
		r: color.r,
		g: color.g,
		b: color.b,
		mode: modeSelect.value,
		dur: durationField.value
	});
}

function startFireProgram() {
	$.post(url + "show", {
		mode: "program",
		name: "fire.js"
	});
}

function stopFireProgram() {
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