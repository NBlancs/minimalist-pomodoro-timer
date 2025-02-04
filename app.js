const timer = document.getElementById('timer');
const timeSlider = document.getElementById('timeSlider');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const endSound = document.getElementById('endSound');
const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const historyCloseBtn = document.getElementById('historyCloseBtn');
const historyList = document.getElementById('historyList');
const downloadExcelBtn = document.getElementById('downloadExcelBtn');
const downloadTxtBtn = document.getElementById('downloadTxtBtn');

let timeLeft;
let isRunning = false;
let intervalId = null;

// Load history from localStorage on page load
let sessionHistory = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(date) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
}

function updateTimerDisplay() {
    timer.textContent = formatTime(timeLeft);
}

function updateTimeFromSlider() {
    timeLeft = timeSlider.value * 60;
    updateTimerDisplay();
}

function saveToLocalStorage() {
    localStorage.setItem('pomodoroHistory', JSON.stringify(sessionHistory));
}

function addToHistory(duration) {
    const now = new Date();
    sessionHistory.push({
        date: formatDate(now),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: duration
    });
    saveToLocalStorage();
}

function displayHistory() {
    historyList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${sessionHistory.map(session => `
                    <tr>
                        <td>${session.date}</td>
                        <td>${session.time}</td>
                        <td>${session.duration} min</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    historyModal.style.display = 'flex';
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
                addToHistory(timeSlider.value);
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

function downloadExcel() {
    downloadFile('csv', 'text/csv;charset=utf-8;');
}

function downloadTxt() {
    downloadFile('txt', 'text/plain;charset=utf-8;');
}

function downloadFile(extension, mimeType) {
    const headers = ['Date', 'Time', 'Duration (minutes)'];
    let content;
    
    if (extension === 'csv') {
        // Proper CSV formatting with comma separation and quote wrapping
        content = [
            headers.join(','),
            ...sessionHistory.map(session => 
                `"${session.date}","${session.time}","${session.duration}"`
            )
        ].join('\n');
    } else {
        // TXT format remains tab-separated
        content = [
            headers.join('\t'),
            ...sessionHistory.map(session => 
                `${session.date}\t${session.time}\t${session.duration}`
            )
        ].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pomodoro-history-${formatDate(new Date())}.${extension}`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        sessionHistory = [];
        saveToLocalStorage();
        displayHistory();
    }
}

modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    endSound.pause();
    endSound.currentTime = 0;
});

historyCloseBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// Restore history button event listener
historyBtn.addEventListener('click', displayHistory);

// Add download button event listener
downloadExcelBtn.addEventListener('click', downloadExcel);
downloadTxtBtn.addEventListener('click', downloadTxt);

// Add clear button to history modal
historyCloseBtn.insertAdjacentHTML('beforebegin', `
    <button id="clearHistoryBtn">Clear History</button>
`);

const clearHistoryBtn = document.getElementById('clearHistoryBtn');
clearHistoryBtn.addEventListener('click', clearHistory);

updateTimeFromSlider();

timeSlider.addEventListener('input', updateTimeFromSlider);
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
