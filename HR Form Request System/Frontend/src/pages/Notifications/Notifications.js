import MainContainer from "../../components/MainContainer";
import { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import notifData from './dummyNotifs.js'; 
import image from '../../assets/PNGIcon.svg'

const filterOptions = ["All", "Read", "Unread"];

function Notifications() {
  // State for Visible Notifications
  const [visibleCount, setVisibleCount] = useState(15);
  const listRef = useRef(null);

  // Filter requests based on filters selected
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(notifData);
  const filteredRequests = notifications.filter((request) => {
    if (filter === "All") return true;
    if (filter === "Read") return request.read;
    if (filter === "Unread") return !request.read;
    return true;
  });

  const visibleRequests = filteredRequests.slice(0, visibleCount);

  return (
    <MainContainer>
      <div className="container mt-4" style={{ backgroundColor: "white", width: '50%', padding: '20px', borderRadius: '10px' }}>
        {/* Filter Buttons */}
        <div className="d-flex justify-content-start mb-3 " style={{ padding: '10px', borderRadius: '5px', backgroundColor: 'var(--tforange-color)' }}>
          {filterOptions.map((option) => (
            <button 
              key={option}
              className={`notif-filter-btn ${filter === option ? 'selected' : ''}`} 
              onClick={() => setFilter(option)}>
              {option}
            </button>
          ))}
        </div>

        {/* Request List */}
        <div className="list-group" ref={listRef}>
          {visibleRequests.map((request) => (
            <div
              key={request.id}
              className={`list-group-item d-flex align-items-center ${request.read ? 'read' : 'unread'} notification-item`}
              style={request.read ? { opacity: 0.6 } : { fontWeight: 'bold' }}
              onClick={() => {
                
                setNotifications((prev) => 
                    prev.map((item) => 
                        item.id === request.id ? { ...item, read: true } : item
                    )
                );
                setTimeout(() => {
                    // window.location.href = `/requests/${request.id}`;
                  }, 100);
            }}
              tabIndex={0}
              role="button"
            >
              {/* Image */}
              <img
                src={image}
                alt={request.name}
                className="rounded-circle"
                style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '15px' }}
              />
              <div>
                {/* Request Details */}
                <p className="mb-1">
                  <strong>{request.name}</strong> {request.message}
                </p>
                {/* time */}
                <small className="text-muted">{request.time}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredRequests.length && (
          <div className="text-center py-2">
            <button
              className="notif-filter-btn"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 15, filteredRequests.length))}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </MainContainer>
  );
}

export default Notifications;
