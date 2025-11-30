// assets/js/custom.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    address: document.getElementById("address"),
    rating1: document.getElementById("rating1"),
    rating2: document.getElementById("rating2"),
    rating3: document.getElementById("rating3"),
  };

  const submitBtn = document.getElementById("submitBtn");
  const summaryBox = document.getElementById("formSummary");
  const successPopup = document.getElementById("successPopup");

  // Uždedam pradinę reikšmę telefono laukui
  if (fields.phone) {
    fields.phone.value = "+370 ";
  }

  // Klaidos žinučių elementai
  const errorBoxes = {};
  document.querySelectorAll(".field-error-text").forEach((el) => {
    const key = el.getAttribute("data-for");
    if (key) errorBoxes[key] = el;
  });

  function setError(fieldName, message) {
    const input = fields[fieldName];
    const box = errorBoxes[fieldName];
    if (!input || !box) return;

    if (message) {
      input.classList.add("field-invalid");
      box.textContent = message;
    } else {
      input.classList.remove("field-invalid");
      box.textContent = "";
    }
  }

  function isEmailValid(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  }

  function isLettersOnly(value) {
    return /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s'-]+$/.test(value);
  }

  // ---------- TELEFONO FORMATAVIMAS: +370 6xx xxxxx ----------
  function formatPhone(input) {
    // visi skaičiai iš lauko
    let digits = input.replace(/\D/g, "");

    // išmetam "370" (pradžią visada statom patys)
    digits = digits.slice(3);

    // leidžiame max 8 skaitmenis po +370
    digits = digits.slice(0, 8);

    let formatted = "+370 ";

    if (digits.length > 0) {
      // pirmas skaitmuo (turi būti 6 pagal formatą)
      formatted += digits[0]; // 6
    }

    if (digits.length > 1) {
      // kiti du skaitmenys xx (be tarpo tarp 6 ir xx)
      formatted += digits.slice(1, 3);
    }

    if (digits.length > 3) {
      // likę 5 skaitmenys po tarpo xxxxx
      formatted += " " + digits.slice(3);
    }

    fields.phone.value = formatted;
  }

  fields.phone.addEventListener("input", () => {
    // saugom, kad pradžia visada būtų "+370 "
    if (!fields.phone.value.startsWith("+370")) {
      fields.phone.value = "+370 ";
    }

    formatPhone(fields.phone.value);
    validateField("phone");
    updateSubmitState();
  });

  // ---------- VALIDACIJA ----------

  function validateField(name) {
    const value = fields[name].value.trim();

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value) return setError(name, "Laukas privalomas.");
        if (!isLettersOnly(value))
          return setError(name, "Naudokite tik raides.");
        break;

      case "email":
        if (!value) return setError(name, "Laukas privalomas.");
        if (!isEmailValid(value))
          return setError(name, "Neteisingas el. pašto formatas.");
        break;

      case "address":
        if (!value) return setError(name, "Laukas privalomas.");
        break;

      case "rating1":
      case "rating2":
      case "rating3": {
        if (!value) return setError(name, "Įveskite skaičių 1–10.");
        const num = Number(value);
        if (Number.isNaN(num) || num < 1 || num > 10)
          return setError(name, "Reikšmė turi būti tarp 1 ir 10.");
        break;
      }

      case "phone": {
        const raw = fields.phone.value;

        // turi prasidėti tiksliai taip
        if (!raw.startsWith("+370")) {
          return setError("phone", "Numeris turi prasidėti +370.");
        }

        let digits = raw.replace(/\D/g, "").slice(3); // tik po +370

        // turi būti lygiai 8 skaitmenys po +370: 6xx xxxxx
        if (digits.length !== 8) {
          return setError(
            "phone",
            "Numeris turi būti formato +370 6xx xxxxx (8 skaitmenys)."
          );
        }

        if (digits[0] !== "6") {
          return setError(
            "phone",
            "Pirmas skaitmuo po +370 turi būti 6."
          );
        }

        break;
      }
    }

    setError(name, "");
  }

  // Įvykiai kitiems laukams
  Object.keys(fields).forEach((name) => {
    if (name === "phone") return;
    fields[name].addEventListener("input", () => {
      validateField(name);
      updateSubmitState();
    });
  });

  function allValid() {
    Object.keys(fields).forEach(validateField);
    return Object.values(errorBoxes).every((b) => b.textContent === "");
  }

  function updateSubmitState() {
    submitBtn.disabled = !allValid();
  }

  // ---------- FORMOS PATEIKIMAS ----------

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!allValid()) return;

    const data = {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      address: fields.address.value.trim(),
      rating1: Number(fields.rating1.value),
      rating2: Number(fields.rating2.value),
      rating3: Number(fields.rating3.value),
    };

    data.averageRating = (
      (data.rating1 + data.rating2 + data.rating3) /
      3
    ).toFixed(1);

    console.log("Forma pateikta:", data);

    summaryBox.innerHTML = `
      <p><strong>Vardas:</strong> ${data.firstName}</p>
      <p><strong>Pavardė:</strong> ${data.lastName}</p>
      <p><strong>El. paštas:</strong> ${data.email}</p>
      <p><strong>Telefonas:</strong> ${data.phone}</p>
      <p><strong>Adresas:</strong> ${data.address}</p>
      <p><strong>Dizainas:</strong> ${data.rating1}</p>
      <p><strong>Patogumas:</strong> ${data.rating2}</p>
      <p><strong>Turinys:</strong> ${data.rating3}</p>
      <p><strong>Vidurkis:</strong> ${data.averageRating}</p>
    `;

    successPopup.textContent = "Duomenys pateikti sėkmingai!";
    successPopup.classList.add("visible");

    setTimeout(() => {
      successPopup.classList.remove("visible");
    }, 3000);
  });

  updateSubmitState();
});

