import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchHeader from '@/components/travel/SearchHeader';
import TravelList from '@/components/travel/TravelList';

export default function Trips({ initialTrips }) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [trips, setTrips] = useState(initialTrips);
  const [loading, setLoading] = useState(!initialTrips.length);
  const [error, setError] = useState('');
  
  // Fetch trips on page load
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        console.log('Fetching trips from API...');
        const response = await fetch('/api/trips');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response from API:', response.status, errorData);
          throw new Error(`Failed to fetch trips: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Trips fetched successfully:', data.length);
        setTrips(data);
        setError('');
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Filter trips based on search term
  const filteredTrips = trips.filter(trip => 
    (trip.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort trips based on selected criteria
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

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

export async function getServerSideProps() {
  try {
    // Get the absolute URL for the API endpoint
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create an API endpoint to get all trips
    const response = await fetch(`${baseUrl}/api/trips`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const trips = await response.json();
    
    return {
      props: {
        initialTrips: Array.isArray(trips) ? trips : []
      }
    };
  } catch (error) {
    console.error('Error fetching trips:', error);
    return {
      props: {
        initialTrips: []
      }
    };
  }
} 