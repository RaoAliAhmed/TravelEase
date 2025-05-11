import { useRouter } from 'next/router';
import TravelDetailHeader from '@/components/travel/TravelDetailHeader';
import TravelDetailImage from '@/components/travel/TravelDetailImage';
import TravelDetailInfo from '@/components/travel/TravelDetailInfo';
import TravelDetailBooking from '@/components/travel/TravelDetailBooking';

export default function BusDetail({ bus }) {
  const router = useRouter();
  
  // If the page is still generating via SSR
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If bus doesn't exist
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

  // Handle different field naming conventions
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
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bus Details */}
          <div className="lg:col-span-2">
            <TravelDetailImage
              imageUrl={bus.image}
              alt={`${from} to ${to}`}
              type="buse"
            />
            <TravelDetailInfo
              item={bus}
              type="buse"
              color="blue"
              showSeats={true}
              showCompany={true}
              companyField="busCompany"
            />
          </div>
          
          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <TravelDetailBooking
              item={bus}
              type="buse"
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

// Use SSR for bus details since they can change
export async function getServerSideProps({ params }) {
  try {
    const { id } = params;
    
    // Get the absolute URL for the API endpoint
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Fetch bus details
    const response = await fetch(`${baseUrl}/api/buses/${id}`);
    
    if (!response.ok) {
      return {
        props: {
          bus: null
        }
      };
    }
    
    const bus = await response.json();
    
    return {
      props: {
        bus
      }
    };
  } catch (error) {
    console.error('Error fetching bus:', error);
    return {
      props: {
        bus: null
      }
    };
  }
} 