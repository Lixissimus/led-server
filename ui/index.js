var sendButton = document.getElementById("send"),
	colorPicker = document.getElementById("color"),
	modeSelect = document.getElementById("mode"),
	durationField = document.getElementById("duration");

sendButton.addEventListener("click", sendRequest);


function sendRequest() {
	var color = hexToRgb(colorPicker.value);
	$.post("http://192.168.178.91:8888/show", {
		r: color.r,
		g: color.g,
		b: color.b,
		mode: modeSelect.value,
		dur: durationField.value
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