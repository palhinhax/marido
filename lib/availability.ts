import type {
  AvailabilityRule,
  AvailabilityException,
  Booking,
} from "@prisma/client";

// --- time helpers ------------------------------------------------------------
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Schema stores 1=Mon..7=Sun. JS getDay() is 0=Sun..6=Sat.
export function isoDayOfWeek(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

function sameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface Slot {
  start: Date;
  end: Date;
  label: string; // "HH:MM"
}

interface ComputeArgs {
  rules: Pick<
    AvailabilityRule,
    | "dayOfWeek"
    | "startTime"
    | "endTime"
    | "slotDurationMinutes"
    | "isAvailable"
  >[];
  exceptions: Pick<
    AvailabilityException,
    "date" | "startTime" | "endTime" | "type"
  >[];
  bookings: Pick<Booking, "scheduledStart" | "scheduledEnd">[];
  date: Date;
  serviceDurationMinutes: number;
  now?: Date;
}

// Compute bookable slot start times for a single professional on a single day.
export function computeDaySlots({
  rules,
  exceptions,
  bookings,
  date,
  serviceDurationMinutes,
  now = new Date(),
}: ComputeArgs): Slot[] {
  const dow = isoDayOfWeek(date);

  // Whole-day block?
  const dayExceptions = exceptions.filter((e) =>
    sameLocalDate(new Date(e.date), date)
  );
  const blockedWholeDay = dayExceptions.some(
    (e) => e.type === "UNAVAILABLE" && !e.startTime
  );
  if (blockedWholeDay) return [];

  // Base availability windows for this weekday
  const windows: [number, number, number][] = rules
    .filter((r) => r.dayOfWeek === dow && r.isAvailable)
    .map((r) => [
      toMinutes(r.startTime),
      toMinutes(r.endTime),
      r.slotDurationMinutes,
    ]);

  // Extra-availability exceptions (add windows)
  for (const e of dayExceptions) {
    if (e.type === "AVAILABLE" && e.startTime && e.endTime) {
      windows.push([toMinutes(e.startTime), toMinutes(e.endTime), 60]);
    }
  }

  // Partial unavailable windows to subtract
  const blocked: [number, number][] = dayExceptions
    .filter((e) => e.type === "UNAVAILABLE" && e.startTime && e.endTime)
    .map((e) => [toMinutes(e.startTime!), toMinutes(e.endTime!)]);

  // Existing bookings on this day (occupied windows)
  for (const b of bookings) {
    if (
      b.scheduledStart &&
      b.scheduledEnd &&
      sameLocalDate(new Date(b.scheduledStart), date)
    ) {
      const s = new Date(b.scheduledStart);
      const e = new Date(b.scheduledEnd);
      blocked.push([
        s.getHours() * 60 + s.getMinutes(),
        e.getHours() * 60 + e.getMinutes(),
      ]);
    }
  }

  const slots: Slot[] = [];
  const seen = new Set<number>();

  for (const [wStart, wEnd, step] of windows) {
    for (let t = wStart; t + serviceDurationMinutes <= wEnd; t += step) {
      if (seen.has(t)) continue;

      const overlapsBlocked = blocked.some(
        ([bs, be]) => t < be && t + serviceDurationMinutes > bs
      );
      if (overlapsBlocked) continue;

      const start = new Date(date);
      start.setHours(Math.floor(t / 60), t % 60, 0, 0);
      if (start.getTime() <= now.getTime()) continue; // no past slots

      const end = new Date(
        start.getTime() + serviceDurationMinutes * 60 * 1000
      );
      seen.add(t);
      slots.push({ start, end, label: toHHMM(t) });
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

// Generate the next N days that have at least one slot.
export function nextAvailableDays(
  args: Omit<ComputeArgs, "date">,
  fromDate: Date,
  numDays: number
): { date: Date; slots: Slot[] }[] {
  const out: { date: Date; slots: Slot[] }[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const slots = computeDaySlots({ ...args, date });
    out.push({ date, slots });
  }
  return out;
}

// --- Grid <-> rules conversion ----------------------------------------------
// The weekly grid selects (dayOfWeek, hour) cells. Compress consecutive hours
// into contiguous AvailabilityRule blocks per day.
export interface GridSelection {
  // key: `${dayOfWeek}-${hour}` present = available
  [key: string]: boolean;
}

export function gridToRules(
  selection: GridSelection,
  hours: number[]
): { dayOfWeek: number; startTime: string; endTime: string }[] {
  const rules: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  for (let day = 1; day <= 7; day++) {
    let blockStart: number | null = null;
    let prev: number | null = null;
    for (const h of hours) {
      const on = selection[`${day}-${h}`];
      if (on) {
        if (blockStart === null) blockStart = h;
        prev = h;
      } else if (blockStart !== null && prev !== null) {
        rules.push({
          dayOfWeek: day,
          startTime: toHHMM(blockStart * 60),
          endTime: toHHMM((prev + 1) * 60),
        });
        blockStart = null;
        prev = null;
      }
    }
    if (blockStart !== null && prev !== null) {
      rules.push({
        dayOfWeek: day,
        startTime: toHHMM(blockStart * 60),
        endTime: toHHMM((prev + 1) * 60),
      });
    }
  }
  return rules;
}

export function rulesToGrid(
  rules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]
): GridSelection {
  const selection: GridSelection = {};
  for (const r of rules) {
    if (!r.isAvailable) continue;
    const start = toMinutes(r.startTime) / 60;
    const end = toMinutes(r.endTime) / 60;
    for (let h = start; h < end; h++) {
      selection[`${r.dayOfWeek}-${h}`] = true;
    }
  }
  return selection;
}
