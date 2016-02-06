// Debug: console.error("Job: " + process.argv[2]);
// This is the IPC channel input
var event = JSON.parse(process.argv[2]);

// Do work.
var result = "42";

// Send the result back
process.send(result);
