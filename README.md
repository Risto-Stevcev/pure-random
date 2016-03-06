# pure-random

[![Build Status](https://travis-ci.org/Risto-Stevcev/pure-random.svg)](https://travis-ci.org/Risto-Stevcev/pure-random)

A purely functional random number generator. It implements the `xorshift` algorithm. Xorshift RNGs which are a class of PRNGs that are extremely fast on modern computers and outperm other PRNGs in performance and BigCrush stress testing. 


## Usage

```js
> const rnd = require('pure-random')
> rnd.genCsSeed()
[ 2628481196, 1837393298, 2892949381, 1706851469 ]
> rnd.random(rnd.genCsSeed(), 0, 10)
Right(8)
```

Passing in the same seed with the same params produces the same number:

```js
> const seed = rnd.genCsSeed()
> seed
[ 426141121, 700962946, 3633913687, 2605998810 ]
> rnd.random(seed, 0, 10)
Right(7)
> rnd.random(seed, 0, 10)
Right(7)
> rnd.random(seed, 0, 10)
Right(7)
```


## Reference 

#### `genSeed`

```hs
:: () -> [Uint32]
```
Uses `Date.now` to generate a non-cryptographically secure seed. It is more performant than `genCsSeed`, and appropriate for most cases. The seed is an array of four `Uint32` numbers. Since there is no `Uint32` in javascript yet, integers within the range **[0, 4294967295]** are returned.

#### `genCsSeed`

```hs
:: () -> [Uint32]
```

Uses `crypto.randomBytes` to generate a cryptographically secure seed. It is useful for creating an `initialization vector` for cryptography, or in any situation where you need the generated random number to have significant entropy. The seed is an array of four `Uint32` numbers. Since there is no `Uint32` in javascript yet, integers within the range **[0, 4294967295]** are returned.

#### `randUint`

```hs
:: [UInt32] -> UInt32
```
Takes a `seed` and returns a random `UInt32` value, which in javascript is an integer within the range **[0, 4294967295]**. This function is actually the javascript `xorshift` implementation, so it is extremely fast. The other methods call this method under the hood. 

#### `randFloat`

```hs
 :: [UInt32] -> Int -> Int -> Either Error Float
```

Takes a `seed` and a `min` and `max` range. It returns an `Either` value that is `Left Error` if the function was called with invalid parameters, or a `Right Float` within the specified range (inclusive). 

#### `random`

```hs
 :: [UInt32] -> Int -> Int -> Either Error Int
```

Takes a `seed` and a `min` and `max` range. It returns an `Either` value that is `Left Error` if the function was called with invalid parameters, or a `Right Int` within the specified range (inclusive).



## Faq

#### Why wasn't Math.random used?

`Math.random` is non-deterministic and doesn't have take a seed value, which means that you cannot return results consistently, which is against the purely functional paradigm. Note that this library has an option for more powerful entropy than `Math.random` by using the `genCsSeed` option.

#### What about xorshift\* or xorshift+?

The javascript number type uses a [double-precision 64-bit binary format IEEE 754 value](https://en.wikipedia.org/wiki/IEEE_floating_point), which is a number between **-(2<sup>53</sup> - 1)** and **2<sup>53</sup> - 1**. The xorshift\* and xorshift+ libraries rely on `Uint64` types, which javascript does not support. If a developer erroneously decides to represent `Uint64` using the native number type, then any `Uint64` type will lose precision on the upper end because a javascript number will only go up to **2<sup>53</sup> - 1** but a range of **0** to **2<sup>64</sup> - 1** is needed for `Uint64`.

In general, it would be too complicated to implement these other algorithms because you would have to jump through a lot of hoops with javascript's lack of a type system, and with very little gain. These improvements to xorshift are only slightly more performant.
