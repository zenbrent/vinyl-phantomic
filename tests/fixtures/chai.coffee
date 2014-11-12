# Chai is a very nice tdd/bdd assertion library.
chai = require 'chai'
# Chai Things gives some nice tools for testing arrays and objects.
chai.use require 'chai-things'
chai.use require 'sinon-chai'

module.exports = chai
