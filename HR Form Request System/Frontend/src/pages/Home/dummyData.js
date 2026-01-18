const dummyData = [
    { id: 1, subject: '1', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 2, subject: '2', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 3, subject: '3', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 4, subject: '4', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 5, subject: '5', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 6, subject: '6', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 7, subject: '7', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 8, subject: '8', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 9, subject: '9', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 10, subject: '10', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 11, subject: '11', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 12, subject: '12', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 13, subject: '13', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 14, subject: '14', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 15, subject: '15', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 16, subject: '16', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },   
    { id: 17, subject: '17', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 18, subject: '18', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 19, subject: '19', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 20, subject: '20', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 1, subject: '1', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 2, subject: '2', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 3, subject: '3', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 4, subject: '4', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 5, subject: '5', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 6, subject: '6', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 7, subject: '7', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 8, subject: '8', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 9, subject: '9', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 10, subject: '10', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 11, subject: '11', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 12, subject: '12', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    { id: 13, subject: '13', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 14, subject: '14', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 15, subject: '15', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 16, subject: '16', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },   
    { id: 17, subject: '17', date: '6/24/2025', formType: 'Flight Request', status: 'Draft' },
    { id: 18, subject: '18', date: '6/24/2025', formType: 'Flight Request', status: 'Pending' },
    { id: 19, subject: '19', date: '6/24/2025', formType: 'Flight Request', status: 'Rejected' },
    { id: 20, subject: '20', date: '6/24/2025', formType: 'Flight Request', status: 'Approved' },
    
];


const dummyData2 = [
    {
      id: 1,
      subject: 'Request #1',
      date: '11/4/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 2,
      subject: 'Request #2',
      date: '12/13/2024',
      formType: 'Leave Request',
      status: 'Rejected'
    },
    {
      id: 3,
      subject: 'Request #3',
      date: '8/6/2025',
      formType: 'Equipment Request',
      status: 'Rejected'
    },
    {
      id: 4,
      subject: 'Request #4',
      date: '3/26/2025',
      formType: 'Grievance Form',
      status: 'Approved'
    },
    {
      id: 5,
      subject: 'Request #5',
      date: '3/29/2025',
      formType: 'Grievance Form',
      status: 'Rejected'
    },
    {
      id: 6,
      subject: 'Request #6',
      date: '8/30/2025',
      formType: 'Equipment Request',
      status: 'Pending'
    },
    {
      id: 7,
      subject: 'Request #7',
      date: '2/17/2024',
      formType: 'Leave Request',
      status: 'Draft'
    },
    {
      id: 8,
      subject: 'Request #8',
      date: '6/25/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 9,
      subject: 'Request #9',
      date: '3/18/2025',
      formType: 'Leave Request',
      status: 'Approved'
    },
    {
      id: 10,
      subject: 'Request #10',
      date: '6/26/2024',
      formType: 'Leave Request',
      status: 'Pending'
    },
    {
      id: 11,
      subject: 'Request #11',
      date: '10/2/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 12,
      subject: 'Request #12',
      date: '12/23/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 13,
      subject: 'Request #13',
      date: '1/2/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 14,
      subject: 'Request #14',
      date: '3/23/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 15,
      subject: 'Request #15',
      date: '8/14/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 16,
      subject: 'Request #16',
      date: '7/11/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 17,
      subject: 'Request #17',
      date: '1/2/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 18,
      subject: 'Request #18',
      date: '6/10/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 19,
      subject: 'Request #19',
      date: '12/23/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 20,
      subject: 'Request #20',
      date: '5/10/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 21,
      subject: 'Request #21',
      date: '10/4/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 22,
      subject: 'Request #22',
      date: '3/26/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 23,
      subject: 'Request #23',
      date: '6/3/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 24,
      subject: 'Request #24',
      date: '11/22/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 25,
      subject: 'Request #25',
      date: '1/17/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 26,
      subject: 'Request #26',
      date: '5/24/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 27,
      subject: 'Request #27',
      date: '12/9/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 28,
      subject: 'Request #28',
      date: '11/27/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 29,
      subject: 'Request #29',
      date: '2/21/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 30,
      subject: 'Request #30',
      date: '6/3/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 31,
      subject: 'Request #31',
      date: '9/11/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 32,
      subject: 'Request #32',
      date: '3/1/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 33,
      subject: 'Request #33',
      date: '1/4/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 34,
      subject: 'Request #34',
      date: '12/14/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 35,
      subject: 'Request #35',
      date: '4/14/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 36,
      subject: 'Request #36',
      date: '11/7/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 37,
      subject: 'Request #37',
      date: '9/17/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 38,
      subject: 'Request #38',
      date: '3/4/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 39,
      subject: 'Request #39',
      date: '11/27/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 40,
      subject: 'Request #40',
      date: '1/23/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 41,
      subject: 'Request #41',
      date: '10/13/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 42,
      subject: 'Request #42',
      date: '5/31/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 43,
      subject: 'Request #43',
      date: '1/16/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 44,
      subject: 'Request #44',
      date: '2/23/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 45,
      subject: 'Request #45',
      date: '8/8/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 46,
      subject: 'Request #46',
      date: '1/19/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 47,
      subject: 'Request #47',
      date: '6/10/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 48,
      subject: 'Request #48',
      date: '3/26/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 49,
      subject: 'Request #49',
      date: '2/28/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 50,
      subject: 'Request #50',
      date: '2/1/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 51,
      subject: 'Request #51',
      date: '1/4/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 52,
      subject: 'Request #52',
      date: '3/4/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 53,
      subject: 'Request #53',
      date: '11/12/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 54,
      subject: 'Request #54',
      date: '1/26/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 55,
      subject: 'Request #55',
      date: '5/13/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 56,
      subject: 'Request #56',
      date: '4/9/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 57,
      subject: 'Request #57',
      date: '4/21/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 58,
      subject: 'Request #58',
      date: '1/17/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 59,
      subject: 'Request #59',
      date: '8/27/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 60,
      subject: 'Request #60',
      date: '7/27/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 61,
      subject: 'Request #61',
      date: '1/2/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 62,
      subject: 'Request #62',
      date: '1/15/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 63,
      subject: 'Request #63',
      date: '11/21/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 64,
      subject: 'Request #64',
      date: '12/12/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 65,
      subject: 'Request #65',
      date: '7/9/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 66,
      subject: 'Request #66',
      date: '2/16/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 67,
      subject: 'Request #67',
      date: '4/20/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 68,
      subject: 'Request #68',
      date: '11/6/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 69,
      subject: 'Request #69',
      date: '11/10/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 70,
      subject: 'Request #70',
      date: '5/22/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 71,
      subject: 'Request #71',
      date: '9/22/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 72,
      subject: 'Request #72',
      date: '8/27/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 73,
      subject: 'Request #73',
      date: '9/12/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 74,
      subject: 'Request #74',
      date: '5/19/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 75,
      subject: 'Request #75',
      date: '4/6/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 76,
      subject: 'Request #76',
      date: '7/21/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 77,
      subject: 'Request #77',
      date: '9/16/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 78,
      subject: 'Request #78',
      date: '7/21/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 79,
      subject: 'Request #79',
      date: '6/19/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 80,
      subject: 'Request #80',
      date: '2/22/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 81,
      subject: 'Request #81',
      date: '1/26/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 82,
      subject: 'Request #82',
      date: '9/15/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 83,
      subject: 'Request #83',
      date: '1/4/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 84,
      subject: 'Request #84',
      date: '2/15/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 85,
      subject: 'Request #85',
      date: '7/24/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 86,
      subject: 'Request #86',
      date: '7/18/2024',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 87,
      subject: 'Request #87',
      date: '7/5/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 88,
      subject: 'Request #88',
      date: '12/26/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 89,
      subject: 'Request #89',
      date: '10/1/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 90,
      subject: 'Request #90',
      date: '1/2/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 91,
      subject: 'Request #91',
      date: '11/24/2024',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 92,
      subject: 'Request #92',
      date: '1/16/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 93,
      subject: 'Request #93',
      date: '1/10/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 94,
      subject: 'Request #94',
      date: '2/28/2024',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 95,
      subject: 'Request #95',
      date: '2/11/2025',
      formType: 'Flight Request',
      status: 'Draft'
    },
    {
      id: 96,
      subject: 'Request #96',
      date: '10/3/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 97,
      subject: 'Request #97',
      date: '6/10/2025',
      formType: 'Flight Request',
      status: 'Pending'
    },
    {
      id: 98,
      subject: 'Request #98',
      date: '4/26/2025',
      formType: 'Flight Request',
      status: 'Rejected'
    },
    {
      id: 99,
      subject: 'Request #99',
      date: '7/14/2025',
      formType: 'Flight Request',
      status: 'Approved'
    },
    {
      id: 100,
      subject: 'Request #100',
      date: '2/26/2024',
      formType: 'Flight Request',
      status: 'Rejected'
    }
  ]
export default dummyData2;
