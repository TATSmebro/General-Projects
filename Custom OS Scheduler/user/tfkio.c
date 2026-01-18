#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

static int
io_task(void)
{
  for (int i = 0; i < 10; i++) {
    sleep(5);
  }
  return 0; 
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
      io_task();
      exit(0);
    }
  }

  for (int i = 0; i < nchildren; i++) {
    wait(0);
  }

  exit(0);
}



