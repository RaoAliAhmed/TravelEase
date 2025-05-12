import { createContext, useContext, useMemo, useState } from 'react';

const FlightContext = createContext();

export function FlightProvider({ children }) {
  const [flight, setFlight] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [basePrice, setBasePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const value = useMemo(() => ({
    flight,
    setFlight,
    passengerCount,
    setPassengerCount,
    selectedClass,
    setSelectedClass,
    basePrice,
    setBasePrice,
    totalPrice,
    setTotalPrice
  }), [flight, passengerCount, selectedClass, basePrice, totalPrice]);

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  );
}

export function useFlight() {
  const context = useContext(FlightContext);
  if (!context) throw new Error('useFlight must be used within a FlightProvider');
  return context;
}
