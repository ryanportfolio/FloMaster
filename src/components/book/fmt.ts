// Booking answers as the booking page and /book/confirmed show them. The booking travels
// between the two in session storage ("fm-booking"), never in the URL.
export type Booking = {
  job?: string;
  jobId?: string;
  window?: string;
  windowDay?: string;
  windowLabel?: string;
  windowDate?: string;
  windowStart?: number;
  windowEnd?: number;
  street?: string;
  zip?: string;
  city?: string | null;
  phone?: string;
};

// The date is a calendar day in Virginia; format its own components (noon UTC, shown in UTC) so the
// visitor's timezone can never move it to the day before or after.
export const shortDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).replace(",", "");

export const fmtPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw.trim();
};

// Every answer text the pages show, keyed by the name used in data-ans="...".
export const answerTexts = (b: Booking): Record<string, string> => {
  const day = b.windowDay ?? (b.window ? b.window.split(", ").slice(0, 2).join(", ") : "");
  const win = b.windowLabel ?? (b.window ? b.window.split(", ").slice(2).join(", ") : "");
  return {
    job: b.job ?? "",
    when: b.window ?? "",
    "when-day": day,
    "when-window": win,
    "when-short": b.windowDate && win ? `${shortDay(b.windowDate)} · ${win}` : "",
    where: b.street && b.zip ? `${b.street}, ${b.city ?? ""} ${b.zip}`.replace(/\s+/g, " ") : "",
    "where-short": b.street && b.zip ? `${b.street} · ${b.city ?? ""} ${b.zip}`.replace(/\s+/g, " ") : "",
    phone: b.phone ? fmtPhone(b.phone) : "",
  };
};

export const fillAnswers = (root: ParentNode, texts: Record<string, string>) => {
  root.querySelectorAll<HTMLElement>("[data-ans]").forEach((el) => {
    el.textContent = texts[el.dataset.ans!] ?? "";
  });
};
