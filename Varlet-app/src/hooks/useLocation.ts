import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  lat: number;
  lng: number;
}

// MG Road, Bengaluru — used when permission is denied or location is
// unavailable (e.g. simulator without a simulated location) so "nearby
// shops" still has something sensible to search around.
const FALLBACK_COORDS: Coords = { lat: 12.9757, lng: 77.6070 };

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setPermissionDenied(true);
            setCoords(FALLBACK_COORDS);
          }
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        }
      } catch {
        if (!cancelled) setCoords(FALLBACK_COORDS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, isLoading, permissionDenied };
}
