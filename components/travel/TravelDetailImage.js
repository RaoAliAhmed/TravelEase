import React from 'react';
import Image from 'next/image';

export default function TravelDetailImage({ 
  imageUrl,
  alt,
  type
}) {
  return (
    <div className="relative h-64 w-full">
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </div>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 66vw"
          className="object-cover"
          priority
        />
      )}
    </div>
  );
} 