#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

// Marsaglia, George (July 2003). "Xorshift RNGs". Journal of Statistical Software 8 (14).
uint32_t x, y, z, w;

uint32_t xorshift128(void) {
    uint32_t t = x;
    t ^= t << 11;
    t ^= t >> 8;
    x = y; y = z; z = w;
    w ^= w >> 19;
    w ^= t;
    return w;
}


int main(int argc, char *argv[]) {
  x = strtol (argv[1], NULL, 0);
  y = strtol (argv[2], NULL, 0);
  z = strtol (argv[3], NULL, 0);
  w = strtol (argv[4], NULL, 0);

  printf("%u\n", xorshift128()); 
}
