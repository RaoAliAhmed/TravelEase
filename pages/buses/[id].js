// pages/buses/[id].js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import TravelDetailHeader from '@/components/travel/TravelDetailHeader';
import TravelDetailImage from '@/components/travel/TravelDetailImage';
import TravelDetailInfo from '@/components/travel/TravelDetailInfo';
import TravelDetailBooking from '@/components/travel/TravelDetailBooking';
import { useBus } from '@/context/BusContext';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function BusDetailPage({ bus }) {
  const router = useRouter();
  const { setBus } = useBus();

  useEffect(() => {
    if (bus) setBus(bus);
  }, [bus, setBus]);

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Bus Not Found</h1>
        <p className="text-gray-600 mb-6">The bus you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/buses')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Back to Buses
        </button>
      </div>
    );
  }

  const from = bus.from || bus.origin;
  const to = bus.to || bus.destination;
  const companyName = bus.busCompany;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TravelDetailHeader
        type="bus"
        color="blue"
        from={from}
        to={to}
        companyName={companyName}
        companyField="busCompany"
      />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TravelDetailImage
              imageUrl={bus.image}
              alt={`${from} to ${to}`}
              type="bus"
            />
            <TravelDetailInfo
              item={bus}
              type="bus"
              color="blue"
              showSeats={true}
              showCompany={true}
              companyField="busCompany"
            />
          </div>
          <div className="lg:col-span-1">
            <TravelDetailBooking
              item={bus}
              type="bus"
              color="blue"
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
    const buses = await db.collection('buses').find({}, { projection: { _id: 1 } }).toArray();
    
    const paths = buses.map(bus => ({
      params: { id: bus._id.toString() }
    }));
    
    return {
      paths,
      fallback: true // Set to true to allow generation of new pages on-demand
    };
  } catch (error) {
    console.error('Error fetching bus paths:', error);
    return { paths: [], fallback: true };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return { props: { bus: null }, revalidate: 60 };
    }
    
    const { db } = await connectToDatabase();
    const bus = await db.collection('buses').findOne({ _id: new ObjectId(id) });
    
    if (!bus) {
      return { props: { bus: null }, revalidate: 60 };
    }
    
    // Convert ObjectId to string for serialization
    const serializedBus = JSON.parse(JSON.stringify(bus, (key, value) => {
      if (key === '_id') return value.toString();
      return value;
    }));
    
    return { 
      props: { bus: serializedBus },
      revalidate: 60 // Revalidate every 60 seconds (ISR)
    };
  } catch (error) {
    console.error('Error fetching bus details:', error);
    return { props: { bus: null }, revalidate: 60 };
  }
}
