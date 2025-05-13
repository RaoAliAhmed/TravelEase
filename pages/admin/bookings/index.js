import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { useState } from 'react';
import Head from 'next/head';
import { connectToDatabase } from '@/lib/mongodb';

export default function AdminBookings({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);

  const handleDelete = async (bookingId) => {
    const booking = bookings.find(b => b.bookingId === bookingId);
    if (!booking) return;
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    const res = await fetch('/api/admin/bookings/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.bookingId,
        type: booking.type,
        itemId: booking.itemId,
        passengers: booking.passengers,
        userEmail: booking.userEmail,
      }),
    });
    if (res.ok) {
      setBookings(bookings.filter(b => b.bookingId !== bookingId));
    }
  };

  const columns = [
    { key: 'userName', label: 'User', dataType: 'string' },
    { key: 'userEmail', label: 'Email', dataType: 'string' },
    { key: 'type', label: 'Type', dataType: 'string' },
    { key: 'bookedAt', label: 'Booked At', dataType: 'date' },
    { key: 'status', label: 'Status', dataType: 'string' },
    { key: 'passengers', label: 'Passengers', dataType: 'number' },
    { key: 'totalPrice', label: 'Total Price', dataType: 'price' },
    { key: 'contactInfo', label: 'Contact', dataType: 'string' },
    { key: 'selectedClass', label: 'Class', dataType: 'string' },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>All Bookings | Admin Dashboard</title>
      </Head>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        </div>
        <DataTable
          data={bookings}
          columns={columns}
          type="booking"
          actionPath="/admin"
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all users to extract bookings
    const users = await db.collection('users').find({}).toArray();
    
    // Extract bookings from all users and format them
    const allBookings = [];
    
    for (const user of users) {
      if (user.bookings && user.bookings.length > 0) {
        for (const booking of user.bookings) {
          let itemDetails = {};
          
          // Try to fetch details about the booked item
          if (booking.type && booking.itemId) {
            try {
              const collectionName = booking.type === 'bus' ? 'buses' : `${booking.type}s`;
              const item = await db.collection(collectionName).findOne({ _id: booking.itemId });
              if (item) {
                itemDetails = item;
              }
            } catch (error) {
              console.error(`Error fetching ${booking.type} details:`, error);
            }
          }
          
          // Format contactInfo for display
          const contactInfoDisplay = booking.contactInfo
            ? `${booking.contactInfo.firstName || ''} ${booking.contactInfo.lastName || ''} (${booking.contactInfo.email || ''})`
            : '-';
          
          allBookings.push({
            ...booking,
            userName: user.name,
            userEmail: user.email,
            itemDetails,
            contactInfo: contactInfoDisplay
          });
        }
      }
    }
    
    // Sort bookings by date (most recent first)
    allBookings.sort((a, b) => {
      const dateA = a.bookedAt ? new Date(a.bookedAt) : new Date(0);
      const dateB = b.bookedAt ? new Date(b.bookedAt) : new Date(0);
      return dateB - dateA;
    });
    
    return {
      props: {
        initialBookings: JSON.parse(JSON.stringify(allBookings))
      }
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      props: {
        initialBookings: []
      }
    };
  }
}