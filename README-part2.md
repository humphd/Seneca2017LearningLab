# Seneca 2017 Learning Lab - Part 2

## Introduction

This is part two of a multi-part lab series.  Part one is available as well [here](README.md).

In this portion of the series, we'll extend our work to add test infrastructure. Previously
we focused on linting our code, and making sure it didn't contain any anti-patterns, had
good styling, etc.  We also added continuous integration (CI) via Travis CI, to run our
lint checks every time we commit new code, or someone creates a pull request.

This time we'll be adding *unit tests*, which will help us make sure that our code does
what we expect, and that we don't break it as we make changes going forward.  Having
automated unit tests will also help any external developers that join our project, since
they will act as a kind of documentation (e.g., how to use our module's functions) and
a safe-guard for pull requests (e.g., so we know that nothing gets broken).

## Unit Testing Frameworks

All languages have a lot of options for writing unit tests, and JavaScript and node.js
are no different. When you start adding tests to a project, it's a good idea to look at
your options, and pick a testing framework and runtime that will work well with your code,
has good support for automated runs, and is well documented/supported.

Here are some of the popular frameworks you could consider:

* [Jest](http://facebook.github.io/jest/) by Facebook
* [Mocha](https://mochajs.org/)
* [Chai](http://chaijs.com/)
* [Sinon](http://sinonjs.org/)
* [Cucumber](https://github.com/cucumber/cucumber-js)

The list goes on and on.  You're welcome to try any of these for this lab, or another
one not listed.  I'm going to use [Jest](http://facebook.github.io/jest/) for the rest
of this walkthrough.

## Writing our first Test

To use [Jest](http://facebook.github.io/jest/) I first need to install it.  The
[Getting Started](https://facebook.github.io/jest/docs/getting-started.html) is a good
place to start for info on how to get things set up.

First, let's install using `npm`:

```bash
$ npm install --save-dev jest
```

This will install [Jest](http://facebook.github.io/jest/) to our `node_modules` directory
and also save it as a `devDependency` in our `package.json` file.  After running this, mine
looks like this, with a new line added for `jest` and version `^19.0.2` (you might have a newer
version, depending on when you run this):

```json
"devDependencies": {
    "eslint": "^3.17.1",
    "eslint-config-airbnb-base": "^11.1.1",
    "eslint-plugin-import": "^2.2.0",
    "jest": "^19.0.2"
}
```

Next, I need to add a test.  What should we test?  Learning what to test, and how to write
useful and complete tests is an art.  It takes time, and practice will help you.

To begin, let's write a single test for our `seneca` module and the `isValidEmail()`
function.  A unit test should test one thing, and one thing only.  Instead of trying
to write a single test that will test everything at all once, we'll write many small tests,
each of which tests a single aspect of the code.

Let's create a test file for the `seneca.js` module named `seneca.test.js` with the following
contents:

```js
var seneca = require('./seneca');

test('isValid returns true for simple myseneca address', function() {
  var simpleEmail = 'someone@myseneca.ca';
  expect(seneca.isValidEmail(simpleEmail)).toBe(true);
});
```

This test is very simple (as it should be!) and calls our `seneca.isValidEmail()` function
with the string `someone@myseneca.ca`.  Our code *should* return `true`, which is what
we've said with `expect(...).toBe(true)`: the expression we pass to `expect()` needs to
evaluate to `true` in order for our test to pass.  The [docs for `expect`](https://facebook.github.io/jest/docs/expect.html)
show you all the ways you can use it to test for things.

## Running a test

It's often a good idea to write tests *before* you write your code.  This is called
[Test Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development), and
helps to make sure that your code evolves in ways that
are expected, documented, and safe.  It's not always necessary, appropriate, or possible to
do this, but it's something to keep in mind.  The code we're writing is perfect for TDD,
since the functions are very easy to test (something goes in, something comes out).

Here's my code right now, which is unimplemented:

```js
/**
 * Given a string `email`, return `true` if the string is in the form
 * of a valid Seneca College email address, `false` othewise.
 */
exports.isValidEmail = function isValidEmail(email) {
  // TODO: needs to be implemented fully
};
```

Let's try running our test.  From the command-line, you can do the following:

```bash
$ node_modules/.bin/jest
 FAIL  ./seneca.test.js
  ● isValid returns true for simple myseneca address

    expect(received).toBe(expected)

    Expected value to be (using ===):
      true
    Received:
      undefined

    Difference:

      Comparing two different types of values. Expected boolean but received undefined.

      at Object.<anonymous> (seneca.test.js:6:44)
      at process._tickCallback (node.js:369:9)

  ✕ isValid returns true for simple myseneca address (8ms)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        1.034s
Ran all test suites.
```

As you would expect, our test failed.  We expected to be able to pass in a simple address
and get back `true`.  Instead, we passed in the address and got back `undefined`, which is
what happens when a function returns no value.

Let's fix our code:

```js
/**
 * Given a string `email`, return `true` if the string is in the form
 * of a valid Seneca College email address, `false` othewise.
 */
exports.isValidEmail = function isValidEmail(email) {
  return email.match(/@myseneca.ca$/);
};
```

And re-run our unit test:

```bash
$ node_modules/.bin/jest
 FAIL  ./seneca.test.js
  ● isValid returns true for simple myseneca address

    expect(received).toBe(expected)

    Expected value to be (using ===):
      true
    Received:
      ["@myseneca.ca"]

    Difference:

      Comparing two different types of values. Expected boolean but received array.

      at Object.<anonymous> (seneca.test.js:6:44)
      at process._tickCallback (node.js:369:9)

  ✕ isValid returns true for simple myseneca address (8ms)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        1.003s
Ran all test suites.
```

We're still failing this test.  This time, instead of getting `undefined`
we got an array with one string element: `@myseneca.ca`.  This is happening becuase we're
returning all the matches it found for our regex.

Let's fix this so we return the proper thing, using the [`RegExp.prototype.test`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) method:

```js
/**
 * Given a string `email`, return `true` if the string is in the form
 * of a valid Seneca College email address, `false` othewise.
 */
exports.isValidEmail = function isValidEmail(email) {
  return /@myseneca.ca$/.test(email);
};
```

And rerunning our tests, we see the following:

```bash
$ node_modules/.bin/jest
 PASS  ./seneca.test.js
  ✓ isValid returns true for simple myseneca address (3ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.018s
Ran all test suites.
```

Success!

## Automate our Tests

Just as we did with our linting check, it would be nice to have a simple way to run
our tests from the command-line, and in Travis CI.  To do this we need to modify our
`package.json` file:

```json
"scripts": {
    "lint": "node_modules/.bin/eslint seneca.js",
    "jest": "node_modules/.bin/jest",
    "test": "npm run -s lint && npm run jest"
},
```

Here I've done 3 things:

* modified my `lint` script to only lint my `seneca.js` file vs. `*.js`.  You can
(and probably should) also lint your test files, but I'm not going to for this lab.
* added a `jest` script that runs my `jest` binary from `node_modules`.
* modified my `test` script to run *both* the `lint` and `jest` scripts.  This means
that running my tests will accomplish both in one step.

I can run any of my scripts via `npm run [script-name]`, for example: `npm run jest`.

TravisCI is automatically going to run my `test` script when I commit code (or do a PR),
so this should automatically mean my tests will run on every commit, whether I remember to
do them locally or not.

Try running your tests locally, then commit and push to see them run in TravisCI.  Here is
[my build running on TravisCI for the changes described above](https://travis-ci.org/humphd/Seneca2017LearningLab/builds/214296336).

## Organizing Test Suites

Our `seneca` module currently has two public functions: `isValidEmail()` and `formatSenecaEmail()`.
We are going to want to write a bunch of tests for each, and it might be nice to organize them
into two groups.

Let's create two test suites, one for each function, and add a few more tests:

```js
// First require (e.g., load) our seneca.js module
var seneca = require('./seneca');

/**
 * Tests for seneca.isValidEmail()
 */
describe('seneca.isValidEmail()', function() {

  test('returns true for simple myseneca address', function() {
    var simpleEmail = 'someone@myseneca.ca';
    expect(seneca.isValidEmail(simpleEmail)).toBe(true);
  });

  test('returns false for a non-myseneca address', function() {
    var gmailAddress = 'someone@gmail.com';
    expect(seneca.isValidEmail(gmailAddress)).toBe(false);
  });

});

/**
 * Tests for seneca.formatSenecaEmail()
 */
describe('seneca.formatSenecaEmail()', function() {

  test('adds @myseneca.ca to the end of name', function() {
    var name = "mshaw";
    expect(seneca.formatSenecaEmail(name)).toBe('mshaw@myseneca.ca');
  });

});
```

Here we've used [`describe()`](https://facebook.github.io/jest/docs/api.html#describename-fn) to
group common tests into test suites.  It makes the output of our test run a bit easier to follow,
and helps us see how each group is doing:

```bash
$ npm test

> lab7@1.0.0 test /Users/dave/Sites/repos/Seneca2017LearningLab
> npm run -s lint && npm run jest


> lab7@1.0.0 jest /Users/dave/Sites/repos/Seneca2017LearningLab
> jest

 PASS  ./seneca.test.js
  seneca.isValidEmail()
    ✓ returns true for simple myseneca address (3ms)
    ✓ returns false for a non-myseneca address (1ms)
  seneca.formatSenecaEmail()
    ✓ adds @myseneca.ca to the end of name (1ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.001s
Ran all test suites.
```

## Write More Tests

To finish this lab, I want you to spend some time thinking of all the ways someone
might use and misuse your `seneca` module and its functions.  Imagine you are giving this
code to someone who is going to use it in a real application.  What might they need?
What might they do?  What problems might they hit?

For every situtation you can imagine, you should add a test.  Each test should be small
and focus on a single thing.  If you think of something that has multiple parts, add more
than one test.  Whenever you add tests, try to also fix your code so they pass. See if you
can fix your code for the new cases you come up with such that you don't break your existing
tests!  It can be a challenge.

Here are some cases to consider, which will need tests and fixes in your code:

### `isValidEmail()`

* user passes something other than a `String` to your function (e.g., `Number`, `Boolean`, ...)
* user passes a variable which is actually `null` (they thought it was a `String`, but it's not)
* email address contains leading whitespace, for example `'    mshaw@myseneca.ca'`
* email address is for a professor vs. student `'david.humphrey@senecacollege.ca'` (this is valid)
* email address uses old style Seneca address, `'david.humphrey@senecac.on.ca'` (this is also valid)

### `formatSenecaEmail()`

* name contains spaces, tabs, or other control characters
* name is `null`

There are so many ways that people might use your code, and so many situations where there might
be bugs in their program that end up passing your code garbage data.  See if you can bullet-proof
your code so you know it works well in all cases.

Use the [docs for `expect`](https://facebook.github.io/jest/docs/expect.html) and the rest
of the [Jest API](https://facebook.github.io/jest/docs/api.html) to help you write good tests
and understand how to do various things.

















