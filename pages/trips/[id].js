// pages/trips/[id].js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import TravelDetailHeader from '@/components/travel/TravelDetailHeader';
import TravelDetailImage from '@/components/travel/TravelDetailImage';
import TravelDetailInfo from '@/components/travel/TravelDetailInfo';
import TravelDetailBooking from '@/components/travel/TravelDetailBooking';
import { useTrip } from '@/context/TripContext';

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
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const res = await fetch(`${baseUrl}/api/trips/${params.id}`);

    if (!res.ok) {
      return { props: { trip: null }, revalidate: 10 };
    }

    const trip = await res.json();

    return {
      props: { trip },
      revalidate: 10
    };
  } catch (error) {
    console.error("Error fetching trip:", error);
    return {
      props: { trip: null },
      revalidate: 10
    };
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}
