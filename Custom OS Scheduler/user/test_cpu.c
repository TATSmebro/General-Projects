#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

int
main(int argc, char *argv[])
{
  long long sum = 0;

  schedlog(5000);

  for (int i = 1; i <= 1000000; i++) {
    sum += i;
  }

  long long expected = ((long long)1000000 * (1000000LL + 1)) / 2;

  exit(sum == expected ? 0 : 1);
}

