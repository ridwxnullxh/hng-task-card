(function () {
  "use strict";

  // Reverting to localized date rather than complete state management rewrite
  // while adding support for the new features properly logic-wise.
  let dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // some default future date

  const cb = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const card = document.querySelector('[data-testid="test-todo-card"]');
  const timeRemEl = document.querySelector('[data-testid="test-todo-time-remaining"]');
  const timeRemText = document.getElementById("time-remaining-text");
  
  // New Elements for features
  const statusSelect = document.getElementById("status-control");
  const statusBadge = document.getElementById("status-badge");
  const statusText = document.getElementById("status-text");
  
  const priorityBar = document.getElementById("priority-bar");
  const priorityBadge = document.querySelector('[data-testid="test-todo-priority"]');
  
  const cardView = document.getElementById("card-view");
  const cardEdit = document.getElementById("card-edit");

  const titleEl = document.getElementById("todo-title");
  const descEl = document.getElementById("todo-description");
  
  const overdueInd = document.getElementById("overdue-indicator");
  const expandToggle = document.getElementById("expand-toggle");
  const collapsible = document.getElementById("collapsible-section");

  const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]');
  const deleteBtn = document.querySelector('[data-testid="test-todo-delete-button"]');
  
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  
  const editTitleInput = document.getElementById("edit-title-input");
  const editDescInput = document.getElementById("edit-description-input");
  const editPrioritySelect = document.getElementById("edit-priority-select");
  const editDueDateInput = document.getElementById("edit-due-date-input");

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  function updateDueDateUI() {
    document.getElementById("due-date-text").textContent = "Due " + formatDate(dueDate);
    document.getElementById("due-date-el").setAttribute("datetime", dueDate.toISOString());
    timeRemEl.setAttribute("datetime", dueDate.toISOString());
  }

  // Enhanced Render Times with Overdue logic and minutes/hours
  function renderTimes() {
    if (cb.checked) {
      timeRemText.textContent = "Task Completed!";
      timeRemEl.className = "meta-value meta-value--urgency urgency-done";
      overdueInd.hidden = true;
      card.classList.remove("card--overdue");
      return;
    }

    const diff = dueDate.getTime() - Date.now();
    const min = Math.round(Math.abs(diff) / 60000);
    const hr = Math.round(Math.abs(diff) / 3600000);
    const day = Math.round(Math.abs(diff) / 86400000);
    const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

    let isOverdue = false;

    if (diff < 0) {
      isOverdue = true;
      timeRemText.textContent = `Overdue by ${min < 60 ? plural(min, "minute") : hr < 24 ? plural(hr, "hour") : plural(day, "day")}`;
      timeRemEl.className = "meta-value meta-value--urgency urgency-overdue";
    } else if (min < 60) {
      timeRemText.textContent = min < 1 ? "Due now!" : `Due in ${plural(min, "minute")}`;
      timeRemEl.className = "meta-value meta-value--urgency urgency-today";
    } else if (hr < 24) {
      timeRemText.textContent = `Due in ${plural(hr, "hour")}`;
      timeRemEl.className = "meta-value meta-value--urgency urgency-today";
    } else {
      timeRemText.textContent = day === 1 ? "Due tomorrow" : `Due in ${plural(day, "day")}`;
      timeRemEl.className = "meta-value meta-value--urgency";
    }

    overdueInd.hidden = !isOverdue;
    card.classList.toggle("card--overdue", isOverdue);
  }

  // Checkbox <-> Select <-> Text Syncer
  function syncStatus(from) {
    let statusVal = "Pending";
    if (from === "checkbox") {
      statusVal = cb.checked ? "Done" : "In Progress";
      statusSelect.value = statusVal;
    } else if (from === "select") {
      statusVal = statusSelect.value;
      cb.checked = (statusVal === "Done");
    }

    card.classList.toggle("card--done", cb.checked);
    statusText.textContent = statusVal;
    
    const statusDot = document.getElementById("status-badge").querySelector('.badge__dot');
    statusDot.className = "badge__dot";
    if (statusVal === "Done") {
      statusDot.classList.add("dot--done");
    } else if (statusVal === "Pending") {
      statusDot.classList.add("dot--pending");
    } else {
      statusDot.classList.add("dot--progress");
    }
    
    statusSelect.className = "status-select";
    if (statusVal === "Done") statusSelect.classList.add("status--done");
    else if (statusVal === "Pending") statusSelect.classList.add("status--pending");
    else statusSelect.classList.add("status--progress");

    renderTimes();
  }

  // Collapsible toggle check
  function checkCollapsible() {
    const isLong = descEl.textContent.trim().length > 120;
    if (!isLong) {
      collapsible.classList.remove("is-collapsed");
      collapsible.classList.add("is-expanded");
      expandToggle.style.display = "none";
    } else {
      collapsible.classList.add("is-collapsed");
      collapsible.classList.remove("is-expanded");
      expandToggle.style.display = "inline-flex";
      expandToggle.setAttribute("aria-expanded", "false");
      expandToggle.querySelector(".expand-btn__text").textContent = "Show more";
    }
  }

  cb.addEventListener("change", () => syncStatus("checkbox"));
  statusSelect.addEventListener("change", () => syncStatus("select"));

  // Edit Handlers
  editBtn.addEventListener("click", () => {
    editTitleInput.value = titleEl.textContent.trim();
    editDescInput.value = descEl.textContent.trim();
    
    let currentPri = "Medium";
    if (priorityBadge.textContent.includes("HIGH")) currentPri = "High";
    if (priorityBadge.textContent.includes("LOW")) currentPri = "Low";
    editPrioritySelect.value = currentPri;
    
    const localDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000);
    editDueDateInput.value = localDate.toISOString().split("T")[0];

    cardView.hidden = true;
    cardEdit.hidden = false;
    editTitleInput.focus();
  });

  cancelBtn.addEventListener("click", () => {
    cardEdit.hidden = true;
    cardView.hidden = false;
  });

  saveBtn.addEventListener("click", () => {
    titleEl.textContent = editTitleInput.value || "Untitled Task";
    descEl.textContent = editDescInput.value || "No description provided.";

    const pri = editPrioritySelect.value;
    priorityBadge.textContent = `${pri.toUpperCase()} PRIORITY`;
    priorityBadge.className = `badge badge--${pri.toLowerCase()}`;
    priorityBar.className = `priority-bar ${pri.toLowerCase()}`;

    if (editDueDateInput.value) {
      const parts = editDueDateInput.value.split('-');
      dueDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
      updateDueDateUI();
      renderTimes();
    }

    checkCollapsible();
    
    cardEdit.hidden = true;
    cardView.hidden = false;
  });

  // Delete handler
  deleteBtn.addEventListener("click", () => {
    if (confirm("Delete this task?")) {
        card.remove();
    }
  });

  // Expand Toggle
  expandToggle.addEventListener("click", () => {
    const isExp = expandToggle.getAttribute("aria-expanded") === "true";
    expandToggle.setAttribute("aria-expanded", String(!isExp));
    collapsible.classList.toggle("is-collapsed", isExp);
    collapsible.classList.toggle("is-expanded", !isExp);
    expandToggle.querySelector(".expand-btn__text").textContent = !isExp ? "Show less" : "Show more";
    expandToggle.classList.toggle("is-expanded", !isExp);
  });

  // Init
  updateDueDateUI();
  syncStatus("checkbox");
  checkCollapsible();
  setInterval(renderTimes, 45000);
})();
