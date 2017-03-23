// First require (e.g., load) our seneca.js module
var seneca = require('./seneca');

test('isValid returns true for simple myseneca address', function() {
  var simpleEmail = 'someone@myseneca.ca';
  expect(seneca.isValidEmail(simpleEmail)).toBe(true);
});
