// DOM Elements
const fetchBtn = document.getElementById('fetchBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const factDisplay = document.getElementById('factDisplay');
const savedList = document.getElementById('savedList');
const factType = document.getElementById('factType');
const historyBtn = document.getElementById('historyBtn');
const themeToggleBtn = document.getElementById('themeToggle');
const answerSection = document.getElementById('answerSection');
const userAnswerInput = document.getElementById('userAnswer');
const submitAnswerBtn = document.getElementById('submitAnswer');
const resultMsg = document.getElementById('resultMsg');
const skipTriviaBtn = document.getElementById('skipTrivia');


let currentFact = "";
let correctAnswer = "";

// Utilities
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function displayFact(factHTML) {
  currentFact = factHTML;
  factDisplay.innerHTML = factHTML;
}


// Fetch Trivia
async function getTriviaFact() {
  try {
    const res = await fetch('https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple');
    const data = await res.json();

    const question = decodeHTML(data.results[0].question);
    const answer = decodeHTML(data.results[0].correct_answer);

    displayFact(`📘 <strong>Fun Fact:</strong> ${question}<br>✅ <strong>Answer:</strong> ${answer}`);
    hideAnswerInput(); // Hide math input if previously shown
  } catch {
    displayFact("⚠️ Error fetching trivia.");
  }
}


// Fetch Math Fact
async function getMathFact() {
  const operators = ['+', '-', '*', '/', '^'];

  const op1 = operators[Math.floor(Math.random() * operators.length)];
  const op2 = operators[Math.floor(Math.random() * operators.length)];

  let a = Math.floor(Math.random() * 9) + 1;
  let b = Math.floor(Math.random() * 9) + 1;
  let c = Math.floor(Math.random() * 9) + 1;

  // Handle clean division
  if (op1 === '/') {
    b = Math.floor(Math.random() * 8) + 1;
    a = b * (Math.floor(Math.random() * 4) + 1);
  }
  if (op2 === '/') {
    c = Math.floor(Math.random() * 8) + 1;
    b = c * (Math.floor(Math.random() * 4) + 1);
  }

  // Limit exponents to small values
  if (op1 === '^') {
    a = Math.floor(Math.random() * 4) + 1;
    b = Math.floor(Math.random() * 3) + 1;
  }
  if (op2 === '^') {
    b = Math.floor(Math.random() * 4) + 1;
    c = Math.floor(Math.random() * 3) + 1;
  }

  const expression = `${a} ${op1} ${b} ${op2} ${c}`;
  const safeExpr = expression.replace(/\^/g, '**'); // ✅ replaces all ^ with **

  let answer;
  try {
    answer = eval(safeExpr);
    answer = Number.isInteger(answer) ? answer : answer.toFixed(2); // round decimals
  } catch {
    answer = "error";
  }

  correctAnswer = answer.toString();
  displayFact(`🧠 What is ${expression}?`);
  showAnswerInput();
}


// Fetch History Fact
async function getTodayInHistory() {
  try {
    const res = await fetch("https://history.muffinlabs.com/date");
    const data = await res.json();
    const events = data.data.Events;
    const random = Math.floor(Math.random() * events.length);
    const event = events[random];
    const historyText = `📅 On this day in ${event.year}: ${event.text}`;
    document.getElementById("historyDisplay").textContent = historyText;
    hideAnswerInput();
  } catch (error) {
    document.getElementById("historyDisplay").textContent = "⚠️ Could not load history data.";
    console.error(error);
  }
}

// Trivia Answer Logic
function showAnswerInput() {
  answerSection.style.display = 'block';
  userAnswerInput.value = '';
  resultMsg.textContent = '';
}

function hideAnswerInput() {
  answerSection.style.display = 'none';
}

submitAnswerBtn.addEventListener('click', () => {
  const userAnswer = userAnswerInput.value.trim().toLowerCase();
  const actualAnswer = correctAnswer.trim().toLowerCase();

  if (userAnswer === actualAnswer) {
    resultMsg.textContent = "✅ Correct!";
  } else {
    resultMsg.textContent = `❌ Incorrect. The correct answer is: ${correctAnswer}`;
  }
});

// Load and save facts
function saveFact() {
  if (!currentFact) return;
  const plainFact = currentFact.replace(/<[^>]+>/g, ''); 
  let saved = JSON.parse(localStorage.getItem('eduFacts')) || [];
  saved.push(plainFact);
  localStorage.setItem('eduFacts', JSON.stringify(saved));
  loadSaved();
}


function loadSaved() {
  savedList.innerHTML = '';
  const saved = JSON.parse(localStorage.getItem('eduFacts')) || [];
  saved.forEach(fact => {
    const li = document.createElement('li');
    li.textContent = fact;
    savedList.appendChild(li);
  });
}

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('eduFacts');
  loadSaved();
});

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? '☀️ Toggle Light Mode' : '🌙 Toggle Dark Mode';
});

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = '☀️ Toggle Light Mode';
  }
  loadSaved();
});

// Fetch fact
fetchBtn.addEventListener('click', () => {
  const type = factType.value;
  if (type === 'math') getMathFact();
  else if (type === 'trivia') getTriviaFact();
  else Math.random() < 0.5 ? getMathFact() : getTriviaFact();
});

// Hook buttons
saveBtn.addEventListener('click', saveFact);
historyBtn.addEventListener('click', getTodayInHistory);

skipTriviaBtn.addEventListener('click', () => {
  getTriviaFact(); // just load a new trivia question
});




