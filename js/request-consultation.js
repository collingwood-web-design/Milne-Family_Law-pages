(() => {
  const form = document.getElementById("contact-form");
  if (!form || !form.classList.contains("request-form")) return;

  const SUCCESS_MESSAGE =
    "Thank you. Your request has been sent. I’ll confirm a time within one business day. If your matter is urgent, please call 705-408-3370.";

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextBusinessDay = new Date(today);
  do {
    nextBusinessDay.setDate(nextBusinessDay.getDate() + 1);
  } while (isWeekend(nextBusinessDay));
  const minSlotDate = toISO(nextBusinessDay);

  const longDate = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Readable dates (e.g. "Monday, October 12, 2026") are sent via hidden fields.
  const syncLabel = (input) => {
    const target = form.querySelector(`input[type="hidden"][name="${input.dataset.labelTarget}"]`);
    if (!target) return;
    target.value = input.value ? `${longDate.format(fromISO(input.value))} (${input.value})` : "";
  };

  const slotDates = form.querySelectorAll("[data-weekday-date]");
  const validateSlot = (input) => {
    let message = "";
    if (input.value) {
      if (isWeekend(fromISO(input.value))) {
        message = "Please choose a weekday (Monday to Friday).";
      } else if (input.value < minSlotDate) {
        message = "Please choose a date at least one business day from today.";
      }
    }
    input.setCustomValidity(message);
  };

  slotDates.forEach((input) => {
    input.min = minSlotDate;
    input.addEventListener("input", () => {
      validateSlot(input);
      syncLabel(input);
    });
    input.addEventListener("change", () => {
      validateSlot(input);
      syncLabel(input);
    });
  });

  const courtWrap = form.querySelector("[data-court-date]");
  const courtDate = courtWrap?.querySelector('input[type="date"]');
  const courtHidden = courtWrap?.querySelector('input[type="hidden"]');
  const courtYes = form.querySelector('[data-court-toggle][value="Yes"]');

  const updateCourt = () => {
    if (!courtWrap || !courtDate || !courtHidden || !courtYes) return;
    const show = courtYes.checked;
    courtWrap.hidden = !show;
    courtDate.disabled = !show;
    courtDate.required = show;
    courtHidden.disabled = !show;
  };

  if (courtDate) {
    courtDate.min = toISO(today);
    courtDate.addEventListener("input", () => syncLabel(courtDate));
    courtDate.addEventListener("change", () => syncLabel(courtDate));
  }
  form.querySelectorAll("[data-court-toggle]").forEach((radio) => {
    radio.addEventListener("change", updateCourt);
  });

  const description = form.querySelector('textarea[name="Brief Description"]');
  const counter = form.querySelector("[data-char-count]");
  const updateCount = () => {
    if (!description || !counter) return;
    const max = Number(description.getAttribute("maxlength")) || 500;
    const left = max - description.value.length;
    counter.textContent = `${left} character${left === 1 ? "" : "s"} left`;
  };
  description?.addEventListener("input", updateCount);

  form.addEventListener("reset", () => {
    setTimeout(() => {
      form.querySelectorAll("input[type='hidden'][name]").forEach((input) => {
        if (input.name !== "Form") input.value = "";
      });
      slotDates.forEach((input) => input.setCustomValidity(""));
      updateCourt();
      updateCount();
    }, 0);
  });

  form.addEventListener("cwd-contact:success", () => {
    const status = form.querySelector("[data-cwd-contact-status]");
    if (!status) return;
    status.textContent = SUCCESS_MESSAGE;
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  updateCourt();
  updateCount();
})();
