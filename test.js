const chai = require('chai');
const { describe, it } = require('mocha');
const safeEval = require('safe-eval');
const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

const should = chai.should();

const rules = {};

const getRuleString = async (fileName) => {
  if (rules[fileName]) return rules[fileName];

  const file = await readFile(fileName, "utf8");
  rules[fileName] = file;
  return file;
};

const getRule = async (fileName, global, configuration) => {
  const file = await getRuleString(fileName);
  // NOTE: may want to try/catch here...
  return safeEval(`(${file})`, { global, configuration });
};

describe('#users router', async () => {
  let myRule = null;
  before(() => {
    myRule = getRule('./rule.js');
  });

  it('check for field', async () => {
    return new Promise((resolve) => {
      getRule('./rule.js', {}, {})
        .then((myRule) =>
          myRule({}, {}, (error, user) => {
            should.not.exist(error);
            should.exist(user);
            user.should.deep.equal({ newField: 'blah' });
            resolve();
          }));
    });
  });

  it('check for error', async () => {
    return new Promise((resolve) => {
      getRule('./rule.js', { error: 1 }, {})
        .then((myRule) =>
          myRule({}, {}, (callbackError) => {
            should.exist(callbackError);
            chai.expect(callbackError).to.deep.equal({ message: 'some error' });
            resolve();
          }));
    });

  })
});
