import { createContext, useContext, useMemo, useState } from 'react';

const TripContext = createContext();

export function TripProvider({ children }) {
  const [trip, setTrip] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  

  const value = useMemo(() => ({
    trip,
    setTrip,
    passengerCount,
    setPassengerCount,
    totalPrice,
    setTotalPrice,
    basePrice,
    setBasePrice
  }), [trip, passengerCount, totalPrice, basePrice]);

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
}