// 12 laboras

/* ===========================
      MEMORY GAME SYSTEM
=========================== */

const cardSet = ["🍎", "🍌", "🍇", "🍒", "🍉", "🥝"]; // 6 unikalūs simboliai

const difficultyMap = {
  easy: { rows: 3, cols: 4 },  // 12 kortų (6 poros)
  hard: { rows: 4, cols: 6 }   // 24 kortos (12 porų)
};

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let pairs = 0;
let totalPairs = 0;

let currentDifficulty = "easy";

// laikmatis
let timerId = null;
let timeElapsed = 0;

// localStorage raktai
const BEST_KEY_EASY = "memoryBestMoves_easy";
const BEST_KEY_HARD = "memoryBestMoves_hard";

const board = document.getElementById("gameBoard");
const movesBox = document.getElementById("moves");
const pairsBox = document.getElementById("pairs");
const timeBox = document.getElementById("time");
const winBox = document.getElementById("winMessage");
const bestEasyBox = document.getElementById("bestEasy");
const bestHardBox = document.getElementById("bestHard");

// jei sekcija neegzistuoja – nieko nedarom
if (board && movesBox && pairsBox) {
  // mygtukai
  document.getElementById("startGame").addEventListener("click", () => startGame(false));
  document.getElementById("resetGame").addEventListener("click", () => startGame(true));

  // užkraunam geriausius rezultatus iš localStorage
  loadBestScores();
}

// --------- LOCALSTORAGE FUNKCIJOS ---------

function loadBestScores() {
  const easy = localStorage.getItem(BEST_KEY_EASY);
  const hard = localStorage.getItem(BEST_KEY_HARD);

  bestEasyBox.textContent = easy ? easy : "-";
  bestHardBox.textContent = hard ? hard : "-";
}

function saveBestScore() {
  const key = currentDifficulty === "easy" ? BEST_KEY_EASY : BEST_KEY_HARD;
  const prev = localStorage.getItem(key);

  if (!prev || moves < Number(prev)) {
    localStorage.setItem(key, String(moves));

    if (currentDifficulty === "easy") {
      bestEasyBox.textContent = moves;
    } else {
      bestHardBox.textContent = moves;
    }
  }
}

// --------- LAIKMATIS ---------

function startTimer() {
  stopTimer();
  timeElapsed = 0;
  timeBox.textContent = "0";

  timerId = setInterval(() => {
    timeElapsed++;
    timeBox.textContent = timeElapsed;
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

// --------- ŽAIDIMO PALEIDIMAS ---------

function startGame(resetOnly) {
  const modeSelect = document.getElementById("difficulty");
  if (!modeSelect) return;

  currentDifficulty = modeSelect.value;

  moves = 0;
  pairs = 0;
  movesBox.textContent = "0";
  pairsBox.textContent = "0";
  winBox.textContent = "";

  // jei paspaustas Start / Atnaujinti – naujas laikmatis
  startTimer();

  const size = difficultyMap[currentDifficulty];
  generateBoard(size.rows, size.cols);
}

// --------- LENTOS GENERAVIMAS ---------

function generateBoard(rows, cols) {
  board.innerHTML = "";
  lockBoard = false;

  let cards;

  if (rows * cols === 24) {
    // sunkus – kiekvienas iš 6 simbolių po 4 kartus (24 kortos = 12 porų)
    cards = [...cardSet, ...cardSet, ...cardSet, ...cardSet];
  } else {
    // lengvas – kiekvienas simbolis po 2 kartus (12 kortų = 6 poros)
    cards = [...cardSet, ...cardSet];
  }

  totalPairs = cards.length / 2;

  shuffle(cards);

  board.style.gridTemplateColumns = `repeat(${cols}, 90px)`;

  cards.forEach((symbol) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.dataset.value = symbol;
    card.innerHTML = "";
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

// --------- MASYVO SUMAIŠYMAS ---------

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --------- KORTELIŲ APVERTIMO LOGIKA ---------

function flipCard(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  card.innerHTML = card.dataset.value;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesBox.textContent = moves;
  lockBoard = true;

  if (firstCard.dataset.value === secondCard.dataset.value) {
    matchCards();
  } else {
    setTimeout(unflipCards, 900);
  }
}

function matchCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  pairs++;
  pairsBox.textContent = pairs;

  if (pairs === totalPairs) {
    winBox.textContent = "Laimėjote!";
    stopTimer();
    saveBestScore();
  }

  resetTurn();
}

function unflipCards() {
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  firstCard.innerHTML = "";
  secondCard.innerHTML = "";
  resetTurn();
}

function resetTurn() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}
