import React, { useState, useRef, useEffect } from 'react'

const MonthInput = ({
  value, onChange, setComponentValue, className = '',
  disabled = false, readOnly = false, id, name, placeholder, required, ...otherProps
}) => {
  const [isOpen, setIsOpen] = useState(false) // State to manage the visibility of the month picker
  const currentValue = value ? new Date(value + '-01') : new Date() // Current date value
  const [year, setYear] = useState(currentValue.getFullYear()) // State to manage the selected year
  const popoverRef = useRef(null) // Ref to handle click outside

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ] // Array of month names

  useEffect(() => {
    // Effect to handle click outside the popover
    const handleClickOutside = event => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Effect to update the year when the value changes
    if (value) {
      const date = new Date(value + '-01')
      setYear(date.getFullYear())
    }
  }, [value])

  const formatDate = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}` // Function to format the date

  const handleMonthSelect = monthIndex => {
    // Function to handle month selection
    const formattedDate = formatDate(year, monthIndex)
    onChange({ target: { value: formattedDate, name, id } })
    if (setComponentValue) setComponentValue(formattedDate)
    setIsOpen(false)
  }

  const displayValue = value ? `${months[parseInt(value.split('-')[1]) - 1]} ${value.split('-')[0]}` : '' // Display value for the selected month
  const isDisabled = disabled || readOnly // Determine if the input is disabled

  const buttonStyle = {
    padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px',
    background: 'white', cursor: 'pointer'
  } // Common button style

  return (
    <div className="month-picker-container" ref={popoverRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`month-picker-button ${className}`}
        style={{ ...buttonStyle, width: '100%', background: isDisabled ? '#f5f5f5' : 'white', cursor: isDisabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: isDisabled ? '#666' : 'inherit' }}
      >
        <span>{displayValue || placeholder || 'Sélectionner un mois'}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginLeft: '8px' }}>
          <path d="M3 4h10v1H3V4zm0 3h10v1H3V7zm0 3h10v1H3v-1z" fill="currentColor" />
        </svg>
      </button>

      {isOpen && !isDisabled && (
        <div className="month-picker-popup" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: '0', width: '280px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <div style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button type="button" onClick={() => setYear(year - 1)} style={buttonStyle}>←</button>
              <span style={{ fontWeight: 'bold' }}>{year}</span>
              <button type="button" onClick={() => setYear(year + 1)} style={buttonStyle}>→</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {months.map((month, index) => (
                <button
                  type="button"
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  style={{ ...buttonStyle, padding: '8px', background: value === formatDate(year, index) ? '#007bff' : 'white', color: value === formatDate(year, index) ? 'white' : 'inherit', transition: 'all 0.2s' }}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <input type="month" id={id} name={name} value={value || ''} required={required} style={{ display: 'none' }} {...otherProps} />
    </div>
  )
}

export default MonthInput