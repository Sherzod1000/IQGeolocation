import { useEffect, useState } from "react";

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState({
    latitude: 0,
    longitude: 0,
    err: null,
  });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserLocation(() => ({ latitude, longitude }));
      },
      (err) => {
        console.log(err);
        setUserLocation((prev) => ({
          ...prev,
          err,
        }));
      },
    );
  }, []);

  return userLocation;
}
