#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

int
main(int argc, char *argv[])
{
  schedlog(5000);

  sleep(50);

  exit(0);
}
