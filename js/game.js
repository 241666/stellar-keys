const targetElement = document.getElementById("target");
const progressElement = document.getElementById("progress");
const hintElement = document.getElementById("hint");
const statsElement = document.getElementById("stats");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

const keyF = document.getElementById("key-f");
const keyJ = document.getElementById("key-j");

const TOTAL_QUESTIONS = 10;

let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let isPlaying = false;
let targetKey = "F";

function showTarget() {
  targetKey = Math.random() < 0.5 ? "F" : "J";

  targetElement.textContent = targetKey;
  progressElement.textContent =
    `練習進度：${currentQuestion + 1} / ${TOTAL_QUESTIONS}`;

  keyF.classList.toggle("active", targetKey === "F");
  keyJ.classList.toggle("active", targetKey === "J");

  keyF.classList.remove("correct", "wrong");
  keyJ.classList.remove("correct", "wrong");

  hintElement.textContent =
    targetKey === "F"
      ? "請用左手食指按下 F 鍵。"
      : "請用右手食指按下 J 鍵。";
}

function startGame() {
  currentQuestion = 0;
  correctCount = 0;
  wrongCount = 0;
  isPlaying = true;

  startButton.hidden = true;
  restartButton.hidden = true;

  statsElement.textContent = "加油！按照提示，一題一題完成。";

  showTarget();
}

function finishGame() {
  isPlaying = false;

  targetElement.textContent = "🌿";
  progressElement.textContent = "練習完成！";
  hintElement.textContent = "每一次練習，都是熟悉鍵盤的一小步。";

  keyF.classList.remove("active");
  keyJ.classList.remove("active");

  const accuracy =
    Math.round((correctCount / (correctCount + wrongCount)) * 100) || 0;

  statsElement.textContent =
    `答對 ${correctCount} 題｜錯誤 ${wrongCount} 次｜正確率 ${accuracy}%`;

  restartButton.hidden = false;
}

document.addEventListener("keydown", (event) => {
  if (!isPlaying) return;

  // 避免按住按鍵時，瀏覽器重複觸發多次
  if (event.repeat) return;

  const pressedKey = event.key.toUpperCase();

  // 只處理 F 與 J，其他按鍵不影響進度
  if (pressedKey !== "F" && pressedKey !== "J") return;

  if (pressedKey === targetKey) {
    correctCount++;

    const currentKey = targetKey === "F" ? keyF : keyJ;
    currentKey.classList.add("correct");

    hintElement.textContent = "答對了！做得很好！";

    currentQuestion++;

    if (currentQuestion >= TOTAL_QUESTIONS) {
      setTimeout(finishGame, 350);
    } else {
      setTimeout(showTarget, 350);
    }
  } else {
    wrongCount++;

    const pressedElement = pressedKey === "F" ? keyF : keyJ;
    pressedElement.classList.add("wrong");

    hintElement.textContent =
      `再試一次！這一題要按 ${targetKey} 鍵。`;

    setTimeout(() => {
      pressedElement.classList.remove("wrong");
    }, 350);
  }
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
