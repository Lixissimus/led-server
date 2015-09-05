var http = require("http"),
	url = require("url"),
	qs = require("querystring"),
	fs = require("fs"),
	player = require("./player.js");

var conf = JSON.parse(fs.readFileSync("./config.json"));

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
	});

	req.on('end', function() {
		var params = qs.parse(data);

		var mode = params["mode"];
		var color = createColorFromParams(params);
		switch (mode) {
			case "fade": {
				var dur = params["dur"] || 500;
				player.fade(color, dur);
				break;
			}
			case "program": {
				var name = params["name"];
				player.play("programs/" + name);
				break;
			}
			case "stop": {
				player.stop();
				break;
			}
			case "static":
			default: {
				player.show(color);
			}
		}

		// allow cross origin requests
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.writeHead(200, "OK", {"Content-Type": "text/html"});
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

http.createServer(onRequest).listen(conf.port);
console.log("Server is running...");

// to leds of at the beginning
player.show({
	red: 0,
	green: 0,
	blue: 0,
	alpha: 255
});