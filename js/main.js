/* =========================================
   EDEN KEYS — 桃源鍵境
   Homepage interactions
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("#menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const toast = document.querySelector("#toast");

  let toastTimer;

  // 手機版導覽選單
  function closeMenu() {
    if (!menuToggle || !siteNav) return;

    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "開啟導覽選單");
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "開啟導覽選單" : "關閉導覽選單"
      );

      siteNav.classList.toggle("is-open", !isOpen);
    });

    // 點擊導覽連結後關閉選單
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // 回到較寬的桌面版時，重設手機選單狀態
    window.addEventListener("resize", () => {
      if (window.innerWidth > 680) {
        closeMenu();
      }
    });
  }

  // 首頁提示訊息
  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  // 讓之後新增的互動功能可以重用提示訊息
  window.edenKeys = {
    showToast
  };

  // 如果使用者從網址直接進入某個區塊，
  // 瀏覽器仍可正常定位到該區塊。
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);

    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });
      });
    }
  }
});
