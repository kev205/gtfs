"use client";

import StopPointsDialog from "@/components/StopPointsDialog";
import transformToJSON from "@/lib/file";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const libraries = ["places", "drawing", "geometry"];

export const MapContext = createContext<{
  location?: {
    latitude: number;
    longitude: number;
  };
  stops: any[];
  stopTimes: any[];
  stopTime?: any;
  origin?: google.maps.LatLngLiteral;
  destination?: google.maps.LatLngLiteral;
}>({ stops: [], stopTimes: [] });

export function MapProvider({
  children,
  stops,
}: PropsWithChildren & { stops: any[] }) {
  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
    libraries: libraries as Libraries,
  });

  const [isOpen, setIsopen] = useState(false);
  const [isOpen1, setIsopen1] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();

  const [origin, setOrigin] = useState<any>();
  const [destination, setDestination] = useState<any>();
  const [stopTimes, setStoptimes] = useState<any[]>([]);
  const [stopTime, setStoptime] = useState<any>();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
    (async function () {
      const st = await transformToJSON("stop_times.txt");
      setStoptimes(st);
    })();
  }, []);

  const [label, setLabel] = useState<
    "Origin" | "Destination" | "Trip" | undefined
  >();

  const close = () => {
    setIsopen(false);
    setIsopen1(false);
  };

  const onStopPoint = useCallback(
    (value: any) => {
      if (label === "Origin") setOrigin(value);
      else setDestination(value);
      setStoptime(undefined);
      setIsopen(false);
    },
    [label]
  );

  const onTrip = useCallback(
    (value: any) => {
      setStoptime(value);
      setOrigin(undefined);
      setDestination(undefined);
      setIsopen1(false);
    },
    [label]
  );

  if (loadError) return <p>Encountered error while loading google maps</p>;

  if (!scriptLoaded) return <span className="sr-only">Loading...</span>;

  const stop_times_data = stopTimes.reduce((acc, curr) => {
    if (!acc[curr.trip_id]) {
      acc[curr.trip_id] = [];
    }
    acc[curr.trip_id] = [
      ...acc[curr.trip_id],
      {
        stop_id: curr.stop_id,
        departure_time: curr.departure_time,
        arrival_time: curr.arrival_time,
      },
    ];
    return acc;
  }, {});

  const stop_times = Object.keys(stop_times_data).map((key) => ({
    trip_id: key,
    data: stop_times_data[key],
  }));

  const paginated = stop_times.slice(index, 20);

  const fetchMoreData = () => {
    setIndex((prev) => prev + 20);
  };

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
        stopTimes: stop_times,
        stopTime,
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 mb-100">
        <div>
          <div
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onClick={() => {
              setLabel("Origin");
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
              setLabel("Destination");
              setIsopen(true);
            }}
          >
            <span>
              {destination ? destination.stop_name : "Enter Destination"}
            </span>
          </div>
        </div>
        <h1 className="mt-10 text-center">OR</h1>
        <div className="mt-10">
          <label>Trip</label>
          <div
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onClick={() => {
              setIsopen1(true);
            }}
          >
            <span>{stopTime ? stopTime.trip_id : "Choose a trip"}</span>
          </div>
        </div>
      </div>
      {children}
      <StopPointsDialog
        isOpen={isOpen}
        close={close}
        label={label}
        selected={label === "Origin" ? origin : destination}
        onSelect={onStopPoint}
      />
      <StopPointsDialog
        isOpen={isOpen1}
        close={close}
        label={label}
        selected={stopTime}
        onSelect={onTrip}
      >
        <InfiniteScroll
          dataLength={stop_times.length}
          next={fetchMoreData}
          hasMore={stop_times.length - paginated.length > 0}
          loader={<h4>Loading...</h4>}
        >
          <div className="container">
            <div className="row">
              {paginated &&
                paginated.map((item: any) => (
                  <li
                    key={item.trip_id}
                    onClick={() => {
                      onTrip(item);
                    }}
                    className={`w-full cursor-pointer`}
                  >
                    {item.trip_id}
                  </li>
                ))}
            </div>
          </div>
        </InfiniteScroll>
      </StopPointsDialog>
    </MapContext.Provider>
  );
}
