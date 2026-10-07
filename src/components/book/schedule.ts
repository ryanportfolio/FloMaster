// Arrival windows for booking question 2, worked out only from facts.ts:
// - working hours: workingHours (machine version of P10, facts.hours)
// - window length: two hours, the example in the P29 question (facts.windows, still open)
// - move-by time: the hour count in P15 (facts.cancellation)
// - weekend fee: P14 (facts.afterHoursWhen says weekends count as after-hours)
// No availability is invented: every window inside the hours shows as open.
import { facts, workingHours } from "../../data/facts";

export type Win = { label: string; start: number; end: number; from: string; to: string; fromMer: string; toMer: string; moveBy: string };
export type Day = { iso: string; label: string; dow: string; dowLong: string; date: number; month: string; weekend: boolean; open: number; close: number; hoursLabel: string; windows: Win[] };

const LENGTH = 2;
const TZ = { timeZone: "America/New_York" } as const;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ampm = (h: number) => (h < 12 ? "a.m." : "p.m.");
const h12 = (h: number) => String(h % 12 || 12);
const clock = (h: number) => `${h12(h)} ${ampm(h)}`;
export const rangeLabel = (s: number, e: number) => (ampm(s) === ampm(e) ? `${h12(s)} to ${clock(e)}` : `${clock(s)} to ${clock(e)}`);

export const moveHours = Number(facts.cancellation.value.match(/(\d+) hours?/)?.[1] ?? 0);
export const weekendIsAfterHours = /weekend/i.test(facts.afterHoursWhen.value);

const hoursFor = (dow: number) => (dow === 0 ? workingHours.sunday : dow === 6 ? workingHours.saturday : workingHours.weekday);
const dowOf = (d: Date) => DAYS.indexOf(d.toLocaleDateString("en-US", { weekday: "long", ...TZ }));

// The time `moveHours` before the window starts. When that falls before the day opens (a 7 a.m.
// window with a 2-hour term gives 5 a.m.), the term is stated as written instead of as a clock
// time outside working hours; moving the deadline to the evening before would change the term.
function moveBy(date: Date, start: number): string {
  const today = hoursFor(dowOf(date));
  const same = start - moveHours;
  if (today && same >= today[0]) return `${clock(same)} ${DAYS[dowOf(date)]}`;
  return `${moveHours} hours before it starts`;
}

// The next `count` days that have working hours, starting tomorrow, Virginia time.
export function nextDays(count = 6): Day[] {
  const days: Day[] = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    const dow = dowOf(d);
    const hours = hoursFor(dow);
    if (!hours) continue;
    const [open, close] = hours;
    const windows: Win[] = [];
    for (let s = open; s + LENGTH <= close; s += LENGTH) {
      const e = s + LENGTH;
      windows.push({ label: rangeLabel(s, e), start: s, end: e, from: h12(s), to: h12(e), fromMer: ampm(s), toMer: ampm(e), moveBy: moveBy(new Date(d), s) });
    }
    days.push({
      iso: new Intl.DateTimeFormat("en-CA", TZ).format(d),
      label: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", ...TZ }),
      dow: DAYS[dow].slice(0, 3),
      dowLong: DAYS[dow],
      date: Number(d.toLocaleDateString("en-US", { day: "numeric", ...TZ })),
      month: d.toLocaleDateString("en-US", { month: "short", ...TZ }),
      weekend: dow === 6,
      open,
      close,
      hoursLabel: `${clock(open)} to ${clock(close)}`,
      windows,
    });
  }
  return days;
}

// "October" or "October and November" for the strip caption.
export const monthSpan = (days: Day[]) => [...new Set(days.map((d) => new Date(`${d.iso}T12:00:00`).toLocaleDateString("en-US", { month: "long" })))].join(" and ");
