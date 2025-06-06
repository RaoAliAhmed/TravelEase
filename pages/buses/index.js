import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchHeader from '@/components/travel/SearchHeader';
import TravelList from '@/components/travel/TravelList';
import { connectToDatabase } from '@/lib/mongodb';

export default function Buses({ buses }) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  
  // Filter buses based on search term
  const filteredBuses = buses.filter(bus => 
    (bus.from || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.to || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.busCompany || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort buses based on selected criteria
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader
        title="Find and Book Buses"
        subtitle="Compare prices and find the best deals on bus tickets"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        bgColor="blue"
        placeholder="Search by city, bus company..."
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TravelList
          items={sortedBuses}
          type="bus"
          color="blue"
          showSeats={true}
          showCompany={true}
          companyField="busCompany"
          emptyMessage="No buses found matching your search."
        />
      </div>
      
      {/* Back to home button */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Use ISR for buses listing page
export async function getStaticProps() {
  try {
    const { db } = await connectToDatabase();
    const buses = await db.collection('buses').find({}).toArray();
    
    // Serialize for JSON
    const serializedBuses = JSON.parse(JSON.stringify(buses, (key, value) => {
      if (key === '_id') return value.toString();
      return value;
    }));
    
    return {
      props: { buses: serializedBuses },
      revalidate: 300 // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error('Error fetching buses:', error);
    return {
      props: { buses: [] },
      revalidate: 60
    };
  }
} 