import React, { useState } from 'react'

export default function ReadMore({ text, maxLength = 120 }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text || text.length <= maxLength) {
    return <span>{text}</span>
  }

  return (
    <span>
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      {' '}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          color: '#00a8ff',
          cursor: 'pointer',
          padding: 0,
          marginLeft: '0.25rem',
          textDecoration: 'underline',
          fontSize: 'inherit',
          fontWeight: 'inherit'
        }}
      >
        {isExpanded ? 'Read less' : 'Read more'}
      </button>
    </span>
  )
}
