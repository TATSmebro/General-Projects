import React, { useState, useEffect } from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const [inputValue, setInputValue] = useState(currentPage);

  useEffect(() => {
    setInputValue(currentPage);
  }, [currentPage]);

  // This only allows empty input or numbers to be typed in the input box
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  // If number is valid and within range set page else just current page
  const handleInputBlur = () => {
    const page = parseInt(inputValue, 10); //convert to int
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      // Reset to current page if invalid
      setInputValue(currentPage);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setInputValue(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setInputValue(currentPage + 1);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {/* Prev Arrow */}
      <button className="btn p-1" onClick={goToPrevPage} disabled={currentPage === 1}>
        <i className="bi bi-chevron-left"></i>
      </button>

      {/* Page Input */}
      <input  
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleInputBlur();
            e.target.blur(); // Optionally remove focus after pressing Enter
          }
        }}
        className="text-center fw-bold"
        style={{
          width: '35px',
          height: '35px',
          backgroundColor: '#ffd9b3',
          border: 'none',
          borderRadius: '8px',
          color: '#e67e22',
        }}
      />
     
      <span className="fw-medium">of {totalPages ? totalPages : 1}</span>

      {/* Next Arrow */}
      <button className="btn p-1" onClick={goToNextPage} disabled={currentPage === totalPages}>
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}

export default Pagination;
