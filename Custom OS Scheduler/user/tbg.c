#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

static void
cpu_burn(int iters)
{
  volatile int x = 0;
  for (int i = 0; i < iters; i++) {
    x = x * 17 + i;
  }
}

int
main(int argc, char *argv[])
{
  int rounds = 20;
  int iters  = 200000;

  if (argc > 1)
    rounds = atoi(argv[1]);

  schedlog(10000);

  for (int r = 0; r < rounds; r++) {
    cpu_burn(iters);   // CPU burst
    sleep(10);         // IO burst
  }

  exit(0);
}

