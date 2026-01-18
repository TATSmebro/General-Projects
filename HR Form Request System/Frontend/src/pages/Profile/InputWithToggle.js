import { useState } from 'react';
import viewicon from '../../assets/ViewIcon.svg'; 

const InputWithToggle = ({
  value,
  onChange,
  placeholder = '',
  isPassword = false,
  readOnly = false,
  showConfirm = false,
  style = {},
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <input
        type={isPassword && !visible ? 'password' : 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          fontSize: '1rem',
          fontWeight: 450,
          width: '100%',
          border: readOnly ? '1px solid transparent' : '1px solid #ccc',
          padding: '0.3rem',
          backgroundColor: readOnly ? 'transparent' : 'white',
          color: 'black',
        }}
      />
      {isPassword && (
        <img
          src={viewicon}
          alt="toggle visibility"
          onClick={() => setVisible(!visible)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
          }}
        />
      )}
    </div>
  );
};

export default InputWithToggle;
