// pages/buses/book/[id].js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useBus, BusProvider } from "@/context/BusContext";
import BookingLayout from "@/components/travel/BookingLayout";
import BookingDetailsContext from "@/components/travel/BookingDetailsContext";
import BookingForm from "@/components/travel/BookingForm";
import BookingSuccess from "@/components/travel/BookingSuccess";

function BusBookingPageInner() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const { bus, setBus, passengerCount, setPassengerCount, selectedClass, setSelectedClass,totalPrice } = useBus();

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);

  // Fetch the bus by ID and store in context
  useEffect(() => {
    if (!id) return;

    const fetchBus = async () => {
      try {
        const res = await fetch(`/api/buses/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Bus not found" : "Failed to fetch bus details");
          return;
        }
        const data = await res.json();
        setBus(data);
        if (data.classes?.length > 0) {
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

  const handleSubmit = async (formData) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    setError(null);
    setContactInfo(formData);

    try {
      const res = await fetch("/api/user/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bus",
          itemId: id,
          passengers: passengerCount,
          totalPrice: totalPrice,
          contactInfo: formData,
          selectedClass: selectedClass ? selectedClass.name : 'Standard'
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const data = await res.json();
      setBookingId(data.booking.bookingId);
      setBookingSuccess(true);

      const newSeats = bus.seats - passengerCount;
      await fetch(`/api/buses/${id}/seats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seats: newSeats }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => router.back();
  const handleViewBookings = () => router.push("/profile/bookings");

  if (bookingSuccess && bus) {
    return (
      <BookingLayout type="bus" color="blue" title="Booking Confirmed" onBackClick={handleBackClick}>
        <BookingSuccess
          type="bus"
          color="blue"
          bookingId={bookingId}
          from={bus.from || bus.origin}
          to={bus.to || bus.destination}
          date={bus.departureDate || bus.date}
          companyName={bus.company?.name || bus.company}
          totalPrice={(selectedClass?.price || bus.price) * passengerCount}
          onViewBookings={handleViewBookings}
          contactInfo={contactInfo}
        />
      </BookingLayout>
    );
  }

  return (
    <BookingLayout
      type="bus"
      color="blue"
      item={bus}
      title="Book Bus"
      loading={loading}
      error={error}
      notFound={error === "Bus not found"}
      onBackClick={handleBackClick}
    >
      {bus && (
        <>
          <BookingDetailsContext
            item={bus}
            type="bus"
            color="blue"
            showClass={true}
            selectedClass={selectedClass}
            passengerCount={passengerCount}
            companyField="company"
          />

          <BookingForm
            type="bus"
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

// Export with provider wrapp
export default BusBookingPageInner;
