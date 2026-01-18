const notificationsData = [
    { message: "Alice has sent a request" },
    { message: "Bob submitted a form" },
    { message: "Charlie updated their profile" },
    { message: "Diana approved your request" },
    { message: "Eve rejected a submission" },
    { message: "Frank commented on your post" },
    { message: "Grace uploaded a document" },
    { message: "Heidi changed her password" },
    { message: "Ivan assigned you a task" },
    { message: "Judy mentioned you in a comment" },
    { message: "Mallory sent a reminder" },
    { message: "Niaj completed onboarding" },
  ];
  
// export default notificationsData;

const notifications = [
  {
    id: 1,
    name: 'Judelle Gaza NYAH',
    message: 'has approved your request',
    time: '1h',
    status: 'approved',
    read: false
  },
  {
    id: 2,
    name: 'Mallory Cyan',
    message: 'has cancelled a Flight Request',
    time: '5d',
    status: 'rejected',
    read: true
  },
  {
    id: 3,
    name: 'Sybil Violet',
    message: 'has updated a Flight Request',
    time: '1m',
    status: 'rejected',
    read: true
  },
  {
    id: 4,
    name: 'Sybil Violet',
    message: 'has updated a Flight Request',
    time: '5d',
    status: 'approved',
    read: false
  },
  {
    id: 5,
    name: 'Mallory Cyan',
    message: 'has approved your request',
    time: '10m',
    status: 'rejected',
    read: false
  },
  {
    id: 6,
    name: 'Ivan Purple',
    message: 'has rejected your request',
    time: '3h',
    status: 'pending',
    read: false
  },
  {
    id: 7,
    name: 'Frank Red',
    message: 'has approved your request',
    time: '1h',
    status: 'pending',
    read: true
  },
  {
    id: 8,
    name: 'Alice Green',
    message: 'has sent a Flight Request',
    time: '5h',
    status: 'rejected',
    read: true
  },
  {
    id: 9,
    name: 'Heidi Orange',
    message: 'has updated a Flight Request',
    time: '12h',
    status: 'approved',
    read: false
  },
  {
    id: 10,
    name: 'Charlie Black',
    message: 'has sent a Flight Request',
    time: '2d',
    status: 'pending',
    read: true
  },
  {
    id: 11,
    name: 'Jane Smith',
    message: 'has sent a Flight Request',
    time: '5h',
    status: 'approved',
    read: false
  },
  {
    id: 12,
    name: 'Judy Pink',
    message: 'has cancelled a Flight Request',
    time: '1h',
    status: 'pending',
    read: false
  },
  {
    id: 13,
    name: 'Olivia Silver',
    message: 'has approved your request',
    time: '5m',
    status: 'pending',
    read: false
  },
  {
    id: 14,
    name: 'Mark Lee',
    message: 'has sent a Flight Request',
    time: '3h',
    status: 'rejected',
    read: true
  },
  {
    id: 15,
    name: 'Judy Pink',
    message: 'has approved your request',
    time: '5m',
    status: 'pending',
    read: false
  },
  {
    id: 16,
    name: 'Diana Blue',
    message: 'has rejected your request',
    time: '5m',
    status: 'approved',
    read: false
  },
  {
    id: 17,
    name: 'Ivan Purple',
    message: 'has rejected your request',
    time: '5h',
    status: 'pending',
    read: false
  },
  {
    id: 18,
    name: 'Eve Gray',
    message: 'has cancelled a Flight Request',
    time: '5m',
    status: 'pending',
    read: false
  },
  {
    id: 19,
    name: 'Sybil Violet',
    message: 'has sent a Flight Request',
    time: '1d',
    status: 'approved',
    read: false
  },
  {
    id: 20,
    name: 'Olivia Silver',
    message: 'has sent a Flight Request',
    time: '3d',
    status: 'approved',
    read: false
  },
  {
    id: 21,
    name: 'Sybil Violet',
    message: 'has sent a Flight Request',
    time: '10m',
    status: 'approved',
    read: false
  },
  {
    id: 22,
    name: 'Grace Yellow',
    message: 'has sent a Flight Request',
    time: '8h',
    status: 'rejected',
    read: true
  },
  {
    id: 23,
    name: 'Diana Blue',
    message: 'has updated a Flight Request',
    time: '2h',
    status: 'approved',
    read: true
  },
  {
    id: 24,
    name: 'Sybil Violet',
    message: 'has sent a Flight Request',
    time: '30m',
    status: 'pending',
    read: false
  },
  {
    id: 25,
    name: 'Eve Gray',
    message: 'has approved your request',
    time: '2h',
    status: 'approved',
    read: true
  },
  {
    id: 26,
    name: 'Lucy Brown',
    message: 'has approved your request',
    time: '3d',
    status: 'pending',
    read: false
  },
  {
    id: 27,
    name: 'Mallory Cyan',
    message: 'has approved your request',
    time: '3d',
    status: 'approved',
    read: true
  },
  {
    id: 28,
    name: 'Eve Gray',
    message: 'has updated a Flight Request',
    time: '12h',
    status: 'pending',
    read: false
  },
  {
    id: 29,
    name: 'Diana Blue',
    message: 'has approved your request',
    time: '5d',
    status: 'rejected',
    read: false
  },
  {
    id: 30,
    name: 'Niaj Gold',
    message: 'has sent a Flight Request',
    time: '30m',
    status: 'approved',
    read: true
  },
  {
    id: 31,
    name: 'Olivia Silver',
    message: 'has rejected your request',
    time: '5d',
    status: 'rejected',
    read: true
  },
  {
    id: 32,
    name: 'Jane Smith',
    message: 'has approved your request',
    time: '8h',
    status: 'approved',
    read: true
  },
  {
    id: 33,
    name: 'Charlie Black',
    message: 'has cancelled a Flight Request',
    time: '1m',
    status: 'approved',
    read: true
  },
  {
    id: 34,
    name: 'Heidi Orange',
    message: 'has updated a Flight Request',
    time: '10m',
    status: 'approved',
    read: false
  },
  {
    id: 35,
    name: 'Mark Lee',
    message: 'has sent a Flight Request',
    time: '5h',
    status: 'approved',
    read: true
  },
  {
    id: 36,
    name: 'Diana Blue',
    message: 'has updated a Flight Request',
    time: '3h',
    status: 'rejected',
    read: true
  },
  {
    id: 37,
    name: 'Mark Lee',
    message: 'has sent a Flight Request',
    time: '2h',
    status: 'rejected',
    read: false
  },
  {
    id: 38,
    name: 'Olivia Silver',
    message: 'has approved your request',
    time: '2h',
    status: 'approved',
    read: false
  },
  {
    id: 39,
    name: 'Charlie Black',
    message: 'has cancelled a Flight Request',
    time: '1h',
    status: 'approved',
    read: true
  },
  {
    id: 40,
    name: 'Alice Green',
    message: 'has updated a Flight Request',
    time: '5m',
    status: 'approved',
    read: true
  },
  {
    id: 41,
    name: 'Grace Yellow',
    message: 'has cancelled a Flight Request',
    time: '30m',
    status: 'approved',
    read: false
  },
  {
    id: 42,
    name: 'Alice Green',
    message: 'has sent a Flight Request',
    time: '10m',
    status: 'pending',
    read: true
  },
  {
    id: 43,
    name: 'Eve Gray',
    message: 'has cancelled a Flight Request',
    time: '5m',
    status: 'approved',
    read: false
  },
  {
    id: 44,
    name: 'Sybil Violet',
    message: 'has updated a Flight Request',
    time: '5d',
    status: 'approved',
    read: true
  },
  {
    id: 45,
    name: 'Ivan Purple',
    message: 'has sent a Flight Request',
    time: '12h',
    status: 'approved',
    read: true
  },
  {
    id: 46,
    name: 'Rupert Indigo',
    message: 'has cancelled a Flight Request',
    time: '5h',
    status: 'approved',
    read: true
  },
  {
    id: 47,
    name: 'Peggy Bronze',
    message: 'has approved your request',
    time: '5d',
    status: 'approved',
    read: true
  },
  {
    id: 48,
    name: 'Bob White',
    message: 'has approved your request',
    time: '1h',
    status: 'rejected',
    read: false
  },
  {
    id: 49,
    name: 'Eve Gray',
    message: 'has cancelled a Flight Request',
    time: '1d',
    status: 'approved',
    read: true
  },
  {
    id: 50,
    name: 'Mark Lee',
    message: 'has rejected your request',
    time: '8h',
    status: 'rejected',
    read: true
  },
  {
    id: 51,
    name: 'John Doe',
    message: 'has rejected your request',
    time: '1h',
    status: 'pending',
    read: true
  },
  {
    id: 52,
    name: 'Grace Yellow',
    message: 'has sent a Flight Request',
    time: '30m',
    status: 'approved',
    read: true
  },
  {
    id: 53,
    name: 'Frank Red',
    message: 'has sent a Flight Request',
    time: '3h',
    status: 'pending',
    read: false
  },
  {
    id: 54,
    name: 'Jane Smith',
    message: 'has approved your request',
    time: '8h',
    status: 'approved',
    read: false
  },
  {
    id: 55,
    name: 'Grace Yellow',
    message: 'has sent a Flight Request',
    time: '2d',
    status: 'rejected',
    read: false
  },
  {
    id: 56,
    name: 'Olivia Silver',
    message: 'has cancelled a Flight Request',
    time: '5d',
    status: 'pending',
    read: false
  },
  {
    id: 57,
    name: 'Bob White',
    message: 'has rejected your request',
    time: '3h',
    status: 'rejected',
    read: false
  },
  {
    id: 58,
    name: 'Diana Blue',
    message: 'has sent a Flight Request',
    time: '1m',
    status: 'rejected',
    read: false
  },
  {
    id: 59,
    name: 'Heidi Orange',
    message: 'has rejected your request',
    time: '10m',
    status: 'rejected',
    read: true
  },
  {
    id: 60,
    name: 'Peggy Bronze',
    message: 'has approved your request',
    time: '2d',
    status: 'approved',
    read: true
  },
  {
    id: 61,
    name: 'Charlie Black',
    message: 'has sent a Flight Request',
    time: '2h',
    status: 'pending',
    read: false
  },
  {
    id: 62,
    name: 'Diana Blue',
    message: 'has cancelled a Flight Request',
    time: '1m',
    status: 'rejected',
    read: true
  },
  {
    id: 63,
    name: 'Diana Blue',
    message: 'has sent a Flight Request',
    time: '12h',
    status: 'approved',
    read: true
  },
  {
    id: 64,
    name: 'Rupert Indigo',
    message: 'has rejected your request',
    time: '2d',
    status: 'pending',
    read: false
  },
  {
    id: 65,
    name: 'Mallory Cyan',
    message: 'has cancelled a Flight Request',
    time: '5m',
    status: 'approved',
    read: true
  },
  {
    id: 66,
    name: 'Bob White',
    message: 'has approved your request',
    time: '5h',
    status: 'approved',
    read: false
  },
  {
    id: 67,
    name: 'Jane Smith',
    message: 'has rejected your request',
    time: '1h',
    status: 'approved',
    read: true
  },
  {
    id: 68,
    name: 'Ivan Purple',
    message: 'has approved your request',
    time: '1m',
    status: 'rejected',
    read: true
  },
  {
    id: 69,
    name: 'Lucy Brown',
    message: 'has sent a Flight Request',
    time: '1h',
    status: 'rejected',
    read: false
  },
  {
    id: 70,
    name: 'Ivan Purple',
    message: 'has approved your request',
    time: '5m',
    status: 'approved',
    read: false
  },
  {
    id: 71,
    name: 'Heidi Orange',
    message: 'has sent a Flight Request',
    time: '1m',
    status: 'pending',
    read: true
  },
  {
    id: 72,
    name: 'Frank Red',
    message: 'has sent a Flight Request',
    time: '5d',
    status: 'pending',
    read: true
  },
  {
    id: 73,
    name: 'Eve Gray',
    message: 'has approved your request',
    time: '2h',
    status: 'approved',
    read: true
  },
  {
    id: 74,
    name: 'Diana Blue',
    message: 'has updated a Flight Request',
    time: '8h',
    status: 'rejected',
    read: false
  },
  {
    id: 75,
    name: 'Eve Gray',
    message: 'has cancelled a Flight Request',
    time: '5m',
    status: 'approved',
    read: false
  },
  {
    id: 76,
    name: 'Alice Green',
    message: 'has sent a Flight Request',
    time: '5m',
    status: 'rejected',
    read: false
  },
  {
    id: 77,
    name: 'Niaj Gold',
    message: 'has sent a Flight Request',
    time: '30m',
    status: 'rejected',
    read: false
  },
  {
    id: 78,
    name: 'Mallory Cyan',
    message: 'has rejected your request',
    time: '1d',
    status: 'pending',
    read: true
  },
  {
    id: 79,
    name: 'Alice Green',
    message: 'has approved your request',
    time: '5m',
    status: 'approved',
    read: true
  },
  {
    id: 80,
    name: 'Alice Green',
    message: 'has sent a Flight Request',
    time: '3d',
    status: 'approved',
    read: false
  },
  {
    id: 81,
    name: 'John Doe',
    message: 'has rejected your request',
    time: '1m',
    status: 'rejected',
    read: false
  },
  {
    id: 82,
    name: 'Judy Pink',
    message: 'has cancelled a Flight Request',
    time: '8h',
    status: 'pending',
    read: true
  },
  {
    id: 83,
    name: 'Olivia Silver',
    message: 'has rejected your request',
    time: '5h',
    status: 'pending',
    read: true
  },
  {
    id: 84,
    name: 'John Doe',
    message: 'has cancelled a Flight Request',
    time: '5m',
    status: 'pending',
    read: false
  },
  {
    id: 85,
    name: 'John Doe',
    message: 'has updated a Flight Request',
    time: '5m',
    status: 'pending',
    read: false
  },
  {
    id: 86,
    name: 'Charlie Black',
    message: 'has approved your request',
    time: '10m',
    status: 'pending',
    read: false
  },
  {
    id: 87,
    name: 'Diana Blue',
    message: 'has updated a Flight Request',
    time: '10m',
    status: 'rejected',
    read: false
  },
  {
    id: 88,
    name: 'Lucy Brown',
    message: 'has updated a Flight Request',
    time: '5h',
    status: 'rejected',
    read: true
  },
  {
    id: 89,
    name: 'Frank Red',
    message: 'has sent a Flight Request',
    time: '1d',
    status: 'rejected',
    read: true
  },
  {
    id: 90,
    name: 'Diana Blue',
    message: 'has sent a Flight Request',
    time: '2h',
    status: 'approved',
    read: false
  },
  {
    id: 91,
    name: 'Jane Smith',
    message: 'has cancelled a Flight Request',
    time: '8h',
    status: 'approved',
    read: true
  },
  {
    id: 92,
    name: 'Olivia Silver',
    message: 'has cancelled a Flight Request',
    time: '5m',
    status: 'rejected',
    read: false
  },
  {
    id: 93,
    name: 'Olivia Silver',
    message: 'has updated a Flight Request',
    time: '5d',
    status: 'pending',
    read: false
  },
  {
    id: 94,
    name: 'Charlie Black',
    message: 'has sent a Flight Request',
    time: '2d',
    status: 'approved',
    read: false
  },
  {
    id: 95,
    name: 'Judy Pink',
    message: 'has cancelled a Flight Request',
    time: '1m',
    status: 'rejected',
    read: true
  },
  {
    id: 96,
    name: 'Mark Lee',
    message: 'has cancelled a Flight Request',
    time: '3h',
    status: 'rejected',
    read: true
  },
  {
    id: 97,
    name: 'Eve Gray',
    message: 'has cancelled a Flight Request',
    time: '30m',
    status: 'rejected',
    read: false
  },
  {
    id: 98,
    name: 'Frank Red',
    message: 'has updated a Flight Request',
    time: '1h',
    status: 'pending',
    read: false
  },
  {
    id: 99,
    name: 'John Doe',
    message: 'has cancelled a Flight Request',
    time: '5d',
    status: 'approved',
    read: true
  },
  {
    id: 100,
    name: 'Sybil Violet',
    message: 'has updated a Flight Request',
    time: '3d',
    status: 'rejected',
    read: false
  }
]

export default notifications;