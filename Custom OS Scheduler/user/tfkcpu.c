#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

static int
cpu_task(void)
{
  long long sum = 0;

  for (int i = 1; i <= 1000000; i++) {
    sum += i;
  }

  long long expected = ((long long)1000000 * (1000000LL + 1)) / 2;
  return sum == expected ? 0 : -1;
}

int
main(int argc, char *argv[])
{
  int nchildren = 4;
  if (argc > 1)
    nchildren = atoi(argv[1]);

  schedlog(10000);

  for (int i = 0; i < nchildren; i++) {
    int pid = fork();
    if (pid < 0) {
      exit(1);        
    }
    if (pid == 0) {
      int rc = cpu_task();
      exit(rc == 0 ? 0 : 1);
    }
  }

  for (int i = 0; i < nchildren; i++) {
    wait(0);
  }

  exit(0);
}

