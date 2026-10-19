
/* ===== Eden-Keys：三階段關卡系統 ===== */

const targetElement = document.getElementById("target");
const progressElement = document.getElementById("progress");
const hintElement = document.getElementById("hint");
const statsElement = document.getElementById("stats");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const keyboard = document.getElementById("keyboard");
const fingerGuide = document.getElementById("finger-guide");
const feedback = document.getElementById("practice-feedback");

/* 檢查目前頁面是否有必要的 HTML 元素 */
const requiredElements = {
  targetElement,
  progressElement,
  hintElement,
  statsElement,
  startButton,
  restartButton,
  keyboard,
  fingerGuide,
  feedback
};

const missingElements = Object.entries(requiredElements)
  .filter(([, element]) => !element)
  .map(([name]) => name);

if (missingElements.length > 0) {
  throw new Error(
    `Eden-Keys 找不到必要的 HTML 元素：${missingElements.join(", ")}`
  );
}

/* 每一關 10 題 */
const QUESTIONS_PER_LEVEL = 10;
const PASS_ACCURACY = 80;
const TOTAL_LEVELS = 3;

/* 三個關卡的題目 */
const levels = [
  {
    name: "森林初探",
    description: "熟悉 F、J 定位鍵與基本主列按鍵。",
    questions: ["F", "J", "D", "K", "S", "L", "A", "G", "H", "F"]
  },
  {
    name: "林間探索",
    description: "擴展練習範圍，熟悉更多主列字母。",
    questions: ["F", "E", "J", "R", "D", "U", "K", "T", "I", "O"]
  },
  {
    name: "遺跡試煉",
    description: "混合不同字母，挑戰鍵位辨識能力。",
    questions: ["A", "P", "G", "E", "L", "R", "H", "U", "S", "O"]
  }
];

const TOTAL_QUESTIONS = QUESTIONS_PER_LEVEL;

/* 各字母的手指提示 */
const fingerTips = {
  A: "左手小指｜請用左手小指按下 A 鍵。",
  S: "左手無名指｜請用左手無名指按下 S 鍵。",
  D: "左手中指｜請用左手中指按下 D 鍵。",
  F: "左手食指｜請用左手食指按下 F 鍵，並留意定位凸點。",
  G: "左手食指｜左手食指從 F 鍵稍微向右移到 G 鍵。",
  H: "右手食指｜右手食指從 J 鍵稍微向左移到 H 鍵。",
  J: "右手食指｜請用右手食指按下 J 鍵，並留意定位凸點。",
  K: "右手中指｜請用右手中指按下 K 鍵。",
  L: "右手無名指｜請用右手無名指按下 L 鍵。",
  E: "左手中指｜請用左手中指按下 E 鍵。",
  R: "左手食指｜請用左手食指按下 R 鍵。",
  T: "左手食指｜請用左手食指按下 T 鍵。",
  U: "右手食指｜請用右手食指按下 U 鍵。",
  I: "右手中指｜請用右手中指按下 I 鍵。",
  O: "右手無名指｜請用右手無名指按下 O 鍵。",
  P: "右手小指｜請用右手小指按下 P 鍵。"
};

/* 關卡解鎖紀錄：同一個瀏覽器會保留 */
const UNLOCK_KEY = "edenKeysUnlockedLevel";

function loadUnlockedLevel() {
  try {
    const saved = Number(localStorage.getItem(UNLOCK_KEY));
    if (Number.isInteger(saved) && saved >= 1 && saved <= TOTAL_LEVELS) {
      return saved;
    }
  } catch (error) {
    console.warn("無法讀取關卡紀錄，將使用第一關。", error);
  }
  return 1;
}

let unlockedLevel = loadUnlockedLevel();
let selectedLevel = 1;
let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let isPlaying = false;
let isTransitioning = false;
let targetKey = "F";
let currentQuestions = levels[0].questions;

/* 建立關卡選單，不需要修改 practice.html */
const levelSelect = document.createElement("select");
levelSelect.id = "level-select";
levelSelect.className = "level-select";
levelSelect.setAttribute("aria-label", "選擇練習關卡");

