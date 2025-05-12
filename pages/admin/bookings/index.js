import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { useEffect, useState } from 'react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then(res => res.json())
      .then(data => {
        // Pre-format contactInfo for display
        const formatted = (data.bookings || []).map(b => ({
          ...b,
          contactInfo: b.contactInfo
            ? `${b.contactInfo.firstName || ''} ${b.contactInfo.lastName || ''} (${b.contactInfo.email || ''})`
            : '-',
        }));
        setBookings(formatted);
        setLoading(false);
      });
  }, []);

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