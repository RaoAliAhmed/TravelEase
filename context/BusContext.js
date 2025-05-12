"use client";

import React, { createContext, useContext, useState } from "react";

const BusContext = createContext(undefined);

export const BusProvider = ({ children }) => {
  const [bus, setBus] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);


  return (
    <BusContext.Provider
      value={{
        bus,
        setBus,
        selectedClass,
        setSelectedClass,
        passengerCount,
        setPassengerCount,
        bookingSuccess,
        setBookingSuccess,
        bookingId,
        setBookingId,
        totalPrice,
        setTotalPrice,
        basePrice,
        setBasePrice,
      }}
    >
      {children}
    </BusContext.Provider>
  );
};

export const useBus = () => {
  const context = useContext(BusContext);
  if (context === undefined) {
    throw new Error("useBus must be used within a BusProvider");
  }
  return context;
};
