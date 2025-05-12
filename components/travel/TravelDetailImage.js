import React from 'react';
import Image from 'next/image';

export default function TravelDetailImage({ 
  imageUrl,
  alt,
  type
}) {
  // Use imageUrl if provided, otherwise check if there's an 'image' property in the parent component
  const imageSrc = imageUrl || `/images/${type}-placeholder.jpg`;
  
  return (
    <div className="relative h-64 w-full">
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </div>
      {imageSrc && (
        <Image
          src={imageSrc}
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