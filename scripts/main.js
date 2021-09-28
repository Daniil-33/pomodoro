// ===  DECLARATE TIMER CLASS  === //
class Timer {
    constructor({container, radius, time, color, audioUrl, step}) {
        // Default properties
        this.counter = null;
        this.switchButton = null;
        this.timerCircle = null;
        this.interval = null;
        this.isActive = false;

        // Constructor
        this.step = step;
        this.finishAudio = new Audio(audioUrl);
        this.element = document.querySelector(container);
        this.radius = radius;
        this.time = time;
        this.color = color;
        this.initialOffset = Math.floor(2 * Math.PI * this.radius) + 1
    };

    initTimer() {
        this.element.innerHTML = `
            <svg width="${this.radius * 2 + 12}" height="${this.radius * 2 + 12}" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <circle 
                        id="timer-circle" 
                        stroke-width="12"
                        fill="none" 
                        style="stroke-dasharray:${this.initialOffset}; stroke-dashoffset: ${this.initialOffset-((+this.step + 1) * (this.initialOffset / this.time)) + (this.initialOffset / this.time)}; transition: all 1s linear;}"
                        r="${this.radius}" 
                        cy="${(this.radius * 2 + 12)/2}" 
                        cx="${(this.radius * 2 + 12)/2}" 
                        stroke="#F87070" 
                    />
                </g>
            </svg>

            <h3 id="timer-counter" style="position: absolute; top:${this.radius + 12}px; left:${this.radius + 12}px; transform: translate3d(-50%, -50%, 0)">${this.formatTime(this.time - this.step)}</h3>
            <button id="toggle-timer-btn" style="position: absolute; bottom: 40px; left:${this.radius + 12}px; transform: translateX(-50%)">Play</button
        `;

        this.switchButton = document.querySelector('#toggle-timer-btn');
        this.counter = document.querySelector('#timer-counter');
        this.timerCircle = document.querySelector('#timer-circle');

        this.switchButton.addEventListener('click', () => this.toggleTimer());
    };

    toggleTimer() {
        if (!this.isActive) {
            this.interval = setInterval(async () => {
                debugger
                this.counter.innerHTML = this.formatTime(this.time - (+this.step + 1))

                if (this.step == this.time) {  	
                    this.timerCircle.style['stroke-dashoffset'] = this.timerCircle.style['stroke-dashoffset'];
                    this.finishAudio.play();
                    this.pullse();

                    clearInterval(this.interval);

                    await this.reloadTimer();

                    return this.isActive = !this.isActive;
                }

                this.timerCircle.style['stroke-dashoffset'] = this.initialOffset-((+this.step + 1) * (this.initialOffset / this.time));
                this.step++;  
                localStorage.setItem('step', this.step)
            }, 1000);

            this.switchButton.innerHTML = 'Pause'
        } else {
            clearInterval(this.interval)
            this.switchButton.innerHTML = 'Play'
        }

        this.isActive = !this.isActive
    };

    reloadTimer() {
        return new Promise((res, rej) => {
            this.switchButton.innerHTML = 'Play';
            this.counter.innerHTML = this.formatTime(this.time);
            this.step = 0;
            this.initialOffset = Math.floor(2 * Math.PI * this.radius) + 1;
            localStorage.setItem('step', this.step);
            
            setTimeout(() => {
                this.element.style.animation = 'none';
                this.timerCircle.style['stroke-dashoffset'] = this.initialOffset-((+this.step + 1) * (this.initialOffset / this.time)) + (this.initialOffset / this.time);
                res();
            }, 3600)
        })
    };

    pullse() {
        this.element.style.animation = 'pullse .6s 6'
    };

    formatTime(seconds) {
        var sec_num = parseInt(seconds, 10);    
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        return hours + ':' + minutes + ':' + seconds;
    };

    destroyTimer() {
        this.element.innerHTML =  '';
        this.step = 0;
        localStorage.setItem('step', this.step)

        clearInterval(this.interval);
    };
};

// ===  DECLARATE POMODORO OBJECT  === //

const pomodoro = {
    theme: 'pomodoro-app--purple-theme',
    font: 'Kumbh Sans',
    shortBreakTimer:  300,
    longBreakTimer: 900,
    pomodoroTimer: 1500,
    activeTimer: 'pomodoroTimer',
    timerInstance: null,
    
    initTimer: function() {
        this.timerInstance = new Timer({
            container: '.pomodoro-app__timer',
            audioUrl: './finish.mp3',
            radius: document.body.clientWidth > 540 ? 175 :  140,
            time: this[this.activeTimer],
            step: localStorage.getItem('step') || 0
        });

        this.timerInstance.initTimer()
    },
    setFont: function(font) {
        this.font = font;

        document.body.style['font-family'] = font;
    },
    setTheme: function(theme) {
        document.querySelector('.pomodoro-app').classList.remove(this.theme)

        this.theme = theme;
        document.querySelector('.pomodoro-app').classList.add(theme)
    },
    setTimer: function(timer) {
        this.activeTimer = timer
        this.initTimer()
    }
};

