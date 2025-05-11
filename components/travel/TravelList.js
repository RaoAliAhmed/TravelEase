import React from 'react';
import TravelCard from './TravelCard';

export default function TravelList({ 
  items, 
  type,
  color = 'indigo',
  showSeats = false,
  showCompany = true,
  companyField = 'airline',
  emptyMessage = 'No items found matching your search.'
}) {
  if (!items || items.length === 0) {
    return (
      <div className="col-span-3 text-center py-10">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <TravelCard
          key={item._id}
          item={item}
          type={type}
          color={color}
          showSeats={showSeats}
          showCompany={showCompany}
          companyField={companyField}
        />
      ))}
    </div>
  );
} 