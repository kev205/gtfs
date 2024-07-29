"use client";

import StopPointsDialog from "@/components/StopPointsDialog";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

const libraries = ["places", "drawing", "geometry"];

export const MapContext = createContext<{
  location?: {
    latitude: number;
    longitude: number;
  };
  stops: any[];
  origin?: google.maps.LatLngLiteral;
  destination?: google.maps.LatLngLiteral;
}>({ stops: [] });

export function MapProvider({
  children,
  stops,
}: PropsWithChildren & { stops: any[] }) {
  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
    libraries: libraries as Libraries,
  });

  const [isOpen, setIsopen] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();

  const [origin, setOrigin] = useState<any>();
  const [destination, setDestination] = useState<any>();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
  }, []);

  const [label, setLabel] = useState<"origin" | "destination" | undefined>();

  const close = () => setIsopen(false);

  const onStopPoint = useCallback(
    (value: any) => {
      if (label === "origin") setOrigin(value);
      else setDestination(value);
      setIsopen(false);
    },
    [label]
  );

  if (loadError) return <p>Encountered error while loading google maps</p>;

  if (!scriptLoaded) return <span className="sr-only">Loading...</span>;

  return (
    <MapContext.Provider
      value={{
        location,
        stops,
        origin: origin && {
          lat: Number(origin.stop_lat),
          lng: Number(origin.stop_lon),
        },
        destination: destination && {
          lat: Number(destination.stop_lat),
          lng: Number(destination.stop_lon),
        },
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 mb-100">
        <div>
          <div
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onClick={() => {
              setLabel("origin");
              setIsopen(true);
            }}
          >
            <span>{origin ? origin.stop_name : "Enter Origin"}</span>
          </div>
        </div>
        <div className="mt-10">
          <div
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onClick={() => {
              setLabel("destination");
              setIsopen(true);
            }}
          >
            <span>
              {destination ? destination.stop_name : "Enter Destination"}
            </span>
          </div>
        </div>
      </div>
      {children}
      <StopPointsDialog
        isOpen={isOpen}
        close={close}
        label={label}
        selected={label === "origin" ? origin : destination}
        onSelect={onStopPoint}
      />
    </MapContext.Provider>
  );
}
