import React from 'react';

const Logo = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'block' }}
  >
    {/* Base Structure: Represents the foundation/code */}
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#f1f5f9" />
    
    {/* Progress Path: Represents the preparation journey */}
    <path 
      d="M7 16V13C7 11.8954 7.89543 11 9 11H11C12.1046 11 13 10.1046 13 9V7" 
      stroke="#3b82f6" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    
    {/* Checkpoint/Goal: Represents the target (Placement/Success) */}
    <circle cx="13" cy="7" r="2.5" fill="#2563eb" />
    <circle cx="7" cy="16" r="1.5" fill="#94a3b8" />
  </svg>
);

export default Logo;
