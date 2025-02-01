const timer = document.getElementById('timer');
const timeSlider = document.getElementById('timeSlider');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const endSound = document.getElementById('endSound');
const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modalCloseBtn');

let timeLeft;
let isRunning = false;
let intervalId = null;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timer.textContent = formatTime(timeLeft);
}

function updateTimeFromSlider() {
    timeLeft = timeSlider.value * 60;
    updateTimerDisplay();
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.textContent = 'Pause';
        timeSlider.disabled = true;
        intervalId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(intervalId);
                isRunning = false;
                startBtn.textContent = 'Start';
                timeSlider.disabled = false;
                endSound.play();
                modal.style.display = 'flex';
            }
        }, 1000);
    } else {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.textContent = 'Resume';
    }
}

function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.textContent = 'Start';
    timeSlider.disabled = false;
    updateTimeFromSlider();
}

modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    endSound.pause();
    endSound.currentTime = 0;
});

updateTimeFromSlider();

timeSlider.addEventListener('input', updateTimeFromSlider);
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
