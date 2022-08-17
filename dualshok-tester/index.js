const statusElement = document.querySelector(".status");
const buttonsStartWrapper = document.querySelector("#buttons-start");
const startButtonLow = document.querySelector("#low");
const startButtonMid = document.querySelector("#mid");
const startButtonHigh = document.querySelector("#high");
const stopButton = document.querySelector("#stop");

let connectedPad;

const statusMessageTimeouts = [];
const errorMessageDuration = 10000;

const vibrateTimeouts = [];
// Limitaion from `vibrationActuator`. Don't increase this.
const MAX_ALLOWED_DURATION = 3000;
const vibrateIntencities = {
  low: {
    duration: MAX_ALLOWED_DURATION,
    startDelay: 0,
    strongMagnitude: 0.2,
    weakMagnitude: 0.2,
  },
  mid: {
    duration: MAX_ALLOWED_DURATION,
    startDelay: 0,
    strongMagnitude: 0.5,
    weakMagnitude: 0.5,
  },
  high: {
    duration: MAX_ALLOWED_DURATION,
    startDelay: 0,
    strongMagnitude: 1,
    weakMagnitude: 1,
  },
  stop: {
    duration: 0,
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: 0,
  },
};

function clearTimeouts(timeoutsArray = []) {
  if (timeoutsArray.length > 0) {
    timeoutsArray.forEach((t) => clearTimeout(t));
  }
}

function showStatusElement({ duration, innerHTML, textContent, isError }) {
  clearTimeouts(statusMessageTimeouts);
  statusElement.classList.add(isError ? "status-error" : "status-success");

  if (innerHTML) {
    statusElement.innerHTML = innerHTML;
  } else if (textContent) {
    statusElement.textContent = textContent;
  }

  // Cleanup
  const statusMessageTimeout = setTimeout(() => {
    statusElement.classList.remove("status-error");
    statusElement.classList.remove("status-success");
    statusElement.innerHTML = "";
    statusElement.textContent = "";
  }, duration);

  statusMessageTimeouts.push(statusMessageTimeout);
}

function showErrorMessage() {
  const innerHTML = `
    💔 DualShock controller isn't connected.<br />
    Make sure it's connected via USB, then click any button on your
    DualShock controller.<br />
    After that click Low, Mid, or High.
  `;
  showStatusElement({
    duration: errorMessageDuration,
    innerHTML,
    isError: true,
  });
}

function showSuccessMessage() {
  showStatusElement({
    duration: 3000,
    textContent: "✅  Gamepad connected.",
    isError: false,
  });
}

function getConnectedDevice() {
  const gamePads = navigator.getGamepads() || [];
  const pad = gamePads.filter((g) => g)[0];
  return pad;
}

function vibrate(
  pad,
  { duration, startDelay, strongMagnitude, weakMagnitude }
) {
  pad?.vibrationActuator?.playEffect("dual-rumble", {
    duration,
    startDelay,
    strongMagnitude,
    weakMagnitude,
  });
}

// Runs `vibrate` in loop, the `seconds` are the initial duration (3 seconds) + the provided seconds
/** example: `vibrateLoop(9, config)` will run for 3 + 9 seconds given that `config.duration` is 3000. */
function vibrateLoop(seconds, intencityConfig) {
  /** `vibrationActuator` only allows `duration` of 3 seconds.
   * As a workaround, we can create a loop that calls the `vibrate` function every 3 seconds.
   * We have to account for a varying delay as well or we'll trigger all calls at the same time.
   */
  const count = Math.floor(seconds / 3);
  for (let i = 0; i <= count; i++) {
    const vibrateTimeout = setTimeout(() => {
      vibrate(connectedPad, intencityConfig);
    }, i * MAX_ALLOWED_DURATION - 1000 || 0);

    vibrateTimeouts.push(vibrateTimeout);
  }
}

function main() {
  window.addEventListener("gamepadconnected", function (e) {
    showSuccessMessage();
  });

  /** Low, Mid, High buttons wrapper */
  buttonsStartWrapper.addEventListener("click", (event) => {
    if (!event.target.matches("button")) {
      return;
    }

    connectedPad = getConnectedDevice();

    if (!connectedPad) {
      showErrorMessage();
    }
  });

  /** Start button - LOW */
  startButtonLow.addEventListener("click", () => {
    vibrate(connectedPad, vibrateIntencities.low);
  });

  /** Start button - MID */
  startButtonMid.addEventListener("click", () => {
    vibrateLoop(6, vibrateIntencities.mid);
  });

  /** Start button - HIGH */
  startButtonHigh.addEventListener("click", () => {
    vibrateLoop(10, vibrateIntencities.high);
  });

  /** Stop button */
  stopButton.addEventListener("click", () => {
    clearTimeouts(vibrateTimeouts);

    vibrate(connectedPad, vibrateIntencities.stop);
  });
}

main();
