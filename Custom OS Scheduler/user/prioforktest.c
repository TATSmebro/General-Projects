#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"    
#include "kernel/param.h"


int
main(int argc, char *argv[])
{
  if (argc < 2) {
    printf("prioforktest: usage: prioforktest <level>\n");
    exit(1);
  }

  // -----------------------------------------
  // INVALID ARGUMENT CASE
  // -----------------------------------------
  if (strcmp(argv[1], "-1") == 0) {
    int r1 = priofork(-1);
    int r2 = priofork(1000);   // guaranteed invalid
    printf("prioforktest: invalid_return=%d,%d\n", r1, r2);
    exit(0);
  }

  // -----------------------------------------
  // VALID ARGUMENT CASE
  // -----------------------------------------
  int level = atoi(argv[1]);

  int pid = priofork(level);
  if (pid < 0) {
    printf("prioforktest: priofork(%d) failed\n", level);
    exit(1);
  }

  if (pid == 0) {
    printf("prioforktest: child pid=%d level=%d\n", getpid(), level);
    exit(0);
  } else {
    int status;
    int waited = wait(&status);
    printf("prioforktest: parent pid=%d child=%d status=%d\n",
           getpid(), waited, status);
    exit(0);
  }
}
