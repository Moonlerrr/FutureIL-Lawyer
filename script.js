/***********************
 *  STATE & STORAGE
 ***********************/
let workers = JSON.parse(localStorage.getItem("workers")) || [];
let deletedCount = Number(localStorage.getItem("deletedCount")) || 0;
let editIndex = null;

function saveAll() {
  localStorage.setItem("workers", JSON.stringify(workers));
  localStorage.setItem("deletedCount", deletedCount);
  render();
}

/***********************
 *  ADD WORKER
 ***********************/
function addWorker() {
  const name = nameInput.value.trim();
  const userId = userIdInput.value.trim();
  const rank = rankInput.value;

  if (!name || !userId) return alert("חובה למלא שם ויוזר איידי");

  workers.push({
    name,
    userId,
    rank,
    hours: "X",          // X / חצי מינימום / מינימום
    absent: false,       // חיסור כן/לא
    brought: 0,
    court: false,
    lawsuit: false,
    investigation: false,
    car: false,
    ad: false,
    joined: new Date().toISOString()
  });

  nameInput.value = "";
  userIdInput.value = "";
  saveAll();
}

/***********************
 *  RENDER
 ***********************/
function render() {
  const workersDiv = document.getElementById("workers");
  workersDiv.innerHTML = "";

  let total = workers.length;
  let absentCount = workers.filter(w => w.absent).length;
  let halfCount = workers.filter(w => w.hours === "חצי מינימום").length;
  let fullCount = workers.filter(w => w.hours === "מינימום").length;

  summary.innerHTML = `
    <b>סה״כ עובדים:</b> ${total} |
    <b>בחיסור:</b> ${absentCount} |
    <b>חצי מינימום:</b> ${halfCount} |
    <b>מינימום:</b> ${fullCount}
  `;

  workers.forEach((w, i) => {
    const bonus =
      w.brought * 150000 +
      (w.court ? 120000 : 0) +
      (w.lawsuit ? 70000 : 0) +
      (w.investigation ? 45000 : 0) +
      (w.car ? 40000 : 0) +
      (w.ad ? 15000 : 0);

    workersDiv.innerHTML += `
      <div class="worker ${w.absent ? "danger" : ""}">
        <b>${w.name}</b> (${w.userId})<br>
        דרגה: <b>${w.rank}</b><br>
        שעות: <b>${w.hours}</b><br>
        חיסור: <b>${w.absent ? "כן" : "לא"}</b><br>
        בונוסים: <b>${bonus.toLocaleString()}</b>
        <button class="editBtn" onclick="openEdit(${i})">עריכה</button>
        <button class="danger" onclick="deleteWorker(${i})">מחיקה</button>
      </div>
    `;
  });
}

/***********************
 *  EDIT
 ***********************/
function openEdit(i) {
  editIndex = i;
  const w = workers[i];

  editRank.value = w.rank;
  editHours.value = w.hours;
  editAbsent.checked = w.absent;
  editBrought.value = w.brought;

  editCourt.checked = w.court;
  editLawsuit.checked = w.lawsuit;
  editInvestigation.checked = w.investigation;
  editCar.checked = w.car;
  editAd.checked = w.ad;

  editModal.style.display = "block";
}

function saveEdit() {
  const w = workers[editIndex];

  w.rank = editRank.value;
  w.hours = editHours.value;
  w.absent = editAbsent.checked;
  w.brought = Number(editBrought.value) || 0;

  w.court = editCourt.checked;
  w.lawsuit = editLawsuit.checked;
  w.investigation = editInvestigation.checked;
  w.car = editCar.checked;
  w.ad = editAd.checked;

  closeEdit();
  saveAll();
}

function closeEdit() {
  editModal.style.display = "none";
}

/***********************
 *  DELETE
 ***********************/
function deleteWorker(i) {
  if (!confirm("למחוק עובד?")) return;
  workers.splice(i, 1);
  deletedCount++;
  saveAll();
}

/***********************
 *  RESET BUTTON
 ***********************/
function resetHoursAndBonuses() {
  if (!confirm("לאפס שעות, חיסורים ובונוסים לכולם?")) return;

  workers.forEach(w => {
    w.hours = "X";
    w.absent = false;
    w.brought = 0;
    w.court = false;
    w.lawsuit = false;
    w.investigation = false;
    w.car = false;
    w.ad = false;
  });

  saveAll();
}

/***********************
 *  WEEKLY REPORT
 ***********************/
function generateReport() {
  const total = workers.length;
  const half = workers.filter(w => w.hours === "חצי מינימום").length;
  const full = workers.filter(w => w.hours === "מינימום").length;

  let status = "פעילות נמוכה";
  if (full > total * 0.6) status = "רוב העובדים עמדו ביעדים";
  else if (full + half > total * 0.6) status = "פעילות סבירה עם חוסרים";

  reportOutput.value = `# __💼 דוח שבועי עורכי דין💼 __

**מנכ״ל: יש**

**עובדים: ${total} (לא כולל אחראי עבודה)**

**עובדים חדשים: ${
    workers.filter(w => {
      const d = new Date(w.joined);
      const now = new Date();
      return now - d < 4 * 24 * 60 * 60 * 1000;
    }).length
  }**

**עפו / פרשו: ${deletedCount}**

**ממתינים לתדרוך: ${awaitingInput.value || 0}**

**סטטוס עבודה: ${status}**

**הצעות: ${suggestionsInput.value || "אין"}**

**בעיות: ${problemsInput.value || "אין"}**
`;
}

/***********************
 *  INIT
 ***********************/
render();
