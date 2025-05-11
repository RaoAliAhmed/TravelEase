import React from 'react';
import Link from 'next/link';

const colorClasses = {
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-100',
    hover: 'hover:text-white',
    backButton: 'text-blue-100 hover:text-white'
  },
  pink: {
    bg: 'bg-pink-600',
    text: 'text-pink-100',
    hover: 'hover:text-white',
    backButton: 'text-pink-100 hover:text-white'
  },
  green: {
    bg: 'bg-green-600',
    text: 'text-green-100',
    hover: 'hover:text-white',
    backButton: 'text-green-100 hover:text-white'
  }
};

export default function TravelDetailHeader({ 
  type,
  color = 'blue',
  from,
  to,
  companyName,
  companyField = 'airline'
}) {
  const colors = colorClasses[color] || colorClasses.blue;
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className={`${colors.bg} text-white py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <Link 
          href={`/${type}s`} 
          className={`inline-flex items-center ${colors.backButton} mb-4`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to {typeTitle}s
        </Link>
        <h1 className="text-3xl font-bold mb-2">{from} to {to}</h1>
        <p className={colors.text}>
          {typeTitle} {companyName ? `• ${companyName}` : ''}
        </p>
      </div>
    </div>
  );
} 