import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const colorClasses = {
  blue: {
    spinner: 'border-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-600 hover:text-blue-800'
  },
  pink: {
    spinner: 'border-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700',
    text: 'text-pink-600 hover:text-pink-800'
  },
  green: {
    spinner: 'border-green-600',
    button: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-600 hover:text-green-800'
  }
};

export default function BookingLayout({
  type,
  color = 'blue',
  item,
  title,
  children,
  loading = false,
  error = null,
  notFound = false,
  noAvailability = false,
  onBackClick
}) {
  const colors = colorClasses[color] || colorClasses.blue;
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.spinner}`}></div>
      </div>
    );
  }


  if (notFound || noAvailability) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {notFound ? `${typeTitle} Not Found` : 'No Availability'}
        </h1>
        <p className="text-gray-600 mb-6">
          {notFound 
            ? `The ${type} you're looking for doesn't exist or has been removed.`
            : `This ${type} is fully booked. Please check other available ${type}s.`
          }
        </p>
        <button 
          onClick={onBackClick}
          className={`${colors.button} text-white px-6 py-2 rounded-lg font-medium transition`}
        >
          Back to {typeTitle}s
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} | TravelEase</title>
      </Head>

      <div className="bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={onBackClick}
            className={`inline-flex items-center ${colors.text} mb-6`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to {typeTitle} Details
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  );
} 