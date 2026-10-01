"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { format } from "date-fns";

const today = new Date();

interface DashboardCalendarProps {
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export default function DashboardCalendar({
  range,
  onChange,
}: DashboardCalendarProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 pt-3 pb-5 shadow-sm relative">
      <div className="text-left pl-4">
        <p className="font-inter font-medium text-gray-500 capitalize">
          {format(today, "EEEE, d", { locale: es })}
        </p>
      </div>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={onChange}
        locale={es}
        weekStartsOn={1}
        captionLayout="dropdown"         
        startMonth={new Date(2025, 0)}
        endMonth={new Date(2030, 11)}
        showOutsideDays
        classNames={{
          months: "flex",
          month: "w-full text-primary-blue font-inter",

          month_caption: "flex items-center justify-center h-10 mt-2 mb-2",

          caption_label: "hidden",

          dropdowns: "flex items-center justify-center gap-4",

          dropdown:
            "h-9 appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-8 font-inter text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100",

          nav: "absolute  top-1.5 right-6 flex items-center justify-center",

          button_previous:
            "h-8 w-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition",

          button_next:
            "h-8 w-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition",

          weekdays: "grid grid-cols-7 mb-2",

          weekday: "font-inter text-xs font-medium text-gray-400 text-center",

          week: "grid grid-cols-7",

          day: "relative flex items-center justify-center text-sm font-inter",

          day_button:
            "h-9 w-9 rounded-lg font-inter text-sm text-inherit hover:bg-primary-blue hover:text-white transition",

          today: "font-semibold text-gray-900",

          outside: "text-gray-300",

          disabled: "text-gray-300 cursor-not-allowed",

          range_start:
            "bg-primary-blue text-white rounded-l-lg hover:opacity-70 hover:bg-primary-blue",

          range_middle: "bg-primary-blue/10 text-gray-900 rounded-none",

          range_end: "bg-primary-blue text-white rounded-r-lg hover:opacity-70",

          selected: "bg-primary-blue ",

          hidden: "invisible",
        }}
      />
      {range && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-primary-blue transition hover:bg-gray-50 hover:text-gray-900 font-inter"
        >
          Limpiar fechas
        </button>
      )}
    </div>
  );
}
