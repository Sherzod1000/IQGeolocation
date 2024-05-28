import { createContext, useState } from 'react';
import { getLocations } from '../components/helper/functions.js';

export const LocationContext = createContext();
export function LocationProvider({ children }) {
  const [locations, setLocations] = useState(getLocations());
  localStorage.setItem('locations', JSON.stringify(locations));
  return (
    <LocationContext.Provider value={{ locations, setLocations }}>
      {children}
    </LocationContext.Provider>
  );
}
