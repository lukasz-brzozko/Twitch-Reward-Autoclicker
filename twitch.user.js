// ==UserScript==
// @name         Twitch Reward Autoclicker
// @namespace    https://github.com/lukasz-brzozko/Twitch-Reward-Autoclicker
// @version      0.1.4
// @description  Twitch Reward Autoclicker
// @author       Łukasz Brzózko
// @include      https://www.twitch.tv/*
// @updateURL    https://raw.githubusercontent.com/lukasz-brzozko/Twitch-Reward-Autoclicker/main/twitch.meta.js
// @downloadURL  https://raw.githubusercontent.com/lukasz-brzozko/Twitch-Reward-Autoclicker/main/twitch.user.js
// @grant        none
// ==/UserScript==

(function async() {
  const TARGET_EL_SELECTOR =
    "[data-test-selector='community-points-summary'] > div + div > div.tw-transition";
  const REWARD_BTN_SELECTOR = "button";
  const STREAMER_NAME_SELECTOR = ".channel-info-content a > h1";
  const rewardLogs = [];

  const init = async () => {
    let rewardBtnEl = null;

    const DOMElements = await new Promise((resolve) => {
      const setIntervalId = setInterval(() => {
        const streamerNameEl = document.querySelector(STREAMER_NAME_SELECTOR);
        const [targetEl] = document.querySelectorAll(TARGET_EL_SELECTOR);
        if (targetEl && streamerNameEl) {
          rewardBtnEl = targetEl.querySelector(REWARD_BTN_SELECTOR);
          clearInterval(setIntervalId);
          resolve({ targetEl, streamerNameEl });
        }
      }, 300);
    });

    const getReward = (rewardBtnElement) => {
      if (rewardBtnElement) {
        const { textContent: streamName } = DOMElements.streamerNameEl;

        rewardBtnElement.click();
        const date = new Date().toLocaleTimeString();
        rewardLogs.push(date);
        window.console.clear();
        window.console.info(
          `%c Got reward: ${date} from ${streamName}`,
          "background: #B7E1CD; color: #000; font-size: 20px"
        );
        window.console.info("Reward logs:", rewardLogs);
      }
    };

    const rewardObserverCallback = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          rewardBtnEl = mutation.target.querySelector(REWARD_BTN_SELECTOR);
          getReward(rewardBtnEl);
        }
      });
    };

    const streamObserverCallback = (mutations, ...observers) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          observers.forEach((observer) => observer.disconnect());
          init();
        }
      });
    };

    const rewardObserverConfig = { childList: true, subtree: true };
    const streamObserverConfig = { characterData: true, subtree: true };

    const rewardObserver = new MutationObserver(rewardObserverCallback);
    const streamObserver = new MutationObserver((mutations) => {
      streamObserverCallback(mutations, rewardObserver, streamObserver);
    });

    rewardObserver.observe(DOMElements.targetEl, rewardObserverConfig);
    streamObserver.observe(DOMElements.streamerNameEl, streamObserverConfig);

    getReward(rewardBtnEl);
  };

  init();
})();
