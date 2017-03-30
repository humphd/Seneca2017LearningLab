# Seneca 2017 Learning Lab - Part 3

## Introduction

This is part three of a multi-part lab series.  Parts [one](README.md) and [two](README-part2.md)
are available as well, and it is assumed you have finished both already.

In this portion of the series, we'll extend our library to create a simple node.js web server
and REST API that uses our module.  We will then deploy our server to run on the cloud hosting
platform [Heroku](https://www.heroku.com/).

Learning how to use [PaaS (Platform as a Service)](https://en.wikipedia.org/wiki/Platform_as_a_service) as
a developer is useful so that you can test, deploy, and demo web services and apps outside of
your local development environment.

There are many PaaS options availalbe, from Amazon (AWS Elastic Beanstalk), Google (App Engine),
Microsoft (Azure), and others.  We will be using [Heroku](https://www.heroku.com/) because it can
be used to deploy apps for free, which is ideal for open source testing and prototyping.  Also,
[Heroku](https://www.heroku.com/) is used by Mozilla to run Thimble in production, so it can also
scale to handle real-world production loads.

NOTE: it is *not* necessary to use a credit card, or incur costs with any of the steps we'll
do in this lab.  If you want to do production quality deployments on Heroku, you would need
to do this.

## Create a node.js Web Server

We'll create a simple REST API for our Seneca module using the popular [Express](https://expressjs.com/)
web framework for node.js.  This is the same web framework Thimble uses.

First, we need to install it using `npm`:

```bash
$ npm install express --save
```

This will add a new `dependency` to our `package.json` file.  When I run this command, my
`package.json` file now shows the following:

```json
"dependencies": {
  "express": "^4.15.2"
}
```

Next we need to create a web server using Express that will allow provide an HTTP based API
for calling our Seneca module's functions.  Let's create a basic server file called `server.js`
with the following code:

```js
// Load the express web framework module
var express = require('express');
// Load our seneca module
var seneca = require('./seneca');

// Create an instance of express
var app = express();

// Use port 3000 unless one is set in the env
var port = process.env.PORT || 3000;

// Define some HTTP routes (e.g., URLs) users can access on our server

// GET http://localhost:3000/
app.get('/', function (req, res) {
  res.send('My Server is working!');
});

// GET http://localhost:3000/validate/someone@myseneca.ca
app.get('/validate/:email', function (req, res) {
  var email = req.params.email;

  // Return a JSON formatted response indicating that the given
  // email address is valid or invalid.
  res.json({
    email: email,
    valid: seneca.isValidEmail(email)
  });
});

// GET http://localhost:3000/format/someone
app.get('/format/:name', function (req, res) {
  var name = req.params.name;

  // Return a JSON formatted response with the given name
  // formatted as a valid email address.
  res.json({
    name: name,
    email: seneca.formatSenecaEmail(name)
  });
});

// Start our web server on port 3000
app.listen(port, function () {
  console.log('Server started on http://localhost:' + port);
});
```

Let's test our server locally to make sure it's working, and debug any problems. To run
it, you do the following:

```bash
$ node server.js
Server started on http://localhost:3000
```

Now navigate to your routes on [http://localhost:3000](http://localhost:3000). For example:

* [http://localhost:3000/](http://localhost:3000/)
* [http://localhost:3000/validate/hsingh@myseneca.ca](http://localhost:3000/validate/hsingh@myseneca.ca)
* [http://localhost:3000/format/hsingh](http://localhost:3000/format/hsingh)

You should get back responses from your server with the data formatted as JSON.  For example, if I
try [http://localhost:3000/validate/someone](http://localhost:3000/validate/someone), I'll get back JSON
indicating that the email is not valid:

```json
{"email":"someone","valid":false}
```

Make sure you `git add` and `git commit` this file so it will exist when we `git push` to Herkou.

## Deploy to Heroku

### Step 1 - Create your account

First, you need to [create a free account on Heroku](https://signup.heroku.com/signup/dc). You
can set your **Primary Development Language** to `Node.js`.  You do *not* need to enter a
credit card, nor will we do anything that requires payment.  We are going to use the free tier.

### Step 2 - Download the Heroku CLI

Interacting with Heroku is done from the command line and with git.  You need to [install the
Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) for your
operating system.

Once installed, you should login to your account from the command line:

```bash
$ heroku login
Enter your Heroku credentials.
Email: you@email.com
Password:
Logged in as you@email.com
```

### Step 3 - Create Heroku App Settings Files

In a minute we're going to `git push` our repo to Heroku, much as we do to GitHub, and this will
automatically deploy it.  In order for this to work, we need to add some metadata to our repo so that
Heroku will know what to do with our files.

We'll need a [`Procfile`](https://devcenter.heroku.com/articles/procfile) that
tells Heroku which command to run when it starts our app.  Create a file a file named `Procfile` (note
the capital `P` and lack of extension) with the following contents:

```
web: node server.js
```

Here we're telling Heroku that we want to start a web process, and which command to run to
start our app's code.

Make sure you `git add` and `git commit` this file so it will exist when we `git push` to Herkou.

### Step 4 - Deploy the App

Now we're going to [create and deploy](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app) our
app to Heroku.

First, create a new app using the Heroku CLI:

```bash
$ heroku create
Creating app... done, ⬢ fast-cove-19860
https://fast-cove-19860.herokuapp.com/ | https://git.heroku.com/fast-cove-19860.git
```

Heroku will generate a random name for your app (mine is `fast-cove-19860`) and give you URLs
you'll need in the following steps.

Next we need to deploy our code to Heroku.  The commands we've run have automatically added
a new remote `git` repo we can use, named `heroku`:

```bash
$ git remote -v
heroku	https://git.heroku.com/fast-cove-19860.git (fetch)
heroku	https://git.heroku.com/fast-cove-19860.git (push)
origin	git@github.com:humphd/Seneca2017LearningLab.git (fetch)
origin	git@github.com:humphd/Seneca2017LearningLab.git (push)
```

We can `push` our code to this new `heroku` remote, which will deploy our code.  NOTE:
make sure you have done `git add` and `git commit` for the `server.js`, `package.json`,
and `Procfile` files you created above, or this won't work.

```bash
$ git git push heroku master
Counting objects: 72, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (68/68), done.
Writing objects: 100% (72/72), 114.53 KiB | 0 bytes/s, done.
Total 72 (delta 48), reused 4 (delta 0)
remote: Compressing source files... done.
remote: Building source:
remote:
remote: -----> Node.js app detected
remote:
remote: -----> Creating runtime environment
remote:
remote:        NPM_CONFIG_LOGLEVEL=error
remote:        NPM_CONFIG_PRODUCTION=true
remote:        NODE_VERBOSE=false
remote:        NODE_ENV=production
remote:        NODE_MODULES_CACHE=true
remote:
remote: -----> Installing binaries
remote:        engines.node (package.json):  unspecified
remote:        engines.npm (package.json):   unspecified (use default)
remote:
remote:        Resolving node version 6.x via semver.io...
remote:        Downloading and installing node 6.10.1...
remote:        Using default npm version: 3.10.10
remote:
remote: -----> Restoring cache
remote:        Skipping cache restore (new runtime signature)
remote:
remote: -----> Building dependencies
remote:        Installing node modules (package.json)
remote:        lab7@1.0.0 /tmp/build_1350b8788532d9900320dfde62e01932
remote:        └─┬ express@4.15.2
remote:        ├─┬ accepts@1.3.3
remote:        │ ├─┬ mime-types@2.1.15
remote:        │ │ └── mime-db@1.27.0
remote:        │ └── negotiator@0.6.1
remote:        ├── array-flatten@1.1.1
remote:        ├── content-disposition@0.5.2
remote:        ├── content-type@1.0.2
remote:        ├── cookie@0.3.1
remote:        ├── cookie-signature@1.0.6
remote:        ├─┬ debug@2.6.1
remote:        │ └── ms@0.7.2
remote:        ├── depd@1.1.0
remote:        ├── encodeurl@1.0.1
remote:        ├── escape-html@1.0.3
remote:        ├── etag@1.8.0
remote:        ├─┬ finalhandler@1.0.1
remote:        │ ├── debug@2.6.3
remote:        │ └── unpipe@1.0.0
remote:        ├── fresh@0.5.0
remote:        ├── merge-descriptors@1.0.1
remote:        ├── methods@1.1.2
remote:        ├─┬ on-finished@2.3.0
remote:        │ └── ee-first@1.1.1
remote:        ├── parseurl@1.3.1
remote:        ├── path-to-regexp@0.1.7
remote:        ├─┬ proxy-addr@1.1.4
remote:        │ ├── forwarded@0.1.0
remote:        │ └── ipaddr.js@1.3.0
remote:        ├── qs@6.4.0
remote:        ├── range-parser@1.2.0
remote:        ├─┬ send@0.15.1
remote:        │ ├── destroy@1.0.4
remote:        │ ├─┬ http-errors@1.6.1
remote:        │ │ └── inherits@2.0.3
remote:        │ └── mime@1.3.4
remote:        ├── serve-static@1.12.1
remote:        ├── setprototypeof@1.0.3
remote:        ├── statuses@1.3.1
remote:        ├─┬ type-is@1.6.14
remote:        │ └── media-typer@0.3.0
remote:        ├── utils-merge@1.0.0
remote:        └── vary@1.1.1
remote:
remote:
remote: -----> Caching build
remote:        Clearing previous node cache
remote:        Saving 2 cacheDirectories (default):
remote:        - node_modules
remote:        - bower_components (nothing to cache)
remote:
remote: -----> Build succeeded!
remote: -----> Discovering process types
remote:        Procfile declares types -> web
remote:
remote: -----> Compressing...
remote:        Done: 13.8M
remote: -----> Launching...
remote:        Released v3
remote:        https://fast-cove-19860.herokuapp.com/ deployed to Heroku
remote:
remote: Verifying deploy... done.
To https://git.heroku.com/fast-cove-19860.git
 * [new branch]      master -> master
```

Our code is now deployed to Heroku, but not yet running.  To start the app on Heroku
we need to start at least one web server with our code:

```bash
$ heroku ps:scale web=1
Scaling dynos... done, now running web at 1:Free
```

At this point you can view your app running on Heroku by visiting the URL it
specified above for your app, or you can use the following command to lanuch
it in your default browser:

```bash
$ heroku open
```

To see server logs for your remote app, you can do the following:

```bash
$ heroku logs
...
```

If you want to see a [continuous stream of logs](https://devcenter.heroku.com/articles/getting-started-with-nodejs#view-logs), do this:

```bash
$ heroku logs --tail
...
```

### Step 4 - Update your Code and Re-Deploy the App

If you make a mistake in your code, fix a bug, or add a feature, you'll need to make changes.
Re-deploying your app with updated code is as simple as doing another `git push`.

Try adding a new route to your `server.js` file that we can use to validate that the server
is working.  Often such a route is called a "health check," since it returns info about whether
the server is running, and can be used with server monitoring software.

Your new route should work as follows:

* Add a new route `/healthcheck`
* Use [process.uptime()](https://nodejs.org/api/process.html#process_process_uptime) to deterimine
the number of seconds that this node.js process has bee running.
* Return JSON with the server's uptime

For example:

```
GET http://localhost:3000/healthcheck

{"uptime":52.349}
```

You could also try formatting the uptime to be returned in days, hours, mins, seconds.

Once you've got the code written and working locally (i.e., test with `node server.js` on your local
machine and visit [http://localhost:3000/healthcheck](http://localhost:3000/healthcheck)), you can
re-deploy to Heroku:

```bash
$ git add <files>
$ git commit -m "Added healthcheck route"
$ git push heroku master
```

Now you should be able to visit your app running on Heroku and hit the `/healthcheck` route.

### Step 5 - Update your GitHub Repo Too!

So far we've been pushing only to Heroku, but we should push our updated code back to GitHub
as well.  When you get everything working locally and on Heroku, push to your `master` branch
on GitHub so your code gets included in your repo.

## Exploring Heroku

We've only scratched the surface of what you can do with Heroku and other PaaS platforms.  It's
just as easy (and free!) to experiment with other platforms, and you should challenge yourself to
try using Google Cloud, AWS, Azure, and others.

You should also spend some time reading the complete [Heroku Node.js guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction).  You can
also explore [guides for other languages](https://devcenter.heroku.com/start). 