var AWS = require("aws-sdk"),
	async = require("async"),
	childProcess = require("child_process"),
	path = require("path"),
	fs = require("fs");

function brown(str) { return "\x1b[33m" + str + "\x1b[0m"; }
function green(str) { return "\x1b[32m" + str + "\x1b[0m"; }

/**
* Deploys lambdas/* to AWS lambda
*/
module.exports = function (done) {
	AWS.config.region = "us-west-2";

	var Lambda = new AWS.Lambda();

	fs.readdirSync("./lambdas").filter(function (fd) {
		return fs.statSync(path.join("./lambdas", fd)).isDirectory();
	}).forEach(function (dir) {
		console.log(green("Deploying lambda function " + dir));
		var fullPath = path.resolve("lambdas/" + dir);
		var config = require(path.resolve(fullPath, "package.json"));

		async.series([
			function getNode(callback) {
				console.log(brown("  Fetching node from " + config.nodeDist));
				childProcess.exec("wget -O node.tgz " + config.nodeDist, {cwd: fullPath}, callback);
			},
			function untarNode(callback) {
				// Make the directory name consistent so the runner doesn't have to be
				// updated when the dist changes.
				console.log(brown("  Unpacking node"));
				childProcess.exec("tar -xzf node.tgz && rm node.tgz && mv node-* node/", {cwd: fullPath}, callback);
			},
			function npm(callback) {
				// Dedupe to save time on invocation and space unde Lambda's limitations
				console.log(brown("  Installing dependencies"));
				childProcess.exec("npm install && npm dedupe", {cwd: fullPath}, callback);
			},
			function bundle(callback) {
				console.log(brown("  Packaging"));
				childProcess.exec("zip -q -r lambda.zip *", {cwd: fullPath}, callback);
			},
			function clean(callback) {
				console.log(brown("  Cleaning"));
				childProcess.exec("rm -r node node_modules", {cwd: fullPath}, callback);
			},
			function removeExisting(callback) {
				// Yeah... bit of a race condition here.
				Lambda.getFunction({FunctionName: dir}, function (err) {
					if (err && err.statusCode === 404) {
						// No function with name exists; proceed.
						callback();
					} else {
						// Function already exists, delete it first.
						console.log(brown("  Removing existing function with same name"));
						Lambda.deleteFunction({FunctionName: dir}, callback);
					}
				});
			},
			function deploy(callback) {
				console.log(brown("  Deploying"));
				Lambda.createFunction({
					Code: {
						ZipFile: fs.readFileSync(path.join(fullPath, "lambda.zip"))
					},
					FunctionName: dir,
					Handler: "runner.handler",
					Role: config.lambdaRole,
					Runtime: "nodejs",
					MemorySize: config.lambdaMemory,
					Publish: true,
					Timeout: config.lambdaTimeout_s
				}, callback);
			},
			function deleteTemporary(callback) {
				childProcess.exec("rm lambda.zip", {cwd: fullPath}, callback);
			},
			function success(callback) {
				console.log(green("  Success"));
				callback();
			}
		], done);
	});
};
