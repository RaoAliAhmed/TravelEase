import { useState } from 'react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { MongoClient, ObjectId } from 'mongodb';
import BookingSummary from '@/components/travel/BookingSummary';

export default function Bookings({ initialBookings }) {
  
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCancelBooking = async (bookingId, booking) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {

      const response = await fetch('/api/user/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel booking');
      }

    
      const itemDetails = booking.itemDetails;
      const passengers = booking.passengers;
      
      let updateEndpoint = '';
      let updateField = '';
      
      switch (booking.type) {
        case 'bus':
          updateEndpoint = `/api/buses/${booking.itemId}/seats`;
          updateField = 'seats';
          break;
        case 'flight':
          updateEndpoint = `/api/flights/${booking.itemId}/seats`;
          updateField = 'seats';
          break;
        case 'trip':
          updateEndpoint = `/api/trips/${booking.itemId}/spots`;
          updateField = 'availableSpots';
          break;
        default:
          throw new Error('Invalid booking type');
      }

      const currentValue = itemDetails[updateField];
      const newValue = currentValue + passengers;

      const updateResponse = await fetch(updateEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [updateField]: newValue
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update available seats/spots');
      }


      setBookings(bookings.map(b => 
        b.bookingId === bookingId 
          ? { ...b, status: 'cancelled' } 
          : b
      ));

      setSuccessMessage('Booking cancelled successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <>
      <Head>
        <title>My Bookings | Travel Booking</title>
      </Head>
      <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
            <Link href="/profile" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Back to Profile
            </Link>
          </div>

          {loading && (
            <div className="text-center py-4">
              <p>Processing your request...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
              <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Browse Travel Options
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                console.log(booking);
                const itemDetails = booking.itemDetails || {};
                const bookingType = booking.type;
        
                const color = bookingType === 'flight' ? 'pink' : bookingType === 'bus' ? 'blue' : 'green';
                const companyField = bookingType === 'flight' ? 'airline' : bookingType === 'bus' ? 'busCompany' : 'tourCompany';
                return (
                  <div key={booking.bookingId} className={`border rounded-lg overflow-hidden ${booking.status === 'cancelled' ? 'opacity-70' : ''}`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1">
                        <BookingSummary
                          item={itemDetails}
                          type={bookingType}
                          color={color}
                          showClass={!!itemDetails?.classes}
                          selectedClass={booking.selectedClass}
                          passengerCount={booking.passengers}
                          companyField={companyField}
                          totalPrice={booking.totalPrice}
                        />
                        {/* Contact Information Section */}
                        {booking.contactInfo && (
                          <div className="px-6 pb-4 pt-2 border-t border-gray-200">
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div className="mb-2 md:mb-0">
                                <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
                                <p className="text-gray-600">
                                  {booking.contactInfo.firstName} {booking.contactInfo.lastName}
                                </p>
                                <p className="text-gray-600">{booking.contactInfo.email}</p>
                                <p className="text-gray-600">{booking.contactInfo.phone}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-700">Address</h3>
                                <p className="text-gray-600">{booking.contactInfo.address}</p>
                                <p className="text-gray-600">
                                  {booking.contactInfo.city}, {booking.contactInfo.country} {booking.contactInfo.zipCode}
                                </p>
                              </div>
                            </div>
                            {booking.contactInfo.specialRequests && (
                              <div className="mt-2">
                                <h3 className="text-sm font-medium text-gray-700">Special Requests</h3>
                                <p className="text-gray-600">{booking.contactInfo.specialRequests}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 px-6 pb-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(booking.bookingId, booking)}
                              disabled={loading}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  try {
    const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
    const client = await MongoClient.connect(mongodbUri);
    const db = client.db("travel_booking");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { bookings: 1 } }
    );


    if (!user || !user.bookings) {

      if (user && !user.bookings) {
        await usersCollection.updateOne(
          { _id: new ObjectId(session.user.id) },
          { $set: { bookings: [] } }
        );
      }
      
      client.close();
      return {
        props: {
          initialBookings: []
        }
      };
    }

    const bookings = user?.bookings || [];
    

    const travelDb = client.db("travel_booking");
    

    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          let collectionName = booking.type + 's';
          if (booking.type === 'bus') collectionName = 'buses';
          const collection = travelDb.collection(collectionName);
          const item = await collection.findOne({ _id: new ObjectId(booking.itemId) });
          
          return {
            ...booking,
            itemDetails: item || { message: "Item details not found" }
          };
        } catch (error) {
          return {
            ...booking,
            itemDetails: { message: "Error fetching item details" }
          };
        }
      })
    );

    client.close();

    return {
      props: {
        initialBookings: JSON.parse(JSON.stringify(enhancedBookings)),
      },
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    
    return {
      props: {
        initialBookings: [],
        error: "Failed to load bookings"
      },
    };
  }
} 