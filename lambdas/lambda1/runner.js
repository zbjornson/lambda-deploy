/**
 * This is the Lambda entry point and should be the file that you configure AWS to invoke.
 */

var childProcess = require('child_process');

var child = childProcess.spawn("./node/bin/node", ["./myfunction.js"], {
	stdio: [process.stdin, process.stdout, process.stderr, "ipc"]
});

exports.handler = function (event, context) {
	child.send(event);

	// Channel the result from the worker back to Lambda
	child.on("message", function (msg) {
		context.done(null, msg);
	});

	// Channel errors
	child.on("error", function (msg) {
		context.done(msg);
	});
};
