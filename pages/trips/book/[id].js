// pages/trips/book/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import BookingLayout from '@/components/travel/BookingLayout';
import BookingSummary from '@/components/travel/BookingSummary';
import BookingForm from '@/components/travel/BookingForm';
import BookingSuccess from '@/components/travel/BookingSuccess';
import { useTrip } from '@/context/TripContext';

export default function TripBooking() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;

  const { trip, setTrip , passengerCount, setPassengerCount, selectedClass, setSelectedClass } = useTrip();

  const [loading, setLoading] = useState(!trip);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  useEffect(() => {
    if (!id || trip) return;

    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/trips/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? 'Trip not found' : 'Failed to fetch trip details');
          return;
        }
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleSubmit = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const res = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'trip',
          itemId: id,
          passengers: passengerCount,
          totalPrice: trip.price * passengerCount
        }),
      });

      if (!res.ok) throw new Error('Failed to create booking');

      const data = await res.json();
      setBookingId(data.booking.bookingId);
      setBookingSuccess(true);

      const newSpots = trip.availableSpots - passengerCount;
      await fetch(`/api/trips/${id}/spots`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableSpots: newSpots }),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewBookings = () => router.push('/profile/bookings');
  const handleBackClick = () => router.back();

  if (bookingSuccess && trip) {
    return (
      <BookingLayout
        type="trip"
        color="green"
        title="Booking Confirmed"
        onBackClick={handleBackClick}
      >
        <BookingSuccess
          type="trip"
          color="green"
          bookingId={bookingId}
          from={trip.from || trip.origin}
          to={trip.to || trip.destination}
          date={trip.startDate || trip.date}
          companyName={trip.tourCompany?.name || trip.tourCompany}
          totalPrice={trip.price * passengerCount}
          onViewBookings={handleViewBookings}
        />
      </BookingLayout>
    );
  }

  return (
    <BookingLayout
      type="trip"
      color="green"
      item={trip}
      title="Book Trip"
      loading={loading}
      error={error}
      notFound={error === 'Trip not found'}
      onBackClick={handleBackClick}
    >
      {trip && (
        <>
          <BookingSummary
            item={trip}
            type="trip"
            color="green"
            showClass={false}
            passengerCount={passengerCount}
            companyField="tourCompany"
          />
          <BookingForm
            type="trip"
            color="green"
            onSubmit={handleSubmit}
            loading={loading}
            passengerCount={passengerCount}
            showClass={false}
          />
        </>
      )}
    </BookingLayout>
  );
}
