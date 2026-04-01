"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

interface TimeSlot {
  time: string;
  display: string;
}

interface DaySlots {
  [date: string]: TimeSlot[];
}

export function CalendarField({ field }: { field: FieldConfig }) {
  const { setValue, formState: { errors }, watch } = useFormContext();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [slots, setSlots] = useState<DaySlots>({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const calendarValue = watch(field.id) as { date?: string; time?: string } | undefined;
  const error = errors[field.id] as Record<string, { message?: string }> | undefined;

  const fetchSlots = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/drchrono/availability?year=${year}&month=${month + 1}`
      );
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots ?? {});
      }
    } catch {
      console.error("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth, fetchSlots]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function formatDate(d: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function handleDateClick(date: string) {
    setSelectedDate(date);
    setValue(field.id, { date, time: "" }, { shouldValidate: false });
  }

  function handleTimeClick(time: string) {
    setValue(field.id, { date: selectedDate, time }, { shouldValidate: true });
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate("");
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate("");
  }

  function formatTimeDisplay(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  const canGoPrev = new Date(year, month, 1) > today;
  const dateSlots = selectedDate ? slots[selectedDate] ?? [] : [];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-calm-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-calm-800">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-calm-100"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-calm-500 py-2">
            {d}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const dateObj = new Date(year, month, day);
          const isPast = dateObj < today;
          const hasSlots = (slots[dateStr]?.length ?? 0) > 0;
          const isSelected = selectedDate === dateStr;
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || !hasSlots || isWeekend}
              onClick={() => handleDateClick(dateStr)}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm transition-colors
                ${isSelected
                  ? "bg-brand-500 text-white font-semibold"
                  : hasSlots && !isPast
                    ? "hover:bg-brand-50 text-calm-800 font-medium"
                    : "text-calm-300 cursor-not-allowed"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-4 text-sm text-calm-500">Loading availability...</div>
      )}

      {/* Time slots */}
      {selectedDate && !loading && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-calm-700">
            Available times for{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h4>
          {dateSlots.length === 0 ? (
            <p className="text-sm text-calm-400 py-2">No available times on this date.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {dateSlots.map((slot) => {
                const isActive = calendarValue?.time === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handleTimeClick(slot.time)}
                    className={`
                      rounded-lg border px-3 py-2 text-sm transition-colors
                      ${isActive
                        ? "border-brand-500 bg-brand-500 text-white font-medium"
                        : "border-calm-200 hover:border-brand-300 hover:bg-brand-50 text-calm-700"
                      }
                    `}
                  >
                    {formatTimeDisplay(slot.time)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(error?.date || error?.time) && (
        <p className="text-sm text-red-600" role="alert">
          {(error.date?.message || error.time?.message) as string}
        </p>
      )}
    </div>
  );
}
