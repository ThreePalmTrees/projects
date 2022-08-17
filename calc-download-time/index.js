// form elements
const sizeElement = document.querySelector("#size");
const speedElement = document.querySelector("#speed");
const calculateButton = document.querySelector(".calculate-button");

// result elements
const resultSection = document.querySelector(".result");
const resultInHours = document.querySelector(".result-in-hours > b > span");
const resultInMinutes = document.querySelector(".result-in-minutes > b > span");
const readableTimeElement = document.querySelector(".readable-time");
const mbPerMinute = document.querySelector(".mb-per-minute");
const mbPerHour = document.querySelector(".mb-per-hour");

const getSizeMB = () => sizeElement.value || "0";

const getSpeedMBs = () => speedElement.value || "0";
const getSpeedMBm = () => getSpeedMBs() * 60;

calculateButton.addEventListener("click", showResult);

function showResult(event) {
  event.preventDefault();

  const sizeMB = getSizeMB().includes("gb")
    ? parseInt(getSizeMB().replace(/(mb|\s)/i, "")) * 1000
    : getSizeMB();
  const speedMBm = getSpeedMBm();

  const minutes = sizeMB / speedMBm;
  const hours = minutes / 60;

  if (!Number(minutes) || !Number(hours)) {
    sizeElement.focus();
    return;
  } else if ([minutes, hours].includes(Infinity)) {
    speedElement.focus();
    return;
  }

  resultInHours.textContent = String(hours.toFixed(2));
  resultInMinutes.textContent = String(minutes.toFixed(0));

  resultSection.style.display = "block";

  const readableHours = parseInt(hours);
  const readableMinutes = Math.round((hours - parseInt(hours)) * 60);
  const readableTime = `${readableHours} hour${
    readableHours > 1 ? "s" : ""
  } and ${readableMinutes} minute${readableMinutes > 1 ? "s" : ""}.`;

  readableTimeElement.textContent = readableTime;
  mbPerMinute.textContent = speedMBm + "MB";
  mbPerHour.textContent = speedMBm * 60 + "MB";
}
