"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useStoreModal } from "@/hooks/use-store-modal";
import { cn } from "@/lib/utils";
import { Store } from "@prisma/client";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Store as StoreIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { set } from "zod";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Store[];
}

export default function StoreSwitcher({
  className,
  items = [],
}: StoreSwitcherProps) {
  const storeModal = useStoreModal();
  const params = useParams();
  const router = useRouter();

  const formattedItems = items.map((item) => ({
    label: item.store_name,
    value: item.store_id,
  }));

  const currentStore = formattedItems.find(
    (item) => item.value === params.store_id
  );

  const [open, setOpen] = useState(false);

  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpen(false);
    router.push(`/${store.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combo"
          aria-expanded={open}
          aria-label="Select a Store"
          className={cn(
            "dark:bg-[#0D1A26] bg-[#252440]  w-[200px] justify-between",
            className
          )}
        >
          <StoreIcon className="mr-2 h-4 w-4" />
          {currentStore?.label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          className={cn(
            "dark:bg-[#0D1A26] bg-[#252440] text-white dark:text-white",
            className
          )}
        >
          <CommandList>
            <CommandInput placeholder="Search store..." />
            <CommandEmpty>No store found</CommandEmpty>
            <CommandGroup heading="Stores">
              {formattedItems.map((store) => (
                <Button
                  key={store.value}
                  onClick={() => onStoreSelect(store)}
                  className="text-sm text-white flex items-center justify-between w-full px-3 py-2 cursor-pointer focus:outline-none
                  dark:text-[#252440]
                  "
                >
                  <StoreIcon className="mr-2 h-4 w-4" />
                  {store.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentStore?.value === store.value
                        ? "opacity 100 text-[#FFD700]"
                        : "opacity-0 text-[#FFD700]"
                    )}
                  />
                </Button>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem className="p-0" />
              <Button
                onClick={() => {
                  setOpen(false);
                  storeModal.onOpen();
                }}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-[#3D3D5C] dark:hover:bg-[#1A2B3A] data-[disabled]:pointer-events-none data-[disabled]:opacity-50
                hover:dark:text-white
                "
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Store
              </Button>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