// ===  CONNECT MODAL WINDOW SETTING WITH POMODORO OBJECT  === //
const setSettingToStorage = (payload) => Object.keys(payload).forEach(key => localStorage.setItem(key, payload[key]));

var pomodoroTimerInput = document.querySelector('#pomodoro'),
    longBreakTimerInput = document.querySelector('#long'),
    shortBreakTimerInput = document.querySelector('#short'),
    fontsOptions = document.querySelectorAll('.pomodoro-app__settings-modal-fonts-item > input'),
    colorsOptions = document.querySelectorAll('.pomodoro-app__settings-modal-colors-item > input'),
    applyBtn = document.querySelector('.pomodoro-app__submit-btn'),
    timersOptions = document.querySelectorAll('.pomodoro-app__radio-group-item > input');

timersOptions.forEach(el => el.addEventListener('click', (event) => {
    pomodoro.timerInstance.destroyTimer();
    pomodoro.setTimer(event.target.value);
    
    setSettingToStorage({
        activeTimer: event.target.value
    })
}));

applyBtn.addEventListener('click', () => {
    let font = Array.from(fontsOptions).find(el => el.checked).value,
        theme = Array.from(colorsOptions).find(el => el.checked).value,
        activeTimer = Array.from(timersOptions).find(el => el.checked).value,
        activeTimerState = pomodoro[pomodoro.activeTimer]; // Save time of current timer, to reload it in case it will change 

    pomodoro.setFont(font);
    pomodoro.setTheme(theme);
    pomodoro.pomodoroTimer = pomodoroTimerInput.value * 60,
    pomodoro.longBreakTimer = longBreakTimerInput.value * 60,
    pomodoro.shortBreakTimer = shortBreakTimerInput.value * 60;


    if (activeTimerState != pomodoro[pomodoro.activeTimer]) {
        pomodoro.timerInstance.destroyTimer();
        pomodoro.initTimer();
    } 

    setSettingToStorage({
        font,
        theme,
        activeTimer,
        pomodoroTimer: pomodoroTimerInput.value * 60, 
        longBreakTimer: longBreakTimerInput.value * 60, 
        shortBreakTimer: shortBreakTimerInput.value * 60
    })

    toggleModal(true, 200);
});

// ===  SYNC POMODORO OPTIONS WITH LOCAL STORAGE \ HTML INPUTS  === //

var settingKeys = ['font', 'theme', 'pomodoroTimer', 'longBreakTimer', 'shortBreakTimer', 'activeTimer'];
settingKeys.forEach(key => localStorage.getItem(key) 
    ? pomodoro[key] = localStorage.getItem(key) 
    : pomodoro[key] = pomodoro[key]);

pomodoroTimerInput.value = pomodoro.pomodoroTimer / 60;
longBreakTimerInput.value = pomodoro.longBreakTimer / 60;
shortBreakTimerInput.value = pomodoro.shortBreakTimer / 60;

Array.from(fontsOptions).find(el => el.value == pomodoro.font).checked = true;
Array.from(colorsOptions).find(el => el.value == pomodoro.theme).checked = true;
Array.from(timersOptions).find(el => el.value == pomodoro.activeTimer).checked = true;

pomodoro.setTheme(pomodoro.theme);
pomodoro.setFont(pomodoro.font);
pomodoro.setTimer(pomodoro.activeTimer)
// pomodoro.initTimer();

// ===  SETTING MODAL WINDOW  === //

var settingBtn = document.querySelector('#modal-btn'),
    modalWrapper = document.querySelector('#modal-wrapper'),
    modalBody = document.querySelector('#modal-body'),
    modalCloseBtn = document.querySelector('#modal-close');
    

async function toggleModal(isVisible, delay) {
    let addAnimation = (element, animatonName, visibilityAfter) => {
        return new Promise((res, rej) => {
            element.style.animation = `${animatonName} ${delay}ms`;
            element.style.visibility = visibilityAfter ? 'visible' : 'hidden';
            setTimeout(() => res(), delay);
        })
    }

    if (isVisible) {
        await addAnimation(modalBody, 'modalBodyFadeOut' , false);
        await addAnimation(modalWrapper, 'modalWrapperFadeOut', false);
    } else {
        await addAnimation(modalWrapper, 'modalWrapperFadeIn', true);
        await addAnimation(modalBody, 'modalBodyFadeIn', true);
    }
};

settingBtn.addEventListener('click', () => toggleModal(false, 200));
modalCloseBtn.addEventListener('click', () => toggleModal(true, 200));