var http = require("http"),
	url = require("url"),
	qs = require("querystring"),
	fs = require("fs"),
	sys = require("sys"),
	exec = require("child_process").exec;

var handlers = {
	"GET": {},
	"POST": {}
}

getHandlers = handlers["GET"];
postHandlers = handlers["POST"];

getHandlers["/"] = function(req, res) {
	res.writeHead(200, {"Content-Type": "text/json"});
	res.write(JSON.stringify(conf));
	res.end();
}
getHandlers["/config"] = handlers["/"];

postHandlers["/show"] = function(req, res) {
	var data = '';
	req.on('data', function(chunk) {
		data += chunk;

		// Too much POST data, kill the connection
        if (data.length > 1e6) {
            req.connection.destroy();
        }
	});

	req.on('end', function() {
		var params = qs.parse(data);

		var color = createColorFromParams(params);
		showColor(color);

		res.writeHead(200, "OK", {'Content-Type': 'text/html'});
		res.end();
	});
}

function onRequest(req, res) {
	var pathname = url.parse(req.url).pathname;
	var method = req.method;
	if (handlers[method] && typeof handlers[method][pathname] === "function") {
		handlers[method][pathname](req, res);
	} else {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("404 Not found");
		res.end();
	}
}

function createColorFromParams(params) {
	var color = {};
	color.red = parseInt(params["r"] || 0);
	color.green = parseInt(params["g"] || 0);
	color.blue = parseInt(params["b"] || 0);
	color.alpha = parseInt(params["a"] || 0);

	return color;
}

function showColor(color) {
	// console.log("showing:");
	// console.log(color.red);
	// console.log(color.green);
	// console.log(color.blue);
	// console.log(color.alpha);

	exec("echo " + conf.pins.red + "=" + (color.red / 255) + " > dev/pi-blaster");
	exec("echo " + conf.pins.green + "=" + (color.green / 255) + " > dev/pi-blaster");
	exec("echo " + conf.pins.blue + "=" + (color.blue / 255) + " > dev/pi-blaster");
}

var conf = JSON.parse(fs.readFileSync("./config.json"));

http.createServer(onRequest).listen(conf.port);
