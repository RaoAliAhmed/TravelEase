
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import TravelDetailHeader from '@/components/travel/TravelDetailHeader';
import TravelDetailImage from '@/components/travel/TravelDetailImage';
import TravelDetailInfo from '@/components/travel/TravelDetailInfo';
import TravelDetailBooking from '@/components/travel/TravelDetailBooking';
import { useFlight } from '@/context/FlightContext';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

export async function getStaticPaths() {
  try {
    const { db } = await connectToDatabase();
    const flights = await db.collection('flights').find({}, { projection: { _id: 1 } }).toArray();
    
    const paths = flights.map(flight => ({
      params: { id: flight._id.toString() }
    }));
    
    return {
      paths,
      fallback: true 
    };
  } catch (error) {
    console.error('Error fetching flight paths:', error);
    return { paths: [], fallback: true };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return { props: { flight: null }, revalidate: 60 };
    }
    
    const { db } = await connectToDatabase();
    const flight = await db.collection('flights').findOne({ _id: new ObjectId(id) });
    
    if (!flight) {
      return { props: { flight: null }, revalidate: 60 };
    }
    

    const serializedFlight = JSON.parse(JSON.stringify(flight, (key, value) => {
      if (key === '_id') return value.toString();
      return value;
    }));
    
    return { 
      props: { flight: serializedFlight },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return { props: { flight: null }, revalidate: 60 };
  }
}