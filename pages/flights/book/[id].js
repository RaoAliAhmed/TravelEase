import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import BookingLayout from '../../../components/travel/BookingLayout';
import BookingSummary from '../../../components/travel/BookingSummary';
import BookingForm from '../../../components/travel/BookingForm';
import BookingSuccess from '../../../components/travel/BookingSuccess';

export default function FlightBooking() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);

  // Fetch flight data
  useEffect(() => {
    if (!id) return;

    const fetchFlight = async () => {
      try {
        const res = await fetch(`/api/flights/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Flight not found');
          } else {
            throw new Error('Failed to fetch flight details');
          }
          return;
        }
        const data = await res.json();
        setFlight(data);
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

    fetchFlight();
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
          type: 'flight',
          itemId: id,
          passengers: passengerCount,
          totalPrice: (selectedClass?.price || flight.price) * passengerCount
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await res.json();
      setBookingId(data.booking.bookingId);
      setBookingSuccess(true);

      const newSeats = flight.seats - passengerCount;
      await fetch(`/api/flights/${id}/seats`, {
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

  if (bookingSuccess && flight) {
    return (
      <BookingLayout
        type="flight"
        color="pink"
        title="Booking Confirmed"
        onBackClick={handleBackClick}
      >
        <BookingSuccess
          type="flight"
          color="pink"
          bookingId={bookingId}
          from={flight.from || flight.origin}
          to={flight.to || flight.destination}
          date={flight.departureDate || flight.date}
          companyName={flight.airline?.name || flight.airline}
          totalPrice={(selectedClass?.price || flight.price) * passengerCount}
          onViewBookings={handleViewBookings}
        />
      </BookingLayout>
    );
  }

  return (
    <BookingLayout
      type="flight"
      color="pink"
      item={flight}
      title="Book Flight"
      loading={loading}
      error={error}
      notFound={error === 'Flight not found'}
      onBackClick={handleBackClick}
    >
      {flight && (
        <>
          <BookingSummary
            item={flight}
            type="flight"
            color="pink"
            showClass={true}
            selectedClass={selectedClass}
            passengerCount={passengerCount}
            companyField="airline"
          />

          <BookingForm
            type="flight"
            color="pink"
            onSubmit={handleSubmit}
            loading={loading}
            passengerCount={passengerCount}
            showClass={true}
            classes={flight.classes || []}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
          />
        </>
      )}
    </BookingLayout>
  );
} 