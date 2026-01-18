import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Form } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import './Calendar.scss';

function Calendar({setDateRange, setFilterValues, setDateType, dateRange}) {
  const [now, setNow] = useState(new Date());
  const [dateType, setDateTypeState] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const handleDateChange = (prev, update, dateType) => {
    const newValues = { ...prev };
    // Clear all date fields first
    newValues.submitted_start = "";
    newValues.submitted_end = "";
    newValues.departure_start = "";
    newValues.departure_end = "";
    newValues.return_start = "";
    newValues.return_end = "";
    newValues.start_business_start = "";
    newValues.start_business_end = "";
    newValues.end_business_start = "";
    newValues.end_business_end = "";

    // Set only the selected dateType fields
    if (dateType === "submitted") {
        newValues.submitted_start = update[0] ? update[0].toLocaleDateString('en-CA') : "";
        newValues.submitted_end = update[1] ? update[1].toLocaleDateString('en-CA') : "";
    } else if (dateType === "departure") {
        newValues.departure_start = update[0] ? update[0].toLocaleDateString('en-CA') : "";
        newValues.departure_end = update[1] ? update[1].toLocaleDateString('en-CA') : "";
    } else if (dateType === "return") {
        newValues.return_start = update[0] ? update[0].toLocaleDateString('en-CA') : "";
        newValues.return_end = update[1] ? update[1].toLocaleDateString('en-CA') : "";
    } else if (dateType === "business_start") {
        newValues.start_business_start = update[0] ? update[0].toLocaleDateString('en-CA') : "";
        newValues.start_business_end = update[1] ? update[1].toLocaleDateString('en-CA') : "";
    } else if (dateType === "business_end") {
        newValues.end_business_start = update[0] ? update[0].toLocaleDateString('en-CA') : "";
        newValues.end_business_end = update[1] ? update[1].toLocaleDateString('en-CA') : "";
    }
    return newValues;
  }

  const handleClearCalendar = (prev, dateType) => {
    
    const newValues = { ...prev };
    
    if (dateType === "submitted") {
        newValues.submitted_start = "";
        newValues.submitted_end = "";
    } else if (dateType === "departure") {
        newValues.departure_start = "";
        newValues.departure_end = "";
    } else if (dateType === "return") {
        newValues.return_start = "";
        newValues.return_end = "";
    } else if (dateType === "business_start") {
        newValues.start_business_start = "";
        newValues.start_business_end = "";
    } else if (dateType === "business_end") {
        newValues.end_business_start = "";
        newValues.end_business_end = "";
    }
    return newValues;
  }

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const [time, ampm] = timeString.split(' ');

  return (
    <div className="date-time-container">
      {/* Date and Time Column */}
      <div className="card-container">
          {/* Date */}
          <div className='card card-date'>
              <span className="fw-semibold text-dark" style={{ fontSize: '22px' }}>{now.toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="fs-1 fw-bold" style={{ color: 'var(--tforange-color)' }}>{now.getDate()}</span>
              <span>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          {/* Time */}
          <div className='card card-time'>
              <span className="fs-1 fw-bold">{time}</span>            
              <span className="fs-3 fw-bold">{ampm}</span>
          </div>
      </div>

      {/* Calendar Date picker */}
      <div className="calendar-container">
        <div>
          <DatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(update) => {
                setDateRange(update);
                setFilterValues(prev => handleDateChange(prev, update, dateType));
              }}
              isClearable={true}
              inline
          />
        </div>
          
        <div className='button-dropdown-container'>
          
          {/* Date Type Drowpdown */}
          <div>
            <Form onChange={(e) => {
              const newDateType = e.target.value;
              setDateType(newDateType);
              setDateTypeState(newDateType);
              setFilterValues(prev => handleDateChange(prev, dateRange, newDateType));
            }}>
              <Form.Group>
                <Form.Select className='calendar-dropdown'>
                  <option value=''>Select Date Type</option>
                  <option value='submitted'>Date Submitted</option>
                  <option value='departure'>Departure Date</option>
                  <option value='return'>Return Date</option>
                  <option value='business_start'>Start of Business</option>
                  <option value='business_end'>End of Business</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </div>

          {/* Clear Date Range Button */}
          {dateRange[0] && dateRange[1] && (
          <div>
            <button
              className="calendar-reset-btn"
              type="button"
              onClick={() => {
                setDateRange([null, null]);
                setFilterValues(prev => handleClearCalendar(prev, dateType));
              }}
            >
              Clear Date Range
            </button>
          </div>
          )}
        </div>            
      </div>
    </div>
  );
}

export default Calendar;