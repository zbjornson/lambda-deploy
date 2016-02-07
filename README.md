# lambda-deploy
Deploy lambda functions and run with any version of node using portable binaries and IPC.

AWS Lambda only supports nodejs 0.10. This repository contains a deploy script and a template
Lambda function that allows you to run any version of node.js by packaging a portable binary
file and using very efficient inter-process communication (IPC).

The directory `lambdas/` contains your lambda functions. `lambdas/lambda1` is an example lambda function. It is comprised of:

* `runner.js`, which is what AWS invokes, and in turn invokes your actual code.
* `package.json`, where you specify the Lambda execution properties (e.g. timeout and RAM) and the version of node.js to use. You can specify dependencies to bundle as well.
* `myfunction.js`, which is your actual code.

`deploy.js` is the deploy script (surprise!). It will download the correct version of node, bundle your code and its dependencies, then publish it to AWS Lambda. Wrap it in a gulp task with `gulp.task('deploy-lambda', require('./path/to/deploy.js'));`

```
[user@ip-x-y-z-b]$ gulp deploy-lambda
[02:41:04] Using gulpfile ~/gulpfile.js
[02:41:04] Starting 'deploy-lambda'...
Deploying lambda function stat
  Fetching node from https://nodejs.org/dist/v4.2.1/node-v4.2.1-linux-x64.tar.gz
  Unpacking node
  Installing dependencies
  Packaging
  Cleaning
  Removing existing function with same name
  Deploying
  Success
[02:41:25] Finished 'deploy-lambda' after 21 s
```

I run this from an EC2 instance that has IAM roles configured. It should also work automagically if you have an accessible credentials file or environment variables set. Please refer to the AWS authentication docs if you wish to use another mode of authentication.
