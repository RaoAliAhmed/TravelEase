// pages/flights/book/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import BookingLayout from '@/components/travel/BookingLayout';
import BookingDetailsContext from '@/components/travel/BookingDetailsContext';
import BookingForm from '@/components/travel/BookingForm';
import BookingSuccess from '@/components/travel/BookingSuccess';
import { useFlight } from '@/context/FlightContext';

export default function FlightBooking() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;

  const { flight, setFlight, passengerCount, setPassengerCount, selectedClass, setSelectedClass, totalPrice, setTotalPrice, basePrice, setBasePrice } = useFlight();

  const [loading, setLoading] = useState(!flight);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    if (!id || flight) return;

    const fetchFlight = async () => {
      try {
        const res = await fetch(`/api/flights/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? 'Flight not found' : 'Failed to fetch flight details');
          return;
        }
        const data = await res.json();
        setFlight(data);
        
        // Initialize with first class option if available
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

  // Validate that we have enough seats available
  useEffect(() => {
    if (flight && passengerCount > flight.seats) {
      setError(`Only ${flight.seats} seats available. Please select fewer passengers.`);
    } else {
      setError(null);
    }
  }, [flight, passengerCount]);

  const handleSubmit = async (formData) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Validate seat availability again
    if (flight && passengerCount > flight.seats) {
      setError(`Only ${flight.seats} seats available. Please select fewer passengers.`);
      return;
    }

    setLoading(true);
    setError(null);
    setContactInfo(formData);

    try {
      const res = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'flight',
          itemId: id,
          passengers: passengerCount,
          totalPrice: totalPrice,
          contactInfo: formData,
          selectedClass: selectedClass ? selectedClass.name : 'Economy'
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const data = await res.json();
      setBookingId(data.booking.bookingId);
      setBookingSuccess(true);

      // Update available seats - deduct the correct number of seats based on passenger count
      const newSeats = flight.seats - passengerCount;
      await fetch(`/api/flights/${id}/seats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: newSeats }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => router.back();
  const handleViewBookings = () => router.push('/profile/bookings');

  if (bookingSuccess && flight) {
    return (
      <BookingLayout type="flight" color="pink" title="Booking Confirmed" onBackClick={handleBackClick}>
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
          contactInfo={contactInfo}
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
          <BookingDetailsContext
            item={flight}
            type="flight"
            color="pink"
            showClass={true}
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
