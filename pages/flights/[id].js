// pages/flights/[id].js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import TravelDetailHeader from '@/components/travel/TravelDetailHeader';
import TravelDetailImage from '@/components/travel/TravelDetailImage';
import TravelDetailInfo from '@/components/travel/TravelDetailInfo';
import TravelDetailBooking from '@/components/travel/TravelDetailBooking';
import { useFlight } from '@/context/FlightContext';

export default function FlightDetail({ flight }) {
  const router = useRouter();
  const { setFlight } = useFlight();

  useEffect(() => {
    if (flight) {
      setFlight(flight);
    }
  }, [flight]);

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Flight Not Found</h1>
        <p className="text-gray-600 mb-6">The flight you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/flights')}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Back to Flights
        </button>
      </div>
    );
  }

  const from = flight.from || flight.origin;
  const to = flight.to || flight.destination;
  const companyName = flight.airline;

  return (
    <div className="min-h-screen bg-gray-50">
      <TravelDetailHeader
        type="flight"
        color="pink"
        from={from}
        to={to}
        companyName={companyName}
        companyField="airline"
      />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TravelDetailImage imageUrl={flight.image} alt={`${from} to ${to}`} type="flight" />
            <TravelDetailInfo
              item={flight}
              type="flight"
              color="pink"
              showSeats={true}
              showCompany={true}
              companyField="airline"
            />
          </div>
          <div className="lg:col-span-1">
            <TravelDetailBooking
              item={flight}
              type="flight"
              color="pink"
              showClass={true}
              classes={['Economy', 'Business', 'First Class']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { id } = params;
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const response = await fetch(`${baseUrl}/api/flights/${id}`);

    if (!response.ok) return { props: { flight: null } };

    const flight = await response.json();

    return { props: { flight } };
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return { props: { flight: null } };
  }
}
