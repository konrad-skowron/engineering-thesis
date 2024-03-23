const track = document.querySelector('.track');
const thumb = document.querySelector('.thumb');

let isDown = false;
let startX;
let currentX;
let range = { start: 0, end: 0 };

const handleStart = (e) => {
  e.preventDefault();
  isDown = true;

  const touch = e.touches ? e.touches[0] : e;
  startX = touch.clientX - track.offsetLeft;
  currentX = startX;

  thumb.style.left = `${startX}px`;

  range.start = startX / track.offsetWidth;
  range.end = startX / track.offsetWidth;

  updateTrackRange();
};

const handleMove = (e) => {
  if (!isDown) return;

  const touch = e.touches ? e.touches[0] : e;
  currentX = touch.clientX - track.offsetLeft;
  currentX = Math.max(0, Math.min(currentX, track.offsetWidth));

  thumb.style.left = `${currentX}px`;

  if (currentX > startX) {
    range.start = startX / track.offsetWidth;
    range.end = currentX / track.offsetWidth;
  } else {
    range.start = currentX / track.offsetWidth;
    range.end = startX / track.offsetWidth;
  }

  updateTrackRange();
};

const handleEnd = () => {
  isDown = false;
};

track.addEventListener('mousedown', handleStart);
track.addEventListener('touchstart', handleStart);

window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', handleMove);

window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

function updateTrackRange() {
  const trackRange = document.createElement('div');
  trackRange.style.position = 'absolute';
  trackRange.style.left = `${range.start * 100}%`;
  trackRange.style.top = '0';
  trackRange.style.height = '100%';
  trackRange.style.width = `${(range.end - range.start) * 100}%`;
  trackRange.style.backgroundColor = '#333';
  trackRange.style.borderRadius = '2px';

  track.innerHTML = '';
  track.appendChild(trackRange);
}