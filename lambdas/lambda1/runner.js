/**
 * This is the Lambda entry point and should be the file that you configure AWS to invoke.
 */

var childProcess = require('child_process');

exports.handler = function (event, context) {
	var child = childProcess.spawn("./node/bin/node", ["./myfunction.js", JSON.stringify(event)], {
		stdio: ["pipe", "pipe", "pipe", "ipc"]
	});

  // Channel the result from the worker back to Lambda
	child.on("message", function (msg) {
		context.done(null, msg);
	});

  // Channel errors
	child.on("error", function (msg) {
		context.done(msg);
	});

  // Other STDIO
	// Thought these wouldn't be necessary because of stdio inheritance in spawn,
	// but they seem to be.
	child.stdout.on("data", function (m) {
		console.log(m.toString());
	});
	child.stderr.on("data", function (m) {
		console.error(m.toString());
	});

};
