import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/integrations/drchrono/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? "0", 10);
  const month = parseInt(searchParams.get("month") ?? "0", 10);

  if (!year || !month) {
    return NextResponse.json(
      { error: "year and month are required" },
      { status: 400 }
    );
  }

  try {
    const daysInMonth = new Date(year, month, 0).getDate();
    const allSlots: Record<string, { time: string; display: string }[]> = {};

    // Fetch availability for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(`${dateStr}T00:00:00`);

      // Skip past dates
      if (dateObj < new Date(new Date().toDateString())) continue;

      const result = await getAvailability(dateStr);

      if (result.slots.length > 0) {
        allSlots[dateStr] = result.slots.map((slot) => ({
          time: slot.time,
          display: formatTime(slot.time),
        }));
      }
    }

    return NextResponse.json({ slots: allSlots });
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}
