#include "kernel/types.h"
#include "user/user.h"

int main(void)
{
  printf("Starting init test\n");
  
  // Start schedlog early
  schedlog(200);
  
  // Fork just ONE child that exits quickly
  int pid = fork();
  if(pid == 0) {
    printf("Child running\n");
    for(int i = 0; i < 50; i++);  // Brief work
    printf("Child exiting\n");
    exit(0);
  }
  
  // Parent (will eventually be waited on by init)
  printf("Parent waiting\n");
  wait(0);
  printf("Parent done\n");
  
  exit(0);
}