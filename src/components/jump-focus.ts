// Following an in-page link moves focus to the thing it names, so a screen reader reads on from
// there and the next Tab continues from there, instead of focus falling back to the page. Targets
// opt in with tabindex="-1" (focusable by script, never a Tab stop): the header valve tags' targets
// (ValveTagHero.astro) and the FAQ term sections (FaqTerms.astro). The browser has already scrolled
// the target clear of the sticky header (scroll-padding-top in global.css), so focus moves without
// scrolling again. A click on a link to the hash already in the address bar fires no hashchange,
// hence the click listener.
const land = (hash: string | null) => {
  if (!hash || hash.length < 2) return;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (el && el.getAttribute("tabindex") === "-1" && document.activeElement !== el) el.focus({ preventScroll: true });
};
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute("href");
  setTimeout(() => { if (!e.defaultPrevented) land(href); });
});
addEventListener("hashchange", () => land(location.hash));
land(location.hash);
