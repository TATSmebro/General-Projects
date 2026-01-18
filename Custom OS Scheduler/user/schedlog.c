#include "kernel/types.h"
#include "user/user.h"

int main(int argc, char *argv[]) {
  if (argc != 2) {
    fprintf(2, "Usage: schedlog <ticks>\n");
    exit(1);
  }
  
  int ticks = atoi(argv[1]);
  
  if (ticks <= 0) {
    fprintf(2, "Error: ticks must be a positive integer\n");
    exit(1);
  }
  
  schedlog(ticks);
  exit(0);
}