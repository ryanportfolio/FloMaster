// Service area: the 7 cities and their ZIP codes (zipList fact). The ZIP lists
// were written from memory and have NOT been checked against USPS data; the
// owner confirms, trims or extends them. "sometimes" holds edge ZIPs that get
// "Call me to check".
export const cities = ["Chesapeake", "Hampton", "Newport News", "Norfolk", "Portsmouth", "Suffolk", "Virginia Beach"] as const;

export const zips: Record<string, (typeof cities)[number]> = {
  // Chesapeake
  "23320": "Chesapeake", "23321": "Chesapeake", "23322": "Chesapeake", "23323": "Chesapeake", "23324": "Chesapeake", "23325": "Chesapeake",
  // Hampton
  "23651": "Hampton", "23661": "Hampton", "23663": "Hampton", "23664": "Hampton", "23665": "Hampton", "23666": "Hampton", "23667": "Hampton", "23668": "Hampton", "23669": "Hampton", "23681": "Hampton",
  // Newport News
  "23601": "Newport News", "23602": "Newport News", "23603": "Newport News", "23604": "Newport News", "23605": "Newport News", "23606": "Newport News", "23607": "Newport News", "23608": "Newport News",
  // Norfolk
  "23502": "Norfolk", "23503": "Norfolk", "23504": "Norfolk", "23505": "Norfolk", "23507": "Norfolk", "23508": "Norfolk", "23509": "Norfolk", "23510": "Norfolk", "23511": "Norfolk", "23513": "Norfolk", "23517": "Norfolk", "23518": "Norfolk", "23523": "Norfolk", "23551": "Norfolk",
  // Portsmouth
  "23701": "Portsmouth", "23702": "Portsmouth", "23703": "Portsmouth", "23704": "Portsmouth", "23707": "Portsmouth", "23708": "Portsmouth", "23709": "Portsmouth",
  // Suffolk
  "23432": "Suffolk", "23433": "Suffolk", "23434": "Suffolk", "23435": "Suffolk", "23436": "Suffolk", "23437": "Suffolk", "23438": "Suffolk",
  // Virginia Beach
  "23451": "Virginia Beach", "23452": "Virginia Beach", "23453": "Virginia Beach", "23454": "Virginia Beach", "23455": "Virginia Beach", "23456": "Virginia Beach", "23457": "Virginia Beach", "23459": "Virginia Beach", "23460": "Virginia Beach", "23461": "Virginia Beach", "23462": "Virginia Beach", "23464": "Virginia Beach",
};

// Rural or split ZIPs where coverage depends on the job.
export const sometimes = ["23437", "23438", "23457"];
