import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchHeader from '@/components/travel/SearchHeader';
import TravelList from '@/components/travel/TravelList';

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

// Use SSR for buses since they can change frequently
export async function getServerSideProps() {
  try {
    // Get the absolute URL for the API endpoint
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create an API endpoint to get all buses
    const response = await fetch(`${baseUrl}/api/buses`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const buses = await response.json();
    
    return {
      props: {
        buses: Array.isArray(buses) ? buses : []
      }
    };
  } catch (error) {
    console.error('Error fetching buses:', error);
    return {
      props: {
        buses: []
      }
    };
  }
} 