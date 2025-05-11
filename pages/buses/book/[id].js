import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import BookingLayout from '../../../components/travel/BookingLayout';
import BookingSummary from '../../../components/travel/BookingSummary';
import BookingForm from '../../../components/travel/BookingForm';
import BookingSuccess from '../../../components/travel/BookingSuccess';

export default function BusBooking() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);

  // Fetch bus data
  useEffect(() => {
    if (!id) return;

    const fetchBus = async () => {
      try {
        const res = await fetch(`/api/buses/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Bus not found');
          } else {
            throw new Error('Failed to fetch bus details');
          }
          return;
        }
        const data = await res.json();
        setBus(data);
        // Set default class if available
        if (data.classes && data.classes.length > 0) {
          setSelectedClass(data.classes[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [id]);

  // Handle booking submission
  const handleSubmit = async (formData) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const res = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bus',
          itemId: id,
          passengers: passengerCount,
          totalPrice: (selectedClass?.price || bus.price) * passengerCount
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await res.json();
      setBookingId(data.booking.bookingId);
      setBookingSuccess(true);

      const newSeats = bus.seats - passengerCount;
      await fetch(`/api/buses/${id}/seats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: newSeats }),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle view bookings click
  const handleViewBookings = () => {
    router.push('/bookings');
  };

  // Handle back button click
  const handleBackClick = () => {
    router.back();
  };

  if (bookingSuccess && bus) {
    return (
      <BookingLayout
        type="buse"
        color="blue"
        title="Booking Confirmed"
        onBackClick={handleBackClick}
      >
        <BookingSuccess
          type="buse"
          color="blue"
          bookingId={bookingId}
          from={bus.from || bus.origin}
          to={bus.to || bus.destination}
          date={bus.departureDate || bus.date}
          companyName={bus.company?.name || bus.company}
          totalPrice={(selectedClass?.price || bus.price) * passengerCount}
          onViewBookings={handleViewBookings}
        />
      </BookingLayout>
    );
  }

  return (
    <BookingLayout
      type="buse"
      color="blue"
      item={bus}
      title="Book Bus"
      loading={loading}
      error={error}
      notFound={error === 'Bus not found'}
      onBackClick={handleBackClick}
    >
      {bus && (
        <>
          <BookingSummary
            item={bus}
            type="buse"
            color="blue"
            showClass={true}
            selectedClass={selectedClass}
            passengerCount={passengerCount}
            companyField="company"
          />

          <BookingForm
            type="buse"
            color="blue"
            onSubmit={handleSubmit}
            loading={loading}
            passengerCount={passengerCount}
            showClass={true}
            classes={bus.classes || []}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
          />
        </>
      )}
    </BookingLayout>
  );
} 