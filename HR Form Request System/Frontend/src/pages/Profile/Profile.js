import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import homeicon from '../../assets/PNGIcon.svg';
import editicon from '../../assets/EditIcon.svg';
import confirmicon from '../../assets/ConfirmIcon.svg';
import closeicon from '../../assets/CloseIcon.svg';
import MainContainer from '../../components/MainContainer';
import ProfileLayout from './ProfileLayout';
import InputWithToggle from './InputWithToggle';

const profileIconSize = 300;
const smallIconSize = 20;

const initialUserProfile = {
  username: "Rayu Ma Masakit",
  role: "Employee",
  department: "Educational and Technological Services",
  email: "rmmasakit@techfactors.com",
  contactNumber: "+639775640805",
  password: "bananabread1"
};

const ProfileSidebar = ({ username, role }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <img src={homeicon} alt="home icon" width={profileIconSize} height={profileIconSize} className="mb-2" />
    <p style={{ marginTop: '50px', marginBottom: '0', fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>{username}</p>
    <p className="text-muted" style={{ textAlign: 'center' }}>{role}</p>
  </div>
);

const ViewForm = ({ value, isPassword, isLocked, showModal, setShowModal }) => {
  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => setShowModal(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLocked, setShowModal]);

  return (
    <div style={{ width: '40%' }}>
      <InputWithToggle
        value={value}
        isPassword={isPassword}
        readOnly
      />
      {isLocked && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header>
            <Modal.Title>Kindly wait for the admin to confirm your password change.</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

const EditForm = ({ value, onChange, isPassword, confirmValue, onConfirmChange }) => {
  return (
    <>
      <div style={{ width: '40%', marginBottom: isPassword ? '1rem' : '0' }}>
        <InputWithToggle
          value={value}
          onChange={onChange}
          isPassword={isPassword}
        />
      </div>
      {isPassword && (
        <div style={{ width: '40%' }}>
          <InputWithToggle
            value={confirmValue}
            onChange={onConfirmChange}
            placeholder="Confirm Password"
            isPassword
          />
        </div>
      )}
    </>
  );
};

const ProfileInfoGroup = ({ label, value, isPassword, onChange, isEditing, confirmValue, onConfirmChange, isLocked, showModal, setShowModal }) => (
  <div className="info-group" style={{ marginBottom: '3rem' }}>
    <label style={{ fontSize: '1.2rem', color: '#EE9337', fontWeight: 'bold' }}>{label}</label>
    {isEditing
      ? <EditForm value={value} onChange={onChange} isPassword={isPassword} confirmValue={confirmValue} onConfirmChange={onConfirmChange} />
      : <ViewForm value={value} isPassword={isPassword} isLocked={isLocked} showModal={showModal} setShowModal={setShowModal}/>
    }
  </div>
);

const ButtonGroup = ({ onClick, buttonicon, text = "Edit", style }) => (
  <span onClick={onClick} style={{ ...style, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
    <img src={buttonicon} alt={text.toLowerCase()} width={smallIconSize} height={smallIconSize} />
    <span style={{ color: '#ee9337', marginLeft: '0.5rem' }}>{text}</span>
  </span>
);

const ProfileInfo = ({ userProfile, setUserProfile}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = (key) => (e) => {
    setTempProfile(prev => ({ ...prev, [key]: e.target.value }));
  };

  const isValidContactNumber = (contactNumber) => {
    const contactNumberPattern = /^(\+63|0)9\d{9}$/;
    return contactNumberPattern.test(contactNumber);
  };
  const isValidPassword = (password) => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/;
    return passwordPattern.test(password);
  };
  const handleConfirm = () => {
    if (!isValidContactNumber(tempProfile.contactNumber)) {
      setError("Invalid contact number format!");
      return;
    }

    if (!isValidPassword(tempProfile.password)) {
      setError("Password must be at least 12 characters long and contain at least one letter and one number!");
      return;
    }

    if (tempProfile.password === userProfile.password) {
      setUserProfile(tempProfile);
      setIsEditing(false);
      setConfirmPassword('');
      setError('');
    } else {
      if (tempProfile.password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      // setUserProfile(tempProfile); (Uncomment if no need for confirmation)
      setShowModal(true);
      setIsLocked(true);
      setIsEditing(false);
      setConfirmPassword('');
      setError('');
    }
  };

  const handleCancel = () => {
    setTempProfile(userProfile);
    setIsEditing(false);
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="profile-container" style={{ maxWidth: '1000px' }}>
      <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '0.1rem' }}>
        <h2 className="profile-title">Profile</h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {isEditing ? (
            <>
              <ButtonGroup onClick={handleConfirm} buttonicon={confirmicon} text="Confirm" />
              <ButtonGroup onClick={handleCancel} buttonicon={closeicon} text="Cancel" />
            </>
          ) : (
            <ButtonGroup onClick={() => setIsEditing(true)} buttonicon={editicon} text="Edit" />
          )}
        </span>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <ProfileInfoGroup label="DEPARTMENT" value={tempProfile.department} isEditing={false} />
        <ProfileInfoGroup label="EMAIL" value={tempProfile.email} isEditing={false} />
        <ProfileInfoGroup label="CONTACT NUMBER" value={tempProfile.contactNumber} onChange={handleChange('contactNumber')} isEditing={isEditing} />
        <ProfileInfoGroup label="PASSWORD" value={tempProfile.password} onChange={handleChange('password')} isEditing={isEditing && !isLocked} showModal={showModal} setShowModal={setShowModal} isPassword confirmValue={confirmPassword} onConfirmChange={(e) => setConfirmPassword(e.target.value)} isLocked={isLocked} setError={setError} />
      </div>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};


function Profile() {
  const [userProfile, setUserProfile] = useState(initialUserProfile);

  return (
    <MainContainer>
      <ProfileLayout
        sidebar={
          <ProfileSidebar username={userProfile.username} role={userProfile.role} />
        }
        main={
          <ProfileInfo userProfile={userProfile} setUserProfile={setUserProfile} />
        }
      />
    </MainContainer>
  );
}

export default Profile;



