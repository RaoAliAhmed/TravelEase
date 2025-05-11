import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchHeader from '@/components/travel/SearchHeader';
import TravelList from '@/components/travel/TravelList';

export default function Flights({ flights }) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  
  // Filter flights based on search term
  const filteredFlights = flights.filter(flight => 
    (flight.from || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flight.to || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flight.airline || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort flights based on selected criteria
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader
        title="Find and Book Flights"
        subtitle="Compare prices and find the best deals on flights"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        bgColor="pink"
        placeholder="Search by city, airline..."
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TravelList
          items={sortedFlights}
          type="flight"
          color="pink"
          showSeats={true}
          showCompany={true}
          companyField="airline"
          emptyMessage="No flights found matching your search."
        />
      </div>
      
      {/* Back to home button */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link href="/" className="inline-flex items-center text-pink-600 hover:text-pink-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Use SSR for flights since they can change frequently
export async function getServerSideProps() {
  try {
    // Get the absolute URL for the API endpoint
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create an API endpoint to get all flights
    const response = await fetch(`${baseUrl}/api/flights`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const flights = await response.json();
    
    return {
      props: {
        flights: Array.isArray(flights) ? flights : []
      }
    };
  } catch (error) {
    console.error('Error fetching flights:', error);
    return {
      props: {
        flights: []
      }
    };
  }
} 