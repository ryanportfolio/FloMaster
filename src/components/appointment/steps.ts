// The six updates a booked customer gets (design brief section 5, "Appointment
// updates"), in order. Wording is the live /appointment page's sample wording;
// business facts inside the texts render through Fact in TextBody.astro.
export const steps = [
  { id: "requested", n: 1, label: "Requested", when: "Right after booking" },
  { id: "confirmed", n: 2, label: "Confirmed", when: "When I confirm" },
  { id: "reminder", n: 3, label: "Reminder", when: "The evening before" },
  { id: "onway", n: 4, label: "On my way", when: "When I leave the job before yours" },
  { id: "arrived", n: 5, label: "Arrived", when: "When I pull up" },
  { id: "done", n: 6, label: "Done", when: "After the job" },
] as const;

export type StepId = (typeof steps)[number]["id"];

// The sample booking the texts describe (same sample as /book/confirmed).
export const sample = {
  customer: "Denise",
  job: "Water heater",
  address: "1200 Colonial Ave, Norfolk 23517",
  windowDay: "Thu Oct 8",
  windowTime: "10 a.m. to 12 p.m.",
  textsTo: "(757) 555-0142",
  jobDone: "Replaced the thermostat; water heater tested and working",
  paid: "$245",
  eta: "about 20 minutes out",
};