const levelPanel = document.createElement("div");
levelPanel.className = "level-panel";
levelPanel.style.margin = "16px 0";
levelPanel.style.textAlign = "center";

const levelLabel = document.createElement("label");
levelLabel.htmlFor = "level-select";
levelLabel.textContent = "選擇關卡：";
levelLabel.style.marginRight = "8px";

const levelDescription = document.createElement("p");
levelDescription.id = "level-description";
levelDescription.style.margin = "10px 0";
levelDescription.style.lineHeight = "1.7";

levelPanel.append(levelLabel, levelSelect, levelDescription);
startButton.parentNode.insertBefore(levelPanel, startButton);

function renderLevelOptions() {
  levelSelect.innerHTML = "";

  levels.forEach((level, index) => {
    const levelNumber = index + 1;
    const option = document.createElement("option");
    option.value = String(levelNumber);

    const locked = levelNumber > unlockedLevel;
    option.textContent = locked
      ? `第 ${levelNumber} 關｜${level.name}（尚未解鎖）`
      : `第 ${levelNumber} 關｜${level.name}`;

    option.disabled = locked;
    levelSelect.appendChild(option);
  });

  levelSelect.value = String(selectedLevel);
  levelDescription.textContent = levels[selectedLevel - 1].description;
}

levelSelect.addEventListener("change", () => {
  if (isPlaying) return;

  selectedLevel = Number(levelSelect.value);
  levelDescription.textContent =
    levels[selectedLevel - 1].description;

  feedback.textContent = "";
  hintElement.textContent = "準備好後，按下開始練習。";
  progressElement.textContent =
    `第 ${selectedLevel} 關｜共 ${TOTAL_QUESTIONS} 題`;
  targetElement.textContent = "—";
  fingerGuide.textContent = "請依照提示使用正確的手指。";
  statsElement.textContent = "選好關卡後，開始你的練習。";
  renderKeyboard();
});

/* 更新鍵盤高亮 */
function renderKeyboard() {
  keyboard.querySelectorAll("[data-key]").forEach((keyButton) => {
    const key = keyButton.dataset.key;
    keyButton.classList.toggle(
      "target",
      isPlaying && key === targetKey
    );
    keyButton.classList.remove("pressed", "wrong");
  });
}

/* 顯示目前題目 */
function showTarget() {
  if (currentQuestion >= TOTAL_QUESTIONS) {
    finishGame();
    return;
  }

  targetKey = currentQuestions[currentQuestion];
  targetElement.textContent = targetKey;

  progressElement.textContent =
    `第 ${selectedLevel} 關｜題目 ${currentQuestion + 1} / ${TOTAL_QUESTIONS}`;

  hintElement.textContent = `請按下 ${targetKey} 鍵。`;
  fingerGuide.textContent =
    `手指提示：${fingerTips[targetKey] || "請依照鍵盤位置練習"}`;

  renderKeyboard();
}

/* 開始或重新挑戰目前選定的關卡 */
function startGame() {
  if (selectedLevel > unlockedLevel) {
    feedback.textContent = "請先完成前面的關卡！";
    return;
  }

  currentQuestion = 0;
  correctCount = 0;
  wrongCount = 0;
  isPlaying = true;
  isTransitioning = false;

  currentQuestions = levels[selectedLevel - 1].questions;

  startButton.hidden = true;
  restartButton.hidden = true;
  levelSelect.disabled = true;

  statsElement.textContent = "專心練習，不必急著追求速度！";
  feedback.textContent = "";

  showTarget();
}

/* 計算正確率：每題完成並答對，就算該題正確 */
function calculateAccuracy() {
  return currentQuestion > 0
    ? Math.round((correctCount / currentQuestion) * 100)
    : 0;
}

