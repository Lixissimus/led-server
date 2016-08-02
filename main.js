'use strict'

let http = require("http"),
		url = require("url"),
		qs = require("querystring"),
		fs = require("fs"),
		cp = require("child_process"),
		player = require("./player.js");

require("log-timestamp");

let conf = JSON.parse(fs.readFileSync("./config.json"));

let handlers = {
	"GET": {},
	"POST": {}
}

let getHandlers = handlers["GET"];
let postHandlers = handlers["POST"];

getHandlers["/"] = function(req, res) {
	res.writeHead(200, {"Content-Type": "text/json"});
	res.write(JSON.stringify(conf));
	res.end();
}

getHandlers["/config"] = handlers["/"];

getHandlers["/programs"] = (req, res) => {
	let programs = fs.readdirSync("./programs").filter(file => {
		return file.slice(-3) === ".js";
	});

	let body = {
		programs: programs
	}
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.writeHead(200, "OK", {"Content-Type": "text/json"});
	res.write(JSON.stringify(body));
	res.end();
}

postHandlers["/show"] = (req, res) => {
	let data = '';
	req.on('data', chunk => {
		data += chunk;
	});

	req.on('end', () => {
		let params = JSON.parse(data);
		let mode = params["mode"];
		let color = createColorFromParams(params);

		switch (mode) {
			case "fade": {
				player.stop();
				let dur = params["dur"] || 500;
				player.fade(color, dur);
				break;
			}
			case "program": {
				player.stop();
				let name = params["name"];
				player.play(`programs/${name}`);
				break;
			}
			case "stop":
			case "static":
			default: {
				player.stop();
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
	let pathname = url.parse(req.url).pathname;
	let method = req.method;
	console.log("got req", req.method);
	if (handlers[method] && typeof handlers[method][pathname] === "function") {
		handlers[method][pathname](req, res);
	} else if (method === "OPTIONS") {
		// pre-flight request
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
		res.writeHead(200);
		res.end();
	} else {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("404 Not found");
		res.end();
	}
}

function createColorFromParams(params) {
	let color = {};
	color.red = parseInt(params["r"] || 0);
	color.green = parseInt(params["g"] || 0);
	color.blue = parseInt(params["b"] || 0);
	color.alpha = parseInt(params["a"] || 0);

	return color;
}

http.createServer(onRequest).listen(conf.port);
console.log(`LED-Server is running on port ${conf.port}`);

if (conf.staticServer) {
	// also start a static server for the ui
	console.log(`Starting static http-server on port ${conf.staticServer.port}`);
	cp.exec(`python -m SimpleHTTPServer ${conf.staticServer.port}`, {
		cwd: "ui"
	});
}

// turn leds of at the beginning
player.show({
	red: 0,
	green: 0,
	blue: 0,
	alpha: 0
});