"use client";

import { MapContext } from "@/providers/map-provider";
import { DirectionsRenderer, GoogleMap, Marker } from "@react-google-maps/api";
import { CSSProperties, useContext, useEffect, useState } from "react";
import polilyne from "google-polyline";
import { darkMap } from "@/lib/map";

export const defaultMapContainerStyle: CSSProperties = {
  width: "100%",
  height: "800px",
};

export default function MapView() {
  const defaultMapZoom = 16;
  const defaultMapOptions: google.maps.MapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: "auto",
    mapTypeControl: false,
    styles: process.env.USE_CUSTOM_MAP_STYLE ? darkMap : undefined,
  };

  const { location, origin, destination, stops } = useContext(MapContext);

  const [routePath, setRoutePath] = useState<Array<[number, number]>>([]);

  const [directions, setDirections] = useState<
    google.maps.DirectionsResult | null | undefined
  >();

  useEffect(() => {
    if (!origin || !destination) return;

    const DirectionsService = new google.maps.DirectionsService();

    DirectionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (response != null && status === google.maps.DirectionsStatus.OK) {
          const way_points = polilyne.decode(
            response.routes[0].overview_polyline
          );
          setDirections(response);
          setRoutePath(way_points.slice(1, way_points.length - 1));
        } else {
          console.error(`error fetching directions ${response}`);
        }
      }
    );
  }, [origin, destination]);

  function PolygonArray(latitude: number) {
    const R = 6378137;
    const pi = 3.14;
    //distance in meters
    const upper_offset = process.env.UPPER_AND_LOWER_BOUND_INCREMENT
      ? Number(process.env.UPPER_AND_LOWER_BOUND_INCREMENT)
      : 100;
    const lower_offset = -(process.env.UPPER_AND_LOWER_BOUND_INCREMENT
      ? Number(process.env.UPPER_AND_LOWER_BOUND_INCREMENT)
      : 100);
    const Lat_up = upper_offset / R;
    const Lat_down = lower_offset / R;
    //OffsetPosition, decimal degrees
    const lat_upper = latitude + (Lat_up * 180) / pi;
    const lat_lower = latitude + (Lat_down * 180) / pi;
    return [lat_upper, lat_lower];
  }

  function PolygonPoints(waypoints: Array<[number, number]>) {
    let polypoints = waypoints;
    let PolyLength = polypoints.length;
    let UpperBound = [];
    let LowerBound = [];
    for (let j = 0; j <= PolyLength - 1; j++) {
      let NewPoints = PolygonArray(polypoints[j][0]);
      UpperBound.push({ lat: NewPoints[0], lng: polypoints[j][1] });
      LowerBound.push({ lat: NewPoints[1], lng: polypoints[j][1] });
    }
    let reversebound = LowerBound.reverse();
    let FullPoly = UpperBound.concat(reversebound);
    return FullPoly;
  }

  const polygonBound = new google.maps.Polygon({
    paths: PolygonPoints(routePath),
  });

  const stopsToDraw = stops.filter((stop) =>
    google.maps.geometry.poly.containsLocation(
      {
        lat: Number(stop.stop_lat),
        lng: Number(stop.stop_lon),
      },
      polygonBound
    )
  );

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={
          origin ??
          (location && { lat: location?.latitude, lng: location?.longitude })
        }
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        {directions && (
          <DirectionsRenderer
            options={{
              directions: directions,
            }}
          />
        )}
        {stopsToDraw?.map((stop) => (
          <Marker
            key={stop.stop_id}
            position={{
              lat: Number(stop.stop_lat),
              lng: Number(stop.stop_lon),
            }}
            title={stop.stop_name}
            animation={google.maps.Animation.DROP}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