/* 完成本關並判斷是否過關 */
function finishGame() {
  isPlaying = false;
  isTransitioning = false;
  levelSelect.disabled = false;

  const accuracy = calculateAccuracy();
  const passed = accuracy >= PASS_ACCURACY;

  targetElement.textContent = passed ? "✓" : "↻";
  progressElement.textContent = passed ? "關卡完成！" : "再挑戰一次！";

  hintElement.textContent = passed
    ? `恭喜完成第 ${selectedLevel} 關！`
    : `本關正確率未達 ${PASS_ACCURACY}%，再練習一次就有機會過關。`;

  fingerGuide.textContent = passed
    ? "準備好後，可以挑戰下一關。"
    : "別著急，熟悉鍵位後再試一次。";

  statsElement.textContent =
    `答對 ${correctCount} 次｜錯誤 ${wrongCount} 次｜正確率 ${accuracy}%`;

  if (passed) {
        // 通關後領取本關的收藏碎片
    if (window.EdenCollection) {
      const reward = window.EdenCollection.collectForLevel(selectedLevel);

      if (reward.success) {
        feedback.textContent = reward.alreadyCollected
          ? `🌿 你已經收集過「${reward.fragment.name}」了！`
          : `✨ 獲得收藏碎片：「${reward.fragment.name}」！`;
      }
    }
    
    if (selectedLevel < TOTAL_LEVELS) {
      unlockedLevel = Math.max(unlockedLevel, selectedLevel + 1);

      try {
        localStorage.setItem(UNLOCK_KEY, String(unlockedLevel));
      } catch (error) {
        console.warn("無法儲存關卡解鎖紀錄。", error);
      }

      feedback.textContent =
        `🌿 成功通過第 ${selectedLevel} 關！已解鎖第 ${selectedLevel + 1} 關。`;
    } else {
      feedback.textContent = "🌸 恭喜完成全部森林鍵位試煉！";
    }
  } else {
    feedback.textContent =
      `本關正確率為 ${accuracy}%，需要達到 ${PASS_ACCURACY}% 才能解鎖下一關。`;
  }

  renderLevelOptions();
  restartButton.textContent = passed ? "再練習一次" : "重新挑戰本關";
  restartButton.hidden = false;

  if (passed && selectedLevel < TOTAL_LEVELS) {
    selectedLevel++;
    renderLevelOptions();
    restartButton.textContent = `開始第 ${selectedLevel} 關`;
  }
}

/* 處理鍵盤輸入 */
function handleKey(key) {
  if (!isPlaying || isTransitioning) return;

  const pressed = key.toUpperCase();
  if (!/^[A-Z;]$/.test(pressed)) return;

  const keyButton = Array.from(
    keyboard.querySelectorAll("[data-key]")
  ).find((button) => button.dataset.key === pressed);

  if (pressed === targetKey) {
    correctCount++;
    currentQuestion++;
    isTransitioning = true;

    if (keyButton) keyButton.classList.add("pressed");
    feedback.textContent = "答對了！";

    setTimeout(() => {
      if (!isPlaying) return;

      if (currentQuestion >= TOTAL_QUESTIONS) {
        finishGame();
      } else {
        isTransitioning = false;
        showTarget();
      }
    }, 250);
  } else {
    wrongCount++;

    if (keyButton) {
      keyButton.classList.add("wrong");
      setTimeout(() => keyButton.classList.remove("wrong"), 250);
    }

    feedback.textContent = `再試一次！這題要按 ${targetKey}。`;
    hintElement.textContent = `請找出 ${targetKey} 鍵，再試一次。`;
  }
}

/* 實體鍵盤輸入 */
document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  handleKey(event.key);
});

/* 畫面上的虛擬鍵盤 */
keyboard.addEventListener("click", (event) => {
  const keyButton = event.target.closest("[data-key]");
  if (keyButton) handleKey(keyButton.dataset.key);
});

/* 開始與重新挑戰 */
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

/* 初始化 */
renderLevelOptions();
targetElement.textContent = "—";
progressElement.textContent = "選擇關卡並開始練習";
hintElement.textContent = "準備好後，開始你的森林冒險。";
fingerGuide.textContent = "請依照提示使用正確的手指。";
statsElement.textContent = "目前已開放第一關。";
renderKeyboard();
