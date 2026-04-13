(function () {
  "use strict";

  const dueDate = new Date("2026-04-16");

  const cb = document.querySelector(
    '[data-testid="test-todo-complete-toggle"]',
  );
  const card = document.querySelector('[data-testid="test-todo-card"]');
  const timeRemEl = document.querySelector(
    '[data-testid="test-todo-time-remaining"]',
  );
  const timeRemText = document.getElementById("time-remaining-text");

  document.getElementById("due-date-text").textContent =
    "Due " +
    dueDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  document
    .querySelector('[data-testid="test-todo-due-date"]')
    .setAttribute("datetime", dueDate.toISOString());
  timeRemEl.setAttribute("datetime", dueDate.toISOString());

  function renderTimes() {
    if (cb.checked) {
      timeRemText.textContent = "Task Completed!";
      timeRemEl.className = "meta-value meta-value--urgency urgency-done";
      return;
    }

    const diff = dueDate.getTime() - Date.now();
    const min = Math.round(Math.abs(diff) / 60000);
    const hr = Math.round(Math.abs(diff) / 3600000);
    const day = Math.round(Math.abs(diff) / 86400000);
    const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

    if (diff < 0) {
      timeRemText.textContent = `Overdue by ${min < 60 ? plural(min, "min") : hr < 24 ? plural(hr, "hour") : plural(day, "day")}`;
      timeRemEl.className = "meta-value meta-value--urgency urgency-overdue";
    } else if (min < 60) {
      timeRemText.textContent =
        min < 1 ? "Due now!" : `Due in ${plural(min, "min")}`;
      timeRemEl.className = "meta-value meta-value--urgency urgency-today";
    } else if (hr < 24) {
      timeRemText.textContent = `Due in ${plural(hr, "hour")}`;
      timeRemEl.className = "meta-value meta-value--urgency urgency-today";
    } else {
      timeRemText.textContent =
        day === 1 ? "Due tomorrow" : `Due in ${plural(day, "day")}`;
      timeRemEl.className = "meta-value meta-value--urgency";
    }
  }

  cb.addEventListener("change", () => {
    card.classList.toggle("card--done", cb.checked);
    document.getElementById("status-text").textContent = cb.checked
      ? "Done"
      : "In Progress";
    document
      .querySelector('[data-testid="test-todo-status"]')
      .setAttribute(
        "aria-label",
        `Status: ${cb.checked ? "Done" : "In Progress"}`,
      );
    renderTimes();
  });

  document
    .querySelector('[data-testid="test-todo-edit-button"]')
    .addEventListener("click", () => console.log("edit clicked"));
  document
    .querySelector('[data-testid="test-todo-delete-button"]')
    .addEventListener("click", () => alert("Delete clicked"));

  renderTimes();
  setInterval(renderTimes, 45000);
})();
