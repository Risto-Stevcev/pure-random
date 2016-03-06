'use strict'
const expect = require('chai').expect
const jsc = require('jsverify')
const rnd = require('../src/pure-random')
const R = require('ramda')
    , S = require('sanctuary')

const UINT32_MIN = 0
const UINT32_MAX = 4294967295
const inRange = R.both(R.lte(UINT32_MIN), R.gte(UINT32_MAX))

const seed =  [ 4094795843, 75119171,   1064088777, 3185678737 ]
    , seed2 = [ 3085274235, 2506035445, 4237491691, 3384326347 ]

describe('randUint', function() {
  it('should return the same result given the same seed', function() {
    for (let i = 0; i < 20; i++)
      expect(rnd.randUint(seed)).to.equal(3297453526)
  })

  it('should return a different result for a different seed', function() {
    expect(rnd.randUint(seed2)).to.equal(1386574803)
  })
})

describe('rand', function() {
  it('should return a floating point number between [0, 1]', function() {
    expect(rnd.randFloat(seed,  0, 1)).to.deep.equal(S.Right(0.7677482270560573))
    expect(rnd.randFloat(seed2, 0, 1)).to.deep.equal(S.Right(0.32283710393189385))
  })
})

describe('random', function() {
  it('should return a Left value on an invalid seed (1)', function() {
    const result = rnd.random([0, 123, -1, 2], 1, 21)
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message)
      .to.equal(`Seed must be an array of four integers between [${UINT32_MIN}, ${UINT32_MAX}]`)
  })

  it('should return a Left value on an invalid seed (2)', function() {
    const result = rnd.random([12, UINT32_MAX + 1, 1, 2], 12, 21)
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message)
      .to.equal(`Seed must be an array of four integers between [${UINT32_MIN}, ${UINT32_MAX}]`)
  })

  it('should return a Left value on an invalid seed (3)', function() {
    const result = rnd.random([0, '123', 1, 2], 1, 21)
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message)
      .to.equal(`Seed must be an array of four integers between [${UINT32_MIN}, ${UINT32_MAX}]`)
  })

  it('should return a Left value if min is not a number', function() {
    const result = rnd.random(seed, '1', 21)
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message).to.equal('Min must be a number')
  })

  it('should return a Left value if max is not a number', function() {
    const result = rnd.random(seed, 1, '21')
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message).to.equal('Max must be a number')
  })

  it('should return a Left value if min >= max', function() {
    const result = rnd.random(seed, 1, 1)
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message).to.equal('Min must be less than max')
  })

  it('should return a Left value if min >= max', function() {
    const result = rnd.random(seed, 2, 1)
    expect(result.isLeft).to.be.true
    expect(result.value).to.be.instanceof(Error)
    expect(result.value.message).to.equal('Min must be less than max')
  })
})


describe('Stress tests', function() {
  this.timeout(5000)

  describe('random', function() {
    it('should get a random number in the valid range value (1)', function() {
      const validRange = jsc.forall(jsc.integer(0, 100), jsc.integer(101, 500), function(a, b) {
        const rand = rnd.random(seed, a, b)
        return rand.isRight && Number.isInteger(rand.value) && a <= rand.value && rand.value <= b
      })
      jsc.assert(validRange, { tests: 10000 })
    })

    it('should get a random number in the valid range value (2)', function() {
      const validRange = jsc.forall(jsc.integer(-1000, 0), jsc.integer(1, 1000), function(a, b) {
        const rand = rnd.random(seed, a, b)
        return rand.isRight && Number.isInteger(rand.value) && a <= rand.value && rand.value <= b
      })
      jsc.assert(validRange, { tests: 20000 })
    })
  })

  describe('randFloat', function() {
    it('should get a rand number in the valid range value', function() {
      const validRange = jsc.forall(jsc.integer(-1000, 0), jsc.integer(1, 1000), function(a, b) {
        const rand = rnd.randFloat(seed, a, b)
        return rand.isRight && typeof rand.value === 'number' && !Number.isInteger(rand.value) && 
               a <= rand.value && rand.value <= b
      })
      jsc.assert(validRange, { tests: 20000 })
    })
  })

  describe('randUint', function() {
    it('should get a rand number in the valid range value', function() {
      const validRange = jsc.forall('nat', function() {
        const rand = rnd.randUint(seed)
        return Number.isInteger(rand) && UINT32_MIN <= rand && rand <= UINT32_MAX
      })
      jsc.assert(validRange, { tests: 20000 })
    })
  })

  describe('genCsSeed', function() {
    it('should generate a seed array', function() {
      const validRange = jsc.forall('nat', function(a, b) {
        const seed = rnd.genCsSeed()
        return R.all(R.both(Number.isInteger, inRange), seed)
      })
      jsc.assert(validRange, { tests: 10000 })
    })
  })

  describe('genSeed', function() {
    it('should generate a seed array', function() {
      const validRange = jsc.forall('nat', function(a, b) {
        const seed = rnd.genSeed()
        return R.all(R.both(Number.isInteger, inRange), seed)
      })
      jsc.assert(validRange, { tests: 10000 })
    })
  })
})
