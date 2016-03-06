#!/usr/bin/env node
const rnd = require('../src/pure-random')
const seed = process.argv.slice(2).map(string => parseInt(string))

console.log(rnd.randUint(seed))
process.exit(0)
