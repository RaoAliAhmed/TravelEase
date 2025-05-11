import React from 'react';

export default function TravelFlightFields({ formData, handleChange }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Flight Number</label>
          <input
            type="text"
            name="flightNumber"
            value={formData.flightNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-black-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Airline</label>
          <input
            type="text"
            name="airline"
            value={formData.airline}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-black-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-black-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Features (comma-separated)</label>
        <input
          type="text"
          name="features"
          value={formData.features}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-black-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="WiFi, Extra Legroom, Meal Service"
        />
      </div>
    </>
  );
} 