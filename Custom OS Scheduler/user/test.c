#include "kernel/types.h"
#include "kernel/stat.h"
#include "user/user.h"

#define NUM_PROCESSES 5
#define TEST_DURATION 300

void test_cpu_bound(int id)
{
    volatile long sum = 0;
    for (long i = 0; i < 510000000; i++) {
        sum += i;
        if (i % 100000 == 0) uptime();
    }

    printf("==========CHILD %d DONE==========\n",getpid());
    exit(0);
}

int main(int argc, char *argv[])
{
    int test_choice = 1;
    if (argc > 1)
        test_choice = atoi(argv[1]);

    schedlog(TEST_DURATION);

    switch (test_choice) {
        case 1: // CPU-bound fork
            printf("Running Test 1: CPU-bound with fork()\n");
            for (int i = 0; i < NUM_PROCESSES; i++)
                if (fork() == 0){
                    printf("------ CHILD %d START ------- \n",getpid());
                    test_cpu_bound(i);}
            for (int i = 0; i < NUM_PROCESSES; i++)
                wait(0);
            break;
        case 2: // CPU-bound priofork
            printf("Running Test 2: CPU-bound with priofork()\n");
            for (int i = 0; i < NUM_PROCESSES; i++)
                if (priofork(2) == 0)
                    test_cpu_bound(i);
            for (int i = 0; i < NUM_PROCESSES; i++)
                wait(0);
            break;
    }

    schedlog(0);
    exit(0);
}
