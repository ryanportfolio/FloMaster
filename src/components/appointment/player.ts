// Player for the appointment updates. Nothing plays on load: the page
// opens on the first text, already there. Tapping a step shows every earlier
// text at once, then plays the chosen one: a short typing pause, then the text.
// Reduced motion skips the pause and the slide.
//
// Markup inside one [data-appt] root:
//   [data-step="i"]     buttons that pick step i (0-based)
//   [data-msg="i"]      the text for step i, with its "when" line (hidden until reached)
//   [data-thread]       scroll box that holds the texts
//   [data-typing]       typing dots shown during the pause
//   [data-live]         visually hidden polite live region
//   [data-next]         optional "Next text" button
//   [data-from="i"]     gets [data-on] once step i is reached
//   [data-only="i"]     shown only while step i is current
export function initAppointment(root: HTMLElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-step]")];
  const msgs = [...root.querySelectorAll<HTMLElement>("[data-msg]")].sort((a, b) => +a.dataset.msg! - +b.dataset.msg!);
  const thread = root.querySelector<HTMLElement>("[data-thread]")!;
  const typing = root.querySelector<HTMLElement>("[data-typing]");
  const live = root.querySelector<HTMLElement>("[data-live]");
  const next = root.querySelector<HTMLButtonElement>("[data-next]");
  const last = msgs.length - 1;
  let current = 0;
  let timer = 0;

  const scrollTo = (el: HTMLElement) => {
    const room = thread.clientHeight;
    const top = el.offsetTop - 8;
    const target = el.offsetHeight > room - 16 ? top : el.offsetTop + el.offsetHeight - room + 12;
    thread.scrollTo({ top: Math.max(0, target), behavior: reduce.matches ? "auto" : "smooth" });
  };

  const plain = (el: HTMLElement) => {
    const c = el.cloneNode(true) as HTMLElement;
    c.querySelectorAll(".fact-tag, [aria-hidden='true']").forEach((x) => x.remove());
    return [...c.children].map((x) => x.textContent!.replace(/\s+/g, " ").trim()).join(". ");
  };

  const mark = (n: number) => {
    root.dataset.current = String(n);
    buttons.forEach((b) => {
      const i = +b.dataset.step!;
      if (i === n) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
      b.toggleAttribute("data-played", i <= n);
    });
    root.querySelectorAll<HTMLElement>("[data-from]").forEach((el) => el.toggleAttribute("data-on", n >= +el.dataset.from!));
    root.querySelectorAll<HTMLElement>("[data-only]").forEach((el) => (el.hidden = +el.dataset.only! !== n));
    if (next) next.textContent = n === last ? "Start again" : "Next text";
  };

  const reveal = (n: number) => {
    const m = msgs[n];
    if (typing) typing.hidden = true;
    m.hidden = false;
    if (!reduce.matches) {
      m.classList.remove("arrive");
      void m.offsetWidth;
      m.classList.add("arrive");
    }
    scrollTo(m);
    if (live) live.textContent = `Text ${n + 1} of ${msgs.length}. ${plain(m)}`;
  };

  const select = (n: number) => {
    clearTimeout(timer);
    current = n;
    msgs.forEach((m, i) => {
      m.hidden = i >= n;
      m.classList.remove("arrive");
    });
    mark(n);
    if (reduce.matches || !typing) return reveal(n);
    // The dots sit where the new text will land, so the thread does not jump when it arrives.
    msgs[n].before(typing);
    typing.hidden = false;
    scrollTo(typing);
    timer = window.setTimeout(() => reveal(n), 650);
  };

  buttons.forEach((b) => b.addEventListener("click", () => select(+b.dataset.step!)));
  next?.addEventListener("click", () => select(current === last ? 0 : current + 1));

  // Resting state: the first text is already there; nothing animates on load.
  msgs.forEach((m, i) => (m.hidden = i !== 0));
  if (typing) typing.hidden = true;
  mark(0);
}
