// ==UserScript==
// @name         Twitch Reward Autoclicker
// @version      0.1.4
// @include      https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function async() {
  const TARGET_EL_SELECTOR = '.community-points-summary';
  const REWARD_BTN_SELECTOR = '[aria-label="Odbierz bonus"]';
  const STREAMER_NAME_SELECTOR = 'a > h1.tw-title';

  const init = async () => {
    let rewardBtnEl = null;

    const DOMElements = await new Promise((resolve) => {
      const setIntervalId = setInterval(() => {
        const streamerNameEl = document.querySelector(STREAMER_NAME_SELECTOR);
        const targetEl = document.querySelector(TARGET_EL_SELECTOR);

        if (targetEl && streamerNameEl) {
          rewardBtnEl = document.querySelector(REWARD_BTN_SELECTOR);
          clearInterval(setIntervalId);
          resolve({ targetEl, streamerNameEl });
        }
      }, 300);
    });

    const getReward = (rewardBtnElement) => {
      if (rewardBtnElement) {
        const { textContent: streamName } = DOMElements.streamerNameEl;

        rewardBtnElement.click();
        window.console.info(`%c Got reward: ${new Date().toLocaleTimeString()} from ${streamName}`, 'background: #B7E1CD; color: #000; font-size: 20px');
      }
    };

    const rewardObserverCallback = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          rewardBtnEl = document.querySelector(REWARD_BTN_SELECTOR);

          getReward(rewardBtnEl);
        }
      });
    };

    const streamObserverCallback = (mutations, ...observers) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
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
}());
