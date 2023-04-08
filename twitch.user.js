// ==UserScript==
// @name         Twitch Reward Autoclicker
// @namespace    https://github.com/lukasz-brzozko/Twitch-Reward-Autoclicker
// @version      0.2.0
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
  const DOCUMENT_TITLE = "title";
  const MESSAGES = {
    containerFound: "Reward button container found. Listening for actions.",
    error: "Reward button container was not found.",
  };
  const rewardLogs = [];

  const init = async () => {
    let rewardBtnEl = null;

    const DOMElements = await new Promise((resolve) => {
      const maxAttempts = 50;
      let attempt = 0;

      const setIntervalId = setInterval(() => {
        const streamerNameEl = document.querySelector(STREAMER_NAME_SELECTOR);
        const documentTitle = document.querySelector(DOCUMENT_TITLE);
        const [targetEl] = document.querySelectorAll(TARGET_EL_SELECTOR);
        if (targetEl && streamerNameEl && documentTitle) {
          rewardBtnEl = targetEl.querySelector(REWARD_BTN_SELECTOR);
          clearInterval(setIntervalId);
          window.console.info(
            `%c ${MESSAGES.containerFound}`,
            "background: #B7E1CD; color: #000; font-size: 20px"
          );
          resolve({ targetEl, streamerNameEl, documentTitle });
        } else {
          if (attempt >= maxAttempts) {
            clearInterval(setIntervalId);
            resolve({ documentTitle, error: ERROR_MESSAGE });
          } else {
            attempt++;
          }
        }
      }, 300);
    });

    const getReward = (rewardBtnElement) => {
      if (!rewardBtnElement) return;

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
    };

    const rewardObserverCallback = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          rewardBtnEl = mutation.target.querySelector(REWARD_BTN_SELECTOR);
          getReward(rewardBtnEl);
        }
      });
    };

    const documentTitleObserverCallback = (mutations, ...observers) => {
      mutations.forEach((mutation) => {
        observers.forEach((observer) => observer.disconnect());
        init();
      });
    };

    const rewardObserverConfig = { childList: true, subtree: true };
    const documentTitleObserverConfig = { childList: true };

    const rewardObserver = new MutationObserver(rewardObserverCallback);
    const documentTitleObserver = new MutationObserver((mutations) => {
      documentTitleObserverCallback(
        mutations,
        rewardObserver,
        documentTitleObserver
      );
    });

    const { error, documentTitle, targetEl } = DOMElements;

    documentTitleObserver.observe(documentTitle, documentTitleObserverConfig);

    if (error) {
      return window.console.error(
        `%c ${MESSAGES.error}`,
        "background: red; color: #fff; font-size: 20px"
      );
    }

    rewardObserver.observe(targetEl, rewardObserverConfig);

    getReward(rewardBtnEl);
  };

  init();
})();
