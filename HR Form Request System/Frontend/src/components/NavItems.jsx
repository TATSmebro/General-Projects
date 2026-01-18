
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import homeIcon from '../assets/HomeIcon.svg';
import notificationsIcon from '../assets/NotificationsIcon.svg';
import accountsIcon from '../assets/AccountsIcon.svg';
import image from '../assets/PNGIcon.svg';

// import data
import dummyNotifs from './dummyNotifs.js';
import { useUserCredentials } from '../context/UserCredentialsContext.js';


function NavItems() {
  const { userCredentials, userCredentialsLoading, userCredentialsError } = useUserCredentials();

  // constants
  const icon_size = 30;
  const profile_icon_size = 40;
  const profile_name = userCredentialsLoading ? 'Loading User...' : `${userCredentials.UserProfile.first_name} ${userCredentials.UserProfile.last_name}`;
  const profile_role = userCredentialsLoading ? '' : userCredentials.UserProfile.Role.role_name;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const notifCount = dummyNotifs.filter(n => !n.read).length

  const handleOutsideClick = (e) => {
    if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
      setShowUserMenu(false);
    }
    if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
      setShowNotifMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
      <>
      <nav className="d-flex align-items-center gap-5">
        
        <Link to="/">
          <img src={homeIcon} width={icon_size} alt="Display Home Button" style={{ cursor: 'pointer' }} />
        </Link>
        
        <Link to="/accounts">
          <img src={accountsIcon} width={icon_size} alt="Display Accounts Button" style={{ cursor: 'pointer' }} />
        </Link>
        
        
        <div ref={notifMenuRef} className={`custom-dropdown-notif ${showNotifMenu ? 'open' : ''}`}>
          <div className="dropdown-toggle" onClick={() => setShowNotifMenu(!showNotifMenu)}>
            {/* <img src={notificationsIcon} width={icon_size} alt="Display Notifications Button" /> */}
         
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={notificationsIcon} width={icon_size} alt="Display Notifications Button" />

              {/* Notification dot */}
              {notifCount > 0 && (
                <span
                  className="notif-badge"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: 'translate(50%, -50%)',
                    backgroundColor: 'orange',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0.2em 0.5em',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    minWidth: '18px',
                    textAlign: 'center'
                  }}
                >
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </div>
          
          
          
          </div>

          <div className="dropdown-menu" style={{ maxHeight: '500px', overflowY: 'auto', minWidth: '300px' }}>
            {dummyNotifs.slice(0, 10).map((notif, idx) => (
              <div
                key={idx}
                className="dropdown-item text-muted"
                style={{
                  cursor: 'pointer',
                  padding: '0.5rem 1rem'
                }}
              >
                {notif.message}
              </div>
            ))}

            <div className="dropdown-divider" style={{ borderTop: '1px solid #eee', margin: '0.5rem 0' }}></div>

            <Link
              className="dropdown-item"
              to="/notifications"
              style={{
                fontWeight: 400,
                color: 'var(--tforange-color)',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '0.5rem 1rem'
              }}
            >
              View All Notifications →
            </Link>
          </div>
        </div>


        {/* User Dropdown */}
        <div ref={userMenuRef} className={`custom-dropdown-profile ${showUserMenu ? 'open' : ''}`}>
          <div className="dropdown-toggle" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="d-flex align-items-center">
              <img src={image} width={profile_icon_size} height={profile_icon_size} className="me-2" alt="User" />
              <div className="d-flex flex-column text-start">
                <span className="fw-bold">{profile_name}</span>
                <span className="text-muted">{profile_role}</span>
              </div>
            </div>
          </div>
          <div className="dropdown-menu">
            <Link to="/profile">Profile</Link>
            <Link to="/login">Log Out</Link>
          </div>
        </div>

      </nav>
      </>
  );
}

export default NavItems;
