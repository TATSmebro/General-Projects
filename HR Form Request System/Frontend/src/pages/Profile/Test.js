import React, { useState } from 'react';

function Test() {
  const [isEditing, setIsEditing] = useState(false);

  // Sample state values
  const [email, setEmail] = useState('user@example.com');
  const [contact, setContact] = useState('+63-912-345-6789');

  // Store original values when entering edit mode
  const [originalEmail, setOriginalEmail] = useState(email);
  const [originalContact, setOriginalContact] = useState(contact);

  // Save changes (example)
  const confirmEdit = () => {
    // Here you can save to localStorage or a database
    setIsEditing(false); // go back to view mode
  };

  // Cancel edit
  const cancelEdit = () => {
    setEmail(originalEmail);
    setContact(originalContact);
    setIsEditing(false); // just go back to view mode
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h2>Profile</h2>

      {!isEditing ? (
        // --- View Mode ---
        <div>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Contact:</strong> {contact}</p>
          <button onClick={() => {
            setOriginalEmail(email);
            setOriginalContact(contact);
            setIsEditing(true);
          }}>Edit</button>
        </div>
      ) : (
        // --- Edit Mode ---
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email: </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Contact: </label>
            <input
              type="text"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          </div>
          <button onClick={confirmEdit}>Confirm</button>
          <button onClick={cancelEdit} style={{ marginLeft: '1rem' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Test;

