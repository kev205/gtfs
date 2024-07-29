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
  PropsWithChildren,
  useContext,
  useRef,
  useState,
  useTransition,
} from "react";

export default function StopPointsDialog({
  children,
  isOpen,
  close,
  selected,
  onSelect,
  label,
}: PropsWithChildren & {
  isOpen: boolean;
  close: any;
  selected?: any;
  onSelect?: any;
  label?: "Origin" | "Destination" | "Trip";
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
        <div className="flex h-full items-center justify-center">
          {children ? (
            <div className="flex-1/3 w-1/3 h-2/3 rounded bg-white p-4">
              <h4 className="text-center text-2xl mb-10">{label}</h4>
              {children}
            </div>
          ) : (
            <DialogPanel className="flex-1/3 w-1/3 h-2/3 rounded bg-white p-4">
              <DialogTitle className="text-center text-2xl">
                {label}
              </DialogTitle>
              <Description>Choose a value</Description>
              <Combobox value={selected} onChange={onSelect}>
                <ComboboxInput
                  onChange={onChange}
                  displayValue={(stop: any) => stop?.stop_name ?? ""}
                  className="w-full mt-4"
                  autoFocus
                />
                <ComboboxOptions className="flex-1">
                  {filtered.map((stop) => (
                    <ComboboxOption
                      key={stop.stop_id}
                      value={stop}
                      as={Fragment}
                    >
                      {({ selected, focus }) => (
                        <li
                          className={`w-full ${
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
          )}
        </div>
      </div>
    </Dialog>
  );
}
