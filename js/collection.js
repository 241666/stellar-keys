
/* Eden-Keys｜圖案收藏資料系統 */
(function () {
  const STORAGE_KEY = "edenKeysCollectedFragments";

  // 每個關卡對應一枚固定的遺跡碎片
  const FRAGMENTS = {
    1: {
      id: "forest-jade",
      name: "森林翡翠",
      description: "在森林初探中找到的第一枚碎片。"
    },
    2: {
      id: "ancient-mark",
      name: "古木印記",
      description: "藏在林間遺跡中的古老印記。"
    },
    3: {
      id: "eden-core",
      name: "桃源核心",
      description: "來自古代神殿的珍貴核心。"
    }
  };

  // 讀取已收集的碎片
  function getCollected() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(saved)
        ? saved.filter(id =>
            Object.values(FRAGMENTS).some(
              fragment => fragment.id === id
            )
          )
        : [];
    } catch (error) {
      return [];
    }
  }

  // 檢查某枚碎片是否已經收集
  function hasFragment(fragmentId) {
    return getCollected().includes(fragmentId);
  }

  // 通關後收集指定關卡的碎片
  function collectForLevel(level) {
    const fragment = FRAGMENTS[level];

    if (!fragment) {
      return {
        success: false,
        reason: "invalid-level"
      };
    }

    const collected = getCollected();

    // 已收集過就不重複發放
    if (collected.includes(fragment.id)) {
      return {
        success: true,
        alreadyCollected: true,
        fragment: fragment
      };
    }

    try {
      collected.push(fragment.id);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(collected)
      );

      return {
        success: true,
        alreadyCollected: false,
        fragment: fragment
      };
    } catch (error) {
      return {
        success: false,
        reason: "storage-error"
      };
    }
  }

  // 提供其他遊戲頁面使用的介面
  window.EdenCollection = {
    getFragments: function () {
      return Object.values(FRAGMENTS);
    },
    getCollected: getCollected,
    hasFragment: hasFragment,
    collectForLevel: collectForLevel
  };
})();
