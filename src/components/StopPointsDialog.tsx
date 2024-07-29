import { MapContext } from "@/providers/map-provider";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import {
  ChangeEvent,
  Fragment,
  useContext,
  useRef,
  useState,
  useTransition,
} from "react";

export default function StopPointsDialog({
  isOpen,
  close,
  selected,
  onSelect,
  label,
}: {
  isOpen: boolean;
  close: any;
  selected?: any;
  onSelect?: any;
  label?: "origin" | "destination";
}) {
  const completeButtonRef = useRef(null);

  const { stops } = useContext(MapContext);

  const [query, setQuery] = useState<string>("");

  const [isPending, startTransition] = useTransition();

  const filtered =
    query?.trim()?.length < 3
      ? stops
      : stops.filter((stop) =>
          stop.stop_name.toLowerCase().includes(query.toLowerCase())
        );

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setQuery(event.target.value);
    });
  };

  return (
    <Dialog
      initialFocus={completeButtonRef}
      open={isOpen}
      onClose={close}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex h-full items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm rounded bg-white">
            <DialogTitle>{label}</DialogTitle>
            <Description>Choose a value</Description>
            <Combobox value={selected} onChange={onSelect}>
              <ComboboxInput
                onChange={onChange}
                displayValue={(stop: any) => stop?.stop_name ?? ""}
              />
              <ComboboxOptions>
                {filtered.map((stop) => (
                  <ComboboxOption key={stop.stop_id} value={stop} as={Fragment}>
                    {({ selected, focus }) => (
                      <li
                        className={`${
                          focus
                            ? "bg-blue-500 text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {selected && <CheckIcon />}
                        {stop.stop_name}
                      </li>
                    )}
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </Combobox>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
