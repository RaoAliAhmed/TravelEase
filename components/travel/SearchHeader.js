import React from 'react';

export default function SearchHeader({ 
  title, 
  subtitle, 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  bgColor = 'indigo',
  placeholder = 'Search by city, company...'
}) {
  return (
    <>
      {/* Header */}
      <div className={`bg-${bgColor}-600 text-white py-12 px-4`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className={`text-${bgColor}-100`}>{subtitle}</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white shadow-md py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={placeholder}
              className={`w-full px-4 text-black py-2 border rounded-lg focus:ring-2 focus:ring-${bgColor}-500 focus:border-${bgColor}-500 outline-none`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 text-sm">Sort by:</label>
            <select
              className={`px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-${bgColor}-500 focus:border-${bgColor}-500 outline-none`}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration (Shortest)</option>
              <option value="rating">Rating (Best)</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
} 