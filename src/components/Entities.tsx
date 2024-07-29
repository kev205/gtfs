"use client";

import transformToJSON from "@/lib/file";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState, useTransition } from "react";

export default function Entities() {
  const entities = [
    "Agency",
    "Calendar",
    "Calendar_dates",
    "Route",
    "Shapes",
    "Stops",
    "Stop_times",
    "Trips",
  ];

  const [entity, setEntity] = useState("agency");

  const [items, setItems] = useState<any[]>();

  const [isPending, startTransition] = useTransition();

  const onEntity = (value: string) => {
    startTransition(async () => {
      const data = await transformToJSON(`${entity}.txt`);
      setItems(data);
      setEntity(value);
    });
  };

  useEffect(() => {
    (async function loadData() {
      const data = await transformToJSON(`${entity}.txt`);
      setItems(data);
    })();
  }, []);

  const headers = Object.keys(items?.length ? items[0] : {});

  return (
    <div className="flex-1">
      <span className="mr-10">Entities:</span>
      <Listbox value={entity} onChange={onEntity}>
        <ListboxButton>{entity}</ListboxButton>
        <ListboxOptions anchor="bottom">
          {entities.map((e) => (
            <ListboxOption
              key={e}
              value={e.toLowerCase()}
              className="group flex gap-2 bg-green-400 data-[focus]:bg-blue-100"
            >
              <CheckIcon className="invisible size-5 group-data-[selected]:visible" />
              {e}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {!isPending && headers && items ? (
        <table className="table-fixed">
          <thead>
            <tr>
              {headers.map((h: any) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item[headers[0]] + "" + index}>
                {headers.map((h) => (
                  <td key={h}>{item[h]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <svg
          className="animate-spin h-5 w-5 mr-3 ..."
          viewBox="0 0 24 24"
        ></svg>
      )}
    </div>
  );
}
