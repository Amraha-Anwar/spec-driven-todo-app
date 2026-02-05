"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DayPickerAny = DayPicker as unknown as React.ComponentType<any>;

type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected" | "onSelect" | "components"> & {
  selected?: Date | undefined;
  onSelect?: (date?: Date | undefined) => void;
};

export function Calendar({ selected, onSelect, ...rest }: CalendarProps) {
  return (
    <DayPickerAny
      mode="single"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      className="p-3 glassmorphic rounded-lg"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-pink-red/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal text-white hover:bg-white/10 rounded-md transition-colors",
        day_selected: "bg-pink-red text-white hover:bg-pink-red hover:text-white focus:bg-pink-red focus:text-white",
        day_today: "bg-white/5 text-pink-red",
        day_outside: "text-gray-600 opacity-50",
        day_disabled: "text-gray-600 opacity-50",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      } as any}
      {...rest}
    />
  );
}