export default function filterData(item, filterValues) {
    // If filterValues is not provided, always return true
    if (!filterValues) return true;
    
    // Example for form_type and date range
    const formTypeMatch =
        !filterValues.form_type || item.formType === filterValues.form_type;

    const dateMatch =
        (!filterValues.submitted_start || new Date(item.date) >= new Date(filterValues.submitted_start)) &&
        (!filterValues.submitted_end || new Date(item.date) <= new Date(filterValues.submitted_end));

    const statusMatch = 
        !filterValues.status || item.status === filterValues.status;

    // Add more filters as needed, following the same pattern:
    // (!filterValues.FIELD || item.FIELD === filterValues.FIELD)

    return formTypeMatch && dateMatch && statusMatch;
}

//----FilterValues FIELD----
// requestor: '',
// requested_for: '',
// department: '',
// form_type: '',
// status: '',
// purpose: '',
// submitted_start: '',
// submitted_end: '',
// departure_city: '',
// departure_start: '',
// departure_end: '',
// return_city: '',
// return_start: '',
// return_end: '',
// start_business_start: '',
// start_business_end: '',
// end_business_start: '',
// end_business_end: '',
// approved_by: ''
//--------------------------

//--------Data FIELD--------
// {
//     id: 1,
//     subject: 'Request #1',
//     date: '11/4/2025',
//     formType: 'Flight Request',
//     status: 'Approved'
// }
//--------------------------