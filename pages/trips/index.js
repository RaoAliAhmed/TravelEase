import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchHeader from '@/components/travel/SearchHeader';
import TravelList from '@/components/travel/TravelList';
import { connectToDatabase } from '@/lib/mongodb';

export default function Trips({ trips }) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  

  const filteredTrips = trips.filter(trip => 
    (trip.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader
        title="Find and Book Trips"
        subtitle="Discover amazing travel packages and adventures"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        bgColor="green"
        placeholder="Search by name, destination..."
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TravelList
          items={sortedTrips}
          type="trip"
          color="green"
          showSeats={false}
          showCompany={false}
          emptyMessage="No trips found matching your search."
        />
      </div>
      
      {/* Back to home button */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { db } = await connectToDatabase();
    const trips = await db.collection('trips').find({}).toArray();
    

    const serializedTrips = JSON.parse(JSON.stringify(trips, (key, value) => {
      if (key === '_id') return value.toString();
      return value;
    }));
    
    return {
      props: { trips: serializedTrips },
      revalidate: 300 
    };
  } catch (error) {
    console.error('Error fetching trips:', error);
    return {
      props: { trips: [] },
      revalidate: 60
    };
  }
} 