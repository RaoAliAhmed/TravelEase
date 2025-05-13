// pages/trips/[id].js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import TravelDetailHeader from '@/components/travel/TravelDetailHeader';
import TravelDetailImage from '@/components/travel/TravelDetailImage';
import TravelDetailInfo from '@/components/travel/TravelDetailInfo';
import TravelDetailBooking from '@/components/travel/TravelDetailBooking';
import { useTrip } from '@/context/TripContext';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function TripDetail({ trip }) {
  const router = useRouter();
  const { setTrip } = useTrip();

  useEffect(() => {
    if (trip) {
      setTrip(trip);
    }
  }, [trip]);

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Trip Not Found</h1>
        <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/trips')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const from = trip.from || trip.origin;
  const to = trip.to || trip.destination;
  const companyName = trip.name;

  return (
    <div className="min-h-screen bg-gray-50">
      <TravelDetailHeader
        type="trip"
        color="green"
        from={from}
        to={to}
        companyName={companyName}
      />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TravelDetailImage
              imageUrl={trip.image}
              alt={`${from} to ${to}`}
              type="trip"
            />
            <TravelDetailInfo
              item={trip}
              type="trip"
              color="green"
              showSeats={false}
              showCompany={false}
            />
          </div>
          <div className="lg:col-span-1">
            <TravelDetailBooking
              item={trip}
              type="trip"
              color="green"
              showClass={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return { props: { trip: null }, revalidate: 60 };
    }
    
    const { db } = await connectToDatabase();
    const trip = await db.collection('trips').findOne({ _id: new ObjectId(id) });
    
    if (!trip) {
      return { props: { trip: null }, revalidate: 60 };
    }
    
    // Convert ObjectId to string for serialization
    const serializedTrip = JSON.parse(JSON.stringify(trip, (key, value) => {
      if (key === '_id') return value.toString();
      return value;
    }));
    
    return { 
      props: { trip: serializedTrip },
      revalidate: 60 // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching trip details:', error);
    return { props: { trip: null }, revalidate: 60 };
  }
}

export async function getStaticPaths() {
  try {
    const { db } = await connectToDatabase();
    const trips = await db.collection('trips').find({}, { projection: { _id: 1 } }).toArray();
    
    const paths = trips.map(trip => ({
      params: { id: trip._id.toString() }
    }));
    
    return {
      paths,
      fallback: true // Allow generation of new pages on-demand
    };
  } catch (error) {
    console.error('Error fetching trip paths:', error);
    return { paths: [], fallback: true };
  }
}
