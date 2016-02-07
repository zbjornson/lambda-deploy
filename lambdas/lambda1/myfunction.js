process.on("message", function (event) {
	// Do work.
	var result = "42";

	// Send the result back
	process.send(result);
})
