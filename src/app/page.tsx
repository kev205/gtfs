import Entities from "@/components/Entities";
import MapView from "@/components/MapView";
import transformToJSON from "@/lib/file";
import { MapProvider } from "@/providers/map-provider";
import { Suspense } from "react";

export default async function Home() {
  const points = await transformToJSON("stops.txt");

  return (
    <main className="flex flex-row py-8" style={{ paddingLeft: 16 }}>
      <div className="flex-1 mr-2">
        <Suspense fallback={<span>Loading stop points...</span>}>
          <MapProvider stops={points}>
            <MapView />
          </MapProvider>
        </Suspense>
      </div>
      <div className="flex-1/4 bg-gray-50 items-center justify-center">
        <Entities />
      </div>
    </main>
  );
}
