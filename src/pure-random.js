const crypto = require('crypto')
const R = require('ramda')
    , S = require('sanctuary')

const UINT32_MIN = 0
const UINT32_MAX = 4294967295

// Marsaglia, George (July 2003). "Xorshift RNGs". Journal of Statistical Software 8 (14).
// :: [UInt32] -> UInt32
const xorshift = seed => {
  var x = seed[0], y = seed[1], z = seed[2], w = seed[3];
  var t = x;
  t = (t ^ (t << 11)) >>> 0;
  t = (t ^ (t >>> 8)) >>> 0;
  x = y; y = z; z = w;
  w = (w ^ (w >>> 19)) >>> 0;
  w = (w ^ t) >>> 0;
  return w;
}

// :: String -> Number
const fromHex = hex => parseInt(hex, 16) 

// :: () -> [UInt32]
const genCsSeed = () => {
  const seed = crypto.randomBytes(128 / 8).toString('hex')
  return R.map(fromHex, [seed.slice(0, 8), seed.slice(8, 16), seed.slice(16, 24), seed.slice(24, 32)])
}

// :: () -> [UInt32]
const genSeed = () => {
  now = Date.now()
  x = now % UINT32_MAX
  y = now << now >>> 0 % UINT32_MAX
  z = y * 11 % UINT32_MAX
  w = x * now % UINT32_MAX
  return [x,y,z,w]
}

// :: Num -> Boolean
const inRange = R.both(R.lte(UINT32_MIN), R.gte(UINT32_MAX))

// :: [UInt32] -> Int -> Int -> ([Uint32] -> Int -> Int)
const validate = (seed, min, max, randFn) => {
  if (!R.all(R.both(Number.isInteger, inRange), seed))
    return S.Left(TypeError(`Seed must be an array of four integers between [${UINT32_MIN}, ${UINT32_MAX}]`))
  else if (typeof min !== 'number')
    return S.Left(TypeError('Min must be a number')) 
  else if (typeof max !== 'number')
    return S.Left(TypeError('Max must be a number')) 
  else if (min >= max)
    return S.Left(Error('Min must be less than max'))
  else
    return S.Right(randFn(seed, min, max))
}

// :: [UInt32] -> Int -> Int -> Float
const rand      = R.curry((seed, min, max) => min + xorshift(seed) / UINT32_MAX * (max - min))

// :: [UInt32] -> Int -> Int -> Either Error Float
const randFloat = R.curry((seed, min, max) => validate(seed, min, max, rand))

// :: [UInt32] -> Int -> Int -> Either Error Int
const random    = R.curry((seed, min, max) => randFloat(seed, min, max).map(Math.round))

module.exports = {
  genSeed:   genSeed,
  genCsSeed: genCsSeed,

  randUint:  xorshift,
  randFloat: randFloat,
  random:    random,
}

/*
  Rules for bitwise operations on 32-bit unsigned ints
  1. always end bit wise ops with ">>> 0" so the result gets interpreted as unsigned.
  2. don't use >>. If the left-most bit is 1 it will try to preseve the sign and thus will introduce 1's to the left. 
     Always use >>>.
  Source: http://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
*/
