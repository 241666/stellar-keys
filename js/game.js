
const targetElement = document.getElementById("target");
const progressElement = document.getElementById("progress");
const hintElement = document.getElementById("hint");
const statsElement = document.getElementById("stats");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const keyboard = document.getElementById("keyboard");
const fingerGuide = document.getElementById("finger-guide");
const feedback = document.getElementById("practice-feedback");

const TOTAL_QUESTIONS = 10;
const questions = ["F", "J", "D", "K", "S", "L", "A", "G", "H"];

const fingerTips = {
  A: "左手小指", S: "左手無名指", D: "左手中指",
  F: "左手食指", G: "左手食指",
  H: "右手食指", J: "右手食指",
  K: "右手中指", L: "右手無名指", ";": "右手小指"
};

let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let isPlaying = false;
let targetKey = "F";

function renderKeyboard() {
  keyboard.querySelectorAll("[data-key]").forEach((keyButton) => {
    const key = keyButton.dataset.key;
    keyButton.classList.toggle("target", key === targetKey);
    keyButton.classList.remove("pressed", "wrong");
  });
}

function showTarget() {
  targetKey = questions[currentQuestion];
  targetElement.textContent = targetKey;
  progressElement.textContent =
    `練習進度：${currentQuestion + 1} / ${TOTAL_QUESTIONS}`;

  hintElement.textContent = `請按下 ${targetKey} 鍵。`;
  fingerGuide.textContent =
    `手指提示：${fingerTips[targetKey] || "請依照鍵盤位置練習"}`;

  renderKeyboard();
}

function startGame() {
  currentQuestion = 0;
  correctCount = 0;
  wrongCount = 0;
  isPlaying = true;

  startButton.hidden = true;
  restartButton.hidden = true;
  statsElement.textContent = "專心練習，不必急著追求速度！";
  feedback.textContent = "";

  showTarget();
}

function finishGame() {
  isPlaying = false;
  targetElement.textContent = "🌿";
  progressElement.textContent = "練習完成！";
  hintElement.textContent = "做得很好！你完成了這一輪。";
  fingerGuide.textContent = "下一步：繼續熟悉主列按鍵。";

  const total = correctCount + wrongCount;
  const accuracy = total ? Math.round(correctCount / total * 100) : 0;

  statsElement.textContent =
    `答對 ${correctCount} 次｜錯誤 ${wrongCount} 次｜正確率 ${accuracy}%`;

  restartButton.hidden = false;
  feedback.textContent = "🌸 恭喜完成森林鍵位練習！";
}

function handleKey(key) {
  if (!isPlaying) return;

  const pressed = key.toUpperCase();
  if (!/^[A-Z;]$/.test(pressed)) return;

  const keyButton = keyboard.querySelector(`[data-key="${pressed}"]`);

  if (pressed === targetKey) {
    correctCount++;
    currentQuestion++;

    if (keyButton) keyButton.classList.add("pressed");
    feedback.textContent = "答對了！";

    if (currentQuestion >= TOTAL_QUESTIONS) {
      setTimeout(finishGame, 250);
    } else {
      setTimeout(showTarget, 250);
    }
  } else {
    wrongCount++;
    if (keyButton) keyButton.classList.add("wrong");

    feedback.textContent = `再試一次！這題要按 ${targetKey}。`;
    hintElement.textContent = `請找出 ${targetKey} 鍵，再試一次。`;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  handleKey(event.key);
});

keyboard.addEventListener("click", (event) => {
  const keyButton = event.target.closest("[data-key]");
  if (keyButton) handleKey(keyButton.dataset.key);
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
