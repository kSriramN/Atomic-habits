
    /* ==========================================================================
       ATOMIC HABITS APP LOGIC
       ========================================================================== */

    // Sound toggle state
    let soundEnabled = true;
    let audioCtx = null;

    // Preloaded Atomic Habits Insights Database
    const ATOMIC_INSIGHTS = [
      {
        quote: "Every action you take is a vote for the type of person you wish to become.",
        category: "Identity-Based Habits"
      },
      {
        quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
        category: "Systems vs Goals"
      },
      {
        quote: "When you start a new habit, it should take less than two minutes to do.",
        category: "The 3rd Law: Make it Easy"
      },
      {
        quote: "Missing once is an accident. Missing twice is the start of a new habit.",
        category: "The 4th Law: Make it Satisfying"
      },
      {
        quote: "Habits are the compound interest of self-improvement. Getting 1% better every day counts for a lot in the long-run.",
        category: "The 1% Rule"
      },
      {
        quote: "Environment is the invisible hand that shapes human behavior.",
        category: "The 1st Law: Make it Obvious"
      },
      {
        quote: "The task is not to be perfect, but to never miss twice. Rebound quickly.",
        category: "Never Miss Twice"
      },
      {
        quote: "Be the designer of your world and not merely the consumer of it.",
        category: "Environment Design"
      },
      {
        quote: "Standardize before you optimize. You can't improve a habit that doesn't exist.",
        category: "The 2-Minute Rule"
      },
      {
        quote: "Temptation bundling works by linking an action you want to do with an action you need to do.",
        category: "The 2nd Law: Make it Attractive"
      },
      {
        quote: "The Plateau of Latent Potential: Breakthrough moments are often the result of many previous actions building up.",
        category: "Plateau of Latent Potential"
      },
      {
        quote: "Habit stacking: After [CURRENT HABIT], I will [NEW HABIT].",
        category: "The 1st Law: Make it Obvious"
      }
    ];

    // Starter habits based strictly on the 2-Minute Rule
    const STARTER_HABITS = [
      {
        id: 'h-1',
        name: 'Read 1 page of a book',
        cue: 'open my laptop in the morning',
        icon: '📖',
        color: 'gold',
        durationMinutes: 2,
        completedDates: [],
        streak: 0,
        bestStreak: 0
      },
      {
        id: 'h-2',
        name: 'Drink a glass of water',
        cue: 'get out of bed',
        icon: '💧',
        color: 'blue',
        durationMinutes: 1,
        completedDates: [],
        streak: 0,
        bestStreak: 0
      },
      {
        id: 'h-3',
        name: '2-minute mindful stretch',
        cue: 'finish my morning shower',
        icon: '🧘',
        color: 'emerald',
        durationMinutes: 2,
        completedDates: [],
        streak: 0,
        bestStreak: 0
      },
      {
        id: 'h-4',
        name: 'Write one line in journal',
        cue: 'lay my head on the pillow at night',
        icon: '✍️',
        color: 'purple',
        durationMinutes: 2,
        completedDates: [],
        streak: 0,
        bestStreak: 0
      }
    ];

    const STORAGE_KEY = 'atomic_habits_app_data_v1';

    function getTodayString() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getYesterdayString() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    let state = {
      habits: [],
      identity: 'a deliberate person focused on consistent 1% daily progress',
      soundEnabled: true
    };

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          state.habits = parsed.habits || [];
          state.identity = parsed.identity || state.identity;
          if (parsed.soundEnabled !== undefined) soundEnabled = parsed.soundEnabled;
        } else {
          // Initialize with starter habits
          state.habits = [...STARTER_HABITS];
          saveState();
        }
      } catch (err) {
        console.error("Failed to load local storage:", err);
        state.habits = [...STARTER_HABITS];
      }
      updateSoundUI();
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          habits: state.habits,
          identity: state.identity,
          soundEnabled: soundEnabled
        }));
      } catch (err) {
        console.error("Failed to save local storage:", err);
      }
    }

    function initAudio() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playCelebrationChime() {
      if (!soundEnabled) return;
      try {
        initAudio();
        if (!audioCtx) return;

        // Elegant 3-chord major arpeggio (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.12 + 0.6);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(audioCtx.currentTime + idx * 0.12);
          osc.stop(audioCtx.currentTime + idx * 0.12 + 0.65);
        });
      } catch (e) {
        console.warn("Audio playback issue:", e);
      }
    }

    function playCheckClickSound() {
      if (!soundEnabled) return;
      try {
        initAudio();
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (e) {}
    }

    const canvas = document.getElementById('celebrationCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId = null;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function triggerConfetti() {
      resizeCanvas();
      particles = [];
      const colors = ['#F59E0B', '#EA580C', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24'];
      const particleCount = 75;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 100,
          y: canvas.height * 0.5 + (Math.random() - 0.5) * 50,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 14,
          vy: Math.random() * -12 - 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.35,
          opacity: 1
        });
      }

      if (!animationFrameId) {
        animateParticles();
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(animateParticles);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function calculateStreaks(habit) {
      const today = getTodayString();
      const yesterday = getYesterdayString();
      const dates = new Set(habit.completedDates || []);

      if (dates.size === 0) {
        return { currentStreak: 0, bestStreak: 0, completedToday: false, missedYesterday: false };
      }

      const completedToday = dates.has(today);
      let streak = 0;
      let checkDate = new Date();

      if (!completedToday) {
        // Check if yesterday was completed
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (dates.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Check if missed yesterday (when today not yet completed)
      const missedYesterday = !dates.has(yesterday) && !completedToday && dates.size > 0;
      let best = 0, run = 0, prev = null;
      [...dates].sort().forEach(s => {
        const d = new Date(s + 'T00:00:00');
        run = (prev && Math.round((d - prev) / 864e5) === 1) ? run + 1 : 1;
        best = Math.max(best, run);
        prev = d;
      });

      return {
        currentStreak: streak,
        bestStreak: best,
        completedToday,
        missedYesterday
      };
    }

    const habitListContainer = document.getElementById('habitListContainer');
    const emptyHabitsState = document.getElementById('emptyHabitsState');
    const progressPercentageEl = document.getElementById('progressPercentage');
    const progressFractionEl = document.getElementById('progressFraction');
    const dailyProgressBarEl = document.getElementById('dailyProgressBar');
    const habitCountBadge = document.getElementById('habitCountBadge');
    const streakShieldStatus = document.getElementById('streakShieldStatus');

    function renderHabits() {
      const today = getTodayString();
      const habits = state.habits;
      habitCountBadge.textContent = habits.length;

      if (habits.length === 0) {
        habitListContainer.innerHTML = '';
        emptyHabitsState.classList.remove('hidden');
        progressPercentageEl.textContent = '0%';
        progressFractionEl.textContent = '0 of 0 completed';
        dailyProgressBarEl.style.width = '0%';
        return;
      }

      emptyHabitsState.classList.add('hidden');
      let completedCount = 0;
      let anyMissedYesterday = false;

      habitListContainer.innerHTML = '';

      habits.forEach((habit) => {
        const { currentStreak, bestStreak, completedToday, missedYesterday } = calculateStreaks(habit);
        habit.streak = currentStreak;
        habit.bestStreak = bestStreak;
        if (completedToday) completedCount++;
        if (missedYesterday) anyMissedYesterday = true;

        const colorMap = {
          gold: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
          emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
          blue: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
          purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
          rose: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' }
        };
        const theme = colorMap[habit.color] || colorMap.gold;

        const card = document.createElement('div');
        card.className = `habit-card p-4 rounded-2xl glass-card border transition-all duration-200 cursor-pointer ${
          completedToday ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-atomic-border/80 hover:border-slate-600'
        }`;
        card.setAttribute('data-id', habit.id);

        card.innerHTML = `
          <div class="flex items-start gap-3">
            <button data-id="${habit.id}" aria-label="${completedToday ? 'Completed today' : 'Mark as done'}" class="toggle-habit-btn flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              completedToday
                ? 'bg-gradient-to-tr from-atomic-emerald to-emerald-400 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'border-slate-600 hover:border-atomic-gold bg-slate-900/80 text-transparent'
            }">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <span class="w-10 h-10 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center text-xl flex-shrink-0">${habit.icon || '⚡'}</span>
            <div class="min-w-0 flex-1">
              <h4 class="text-[15px] leading-snug font-bold break-words ${completedToday ? 'line-through text-slate-400' : 'text-white'}">${escapeHtml(habit.name)}</h4>
              <p class="text-[11px] text-slate-400 mt-0.5 break-words"><span class="text-slate-500 font-mono">After I:</span> ${escapeHtml(habit.cue || 'start my day')}</p>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-atomic-border/40">
            <div class="flex items-center gap-2 min-w-0">
              <div class="flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-black/40 border border-atomic-border/60 ${habit.streak > 0 ? 'text-atomic-gold' : 'text-slate-500'}">
                <span>🔥</span><span>${habit.streak}</span>
              </div>
              ${missedYesterday ? '<span class="text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Shield Alert</span>' : ''}
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button data-id="${habit.id}" class="launch-timer-btn p-2 rounded-xl bg-slate-900 border border-atomic-border hover:border-atomic-gold text-slate-400 hover:text-atomic-gold transition-all" title="Start timer for this habit" aria-label="Start timer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button data-id="${habit.id}" class="delete-habit-btn p-2 rounded-xl bg-slate-900/60 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Delete habit" aria-label="Delete habit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        `;
        habitListContainer.appendChild(card);
      });

      // Update Daily Completion percentage
      const total = habits.length;
      const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
      progressPercentageEl.textContent = `${pct}%`;
      progressFractionEl.textContent = `${completedCount} of ${total} completed`;
      dailyProgressBarEl.style.width = `${pct}%`;

      // Update Never Miss Twice Shield Indicator
      if (anyMissedYesterday) {
        streakShieldStatus.textContent = 'Never Miss Twice! Rebound Today';
        streakShieldStatus.className = 'font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20';
      } else {
        streakShieldStatus.textContent = 'Shield Active (On Track)';
        streakShieldStatus.className = 'font-mono text-[11px] text-atomic-emerald bg-atomic-emerald/10 px-2 py-0.5 rounded-md border border-atomic-emerald/20';
      }

      saveState();
      populateTimerHabitDropdown();
      updateStats();
    }

    function escapeHtml(str) {
      return (str || '').replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    }

    function toggleHabitCompletion(habitId) {
      const today = getTodayString();
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return;

      if (!habit.completedDates) habit.completedDates = [];
      const index = habit.completedDates.indexOf(today);

      if (index === -1) {
        // Habit completed!
        habit.completedDates.push(today);
        playCheckClickSound();
        playCelebrationChime();
        triggerConfetti();
        renderHabits();
        showRandomInsightModal(`You completed: "${habit.name}"`);
      } else {
        showToast('Already done today. Open the habit to untick it.');
      }
    }

    const timerDisplay = document.getElementById('timerDisplay');
    const timerStatusLabel = document.getElementById('timerStatusLabel');
    const timerToggleBtn = document.getElementById('timerToggleBtn');
    const timerToggleText = document.getElementById('timerToggleText');
    const timerPlayIcon = document.getElementById('timerPlayIcon');
    const timerPauseIcon = document.getElementById('timerPauseIcon');
    const timerResetBtn = document.getElementById('timerResetBtn');
    const timerFinishBtn = document.getElementById('timerFinishBtn');
    const timerProgressRing = document.getElementById('timerProgressRing');
    const activeTimerHabitTitle = document.getElementById('activeTimerHabitTitle');
    const activeTimerHabitCue = document.getElementById('activeTimerHabitCue');
    const timerHabitSelector = document.getElementById('timerHabitSelector');

    const RING_CIRCUMFERENCE = 2 * Math.PI * 94; // r=94 -> ~590.62
    timerProgressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;

    let timerState = {
      isRunning: false,
      isPaused: false,
      totalDurationSeconds: 120, // default 2 minutes (Atomic rule)
      remainingSeconds: 120,
      targetEndTime: null,       // Critical: Timestamp delta math for background screen-off resilience
      intervalId: null,
      selectedHabitId: null
    };

    function updateTimerDisplay() {
      const mins = Math.floor(timerState.remainingSeconds / 60);
      const secs = timerState.remainingSeconds % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      timerDisplay.textContent = formatted;

      // Update Browser Tab Title
      if (timerState.isRunning) {
        document.title = `${formatted} ⚡ Atomic Focus`;
      } else {
        document.title = 'Atomic Habits | 1% Better Every Day';
      }

      // Update Ring Offset
      const progress = 1 - (timerState.remainingSeconds / timerState.totalDurationSeconds);
      const offset = RING_CIRCUMFERENCE - (progress * RING_CIRCUMFERENCE);
      timerProgressRing.style.strokeDashoffset = offset;
    }

    function startTimer() {
      initAudio();
      timerState.isRunning = true;
      timerState.isPaused = false;

      // TIMESTAMP DELTA MATH: Calculate future unix timestamp
      timerState.targetEndTime = Date.now() + (timerState.remainingSeconds * 1000);

      timerStatusLabel.textContent = 'Focus in Progress...';
      timerStatusLabel.className = 'text-xs uppercase font-mono tracking-wider font-semibold text-atomic-gold mt-2 animate-pulse';
      timerToggleText.textContent = 'PAUSE';
      timerPlayIcon.classList.add('hidden');
      timerPauseIcon.classList.remove('hidden');

      if (timerState.intervalId) clearInterval(timerState.intervalId);

      // High-frequency tick ensuring accurate synchronization when resuming or waking
      timerState.intervalId = setInterval(tickTimer, 250);
      tickTimer();
    }

    function tickTimer() {
      if (!timerState.isRunning || timerState.isPaused) return;

      const now = Date.now();
      const diffMs = timerState.targetEndTime - now;
      const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

      timerState.remainingSeconds = diffSecs;
      updateTimerDisplay();

      if (diffSecs <= 0) {
        completeTimer();
      }
    }

    function pauseTimer() {
      timerState.isRunning = false;
      timerState.isPaused = true;
      if (timerState.intervalId) clearInterval(timerState.intervalId);

      timerStatusLabel.textContent = 'Paused';
      timerStatusLabel.className = 'text-xs uppercase font-mono tracking-wider font-semibold text-amber-300 mt-2';
      timerToggleText.textContent = 'RESUME';
      timerPlayIcon.classList.remove('hidden');
      timerPauseIcon.classList.add('hidden');
      document.title = `Paused (${timerDisplay.textContent}) | Atomic Habits`;
    }

    function resetTimer() {
      timerState.isRunning = false;
      timerState.isPaused = false;
      if (timerState.intervalId) clearInterval(timerState.intervalId);
      timerState.remainingSeconds = timerState.totalDurationSeconds;
      timerStatusLabel.textContent = 'Ready to Start';
      timerStatusLabel.className = 'text-xs uppercase font-mono tracking-wider font-semibold text-slate-400 mt-2';
      timerToggleText.textContent = 'START FOCUS';
      timerPlayIcon.classList.remove('hidden');
      timerPauseIcon.classList.add('hidden');
      updateTimerDisplay();
    }

    function completeTimer() {
      resetTimer();
      playCelebrationChime();
      triggerConfetti();

      // Automatically complete associated habit if one is chosen
      let completedHabitName = "Focus Session";
      if (timerState.selectedHabitId) {
        const habit = state.habits.find(h => h.id === timerState.selectedHabitId);
        if (habit) {
          completedHabitName = habit.name;
          const today = getTodayString();
          if (!habit.completedDates.includes(today)) {
            habit.completedDates.push(today);
            renderHabits();
          }
        }
      }

      showRandomInsightModal(`Completed: "${completedHabitName}"`);
    }

    // Listener for Tab/Screen visibility change to immediately catch up background time
    document.addEventListener('visibilitychange', () => {
      if (timerState.isRunning && !timerState.isPaused) {
        tickTimer();
      }
    });

    document.querySelectorAll('.timer-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-preset-btn').forEach(b => {
          b.classList.remove('active', 'bg-atomic-gold', 'text-slate-950', 'border-atomic-gold');
          b.classList.add('bg-atomic-card', 'text-slate-300', 'border-atomic-border');
        });
        btn.classList.add('active', 'bg-atomic-gold', 'text-slate-950', 'border-atomic-gold');
        btn.classList.remove('bg-atomic-card', 'text-slate-300', 'border-atomic-border');

        const dur = parseInt(btn.getAttribute('data-duration'), 10);
        timerState.totalDurationSeconds = dur;
        timerState.remainingSeconds = dur;
        resetTimer();
      });
    });

    timerToggleBtn.addEventListener('click', () => {
      if (timerState.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });

    timerResetBtn.addEventListener('click', resetTimer);
    timerFinishBtn.addEventListener('click', completeTimer);

    function populateTimerHabitDropdown() {
      timerHabitSelector.innerHTML = '<option value="">-- No specific habit (Solo timer) --</option>';
      state.habits.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = `${h.icon} ${h.name} (${h.durationMinutes || 2}m)`;
        if (h.id === timerState.selectedHabitId) opt.selected = true;
        timerHabitSelector.appendChild(opt);
      });
      syncTimerHabitUI();
    }

    timerHabitSelector.addEventListener('change', (e) => {
      timerState.selectedHabitId = e.target.value || null;
      syncTimerHabitUI();
    });

    function syncTimerHabitUI() {
      if (timerState.selectedHabitId) {
        const habit = state.habits.find(h => h.id === timerState.selectedHabitId);
        if (habit) {
          activeTimerHabitTitle.textContent = `${habit.icon} ${habit.name}`;
          activeTimerHabitCue.textContent = `Cue: "After I ${habit.cue || 'start'}, I will begin"`;
          return;
        }
      }
      activeTimerHabitTitle.textContent = "2-Minute Atomic Starter";
      activeTimerHabitCue.textContent = 'Cue: "Standardize before you optimize"';
    }

    const tabButtons = document.querySelectorAll('.bottom-nav-btn');
    const tabs = {
      tabToday: document.getElementById('tabToday'),
      tabTimer: document.getElementById('tabTimer'),
      tabWisdom: document.getElementById('tabWisdom'),
      tabIdentity: document.getElementById('tabIdentity')
    };

    function switchTab(tabId) {
      Object.keys(tabs).forEach(id => {
        if (id === tabId) {
          tabs[id].classList.remove('hidden');
        } else {
          tabs[id].classList.add('hidden');
        }
      });

      tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
          btn.classList.add('text-atomic-gold');
          btn.classList.remove('text-slate-400');
        } else {
          btn.classList.remove('text-atomic-gold');
          btn.classList.add('text-slate-400');
        }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
      });
    });

    const wisdomQuotesContainer = document.getElementById('wisdomQuotesContainer');
    const wisdomCountLabel = document.getElementById('wisdomCountLabel');

    function renderWisdomCodex() {
      wisdomQuotesContainer.innerHTML = '';
      wisdomCountLabel.textContent = `${ATOMIC_INSIGHTS.length} Principles`;

      ATOMIC_INSIGHTS.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl glass-card border border-atomic-border/80 hover:border-atomic-gold/40 transition-all';
        card.innerHTML = `
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-mono text-atomic-gold font-bold uppercase tracking-wider bg-atomic-gold/10 px-2 py-0.5 rounded border border-atomic-gold/20">
              ${escapeHtml(item.category)}
            </span>
            <span class="text-xs text-slate-500 font-mono">#${idx + 1}</span>
          </div>
          <p class="text-xs text-slate-200 leading-relaxed italic">
            "${escapeHtml(item.quote)}"
          </p>
          <span class="block text-[10px] text-slate-400 font-medium mt-2 text-right">— James Clear, Atomic Habits</span>
        `;
        wisdomQuotesContainer.appendChild(card);
      });
    }

    const identityStatementInput = document.getElementById('identityStatementInput');
    const saveIdentityBtn = document.getElementById('saveIdentityBtn');
    const statTotalCompletions = document.getElementById('statTotalCompletions');
    const statActiveHabits = document.getElementById('statActiveHabits');
    const statBestStreak = document.getElementById('statBestStreak');

    function updateStats() {
      identityStatementInput.value = state.identity || '';
      statActiveHabits.textContent = state.habits.length;

      let totalCompletions = 0;
      let maxStreak = 0;

      state.habits.forEach(h => {
        if (h.completedDates) {
          totalCompletions += h.completedDates.length;
        }
        if (h.bestStreak && h.bestStreak > maxStreak) {
          maxStreak = h.bestStreak;
        }
      });

      statTotalCompletions.textContent = totalCompletions;
      statBestStreak.textContent = `${maxStreak}🔥`;
    }

    saveIdentityBtn.addEventListener('click', () => {
      const val = identityStatementInput.value.trim();
      if (val) {
        state.identity = val;
        saveState();
        playCheckClickSound();
        showInsightModal("Identity Statement Saved", `“Every action is a vote for: ${state.identity}”`, "Identity-Based Habits");
      }
    });

    const insightModal = document.getElementById('insightModal');
    const insightModalHeadline = document.getElementById('insightModalHeadline');
    const insightModalQuote = document.getElementById('insightModalQuote');
    const insightModalCategory = document.getElementById('insightModalCategory');
    const closeInsightModalBtn = document.getElementById('closeInsightModalBtn');

    function showRandomInsightModal(headline) {
      const randomItem = ATOMIC_INSIGHTS[Math.floor(Math.random() * ATOMIC_INSIGHTS.length)];
      showInsightModal(headline || "1% Better Today!", randomItem.quote, randomItem.category);
    }

    function showInsightModal(headline, quote, category) {
      insightModalHeadline.textContent = headline;
      insightModalQuote.textContent = quote;
      insightModalCategory.textContent = `— ${category || 'Atomic Habits'}`;
      insightModal.classList.remove('hidden');
    }

    closeInsightModalBtn.addEventListener('click', () => {
      insightModal.classList.add('hidden');
    });

    // Add Habit Modal Controls
    const habitModal = document.getElementById('habitModal');
    const openAddHabitModalBtn = document.getElementById('openAddHabitModalBtn');
    const closeHabitModalBtn = document.getElementById('closeHabitModalBtn');
    const habitForm = document.getElementById('habitForm');
    const habitNameInput = document.getElementById('habitNameInput');
    const habitCueInput = document.getElementById('habitCueInput');
    const habitIconInput = document.getElementById('habitIconInput');
    const habitDurationInput = document.getElementById('habitDurationInput');
    const habitColorInput = document.getElementById('habitColorInput');
    const colorPickerButtons = document.querySelectorAll('.color-pick');
    const emojiPickerButtons = document.querySelectorAll('.emoji-pick');

    openAddHabitModalBtn.addEventListener('click', () => {
      habitForm.reset();
      document.getElementById('habitIdInput').value = '';
      document.getElementById('modalTitle').textContent = 'Create Atomic Habit';
      habitIconInput.value = '⚡';
      habitDurationInput.value = '2';
      habitColorInput.value = 'gold';
      updateColorPickerUI('gold');
      habitModal.classList.remove('hidden');
    });

    closeHabitModalBtn.addEventListener('click', () => {
      habitModal.classList.add('hidden');
    });

    emojiPickerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        habitIconInput.value = btn.textContent.trim();
      });
    });

    colorPickerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.getAttribute('data-color');
        habitColorInput.value = col;
        updateColorPickerUI(col);
      });
    });

    function updateColorPickerUI(selectedColor) {
      colorPickerButtons.forEach(btn => {
        if (btn.getAttribute('data-color') === selectedColor) {
          btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-atomic-card');
        } else {
          btn.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-atomic-card');
        }
      });
    }

    habitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = habitNameInput.value.trim();
      const cue = habitCueInput.value.trim();
      const icon = habitIconInput.value.trim() || '⚡';
      const durationMinutes = parseInt(habitDurationInput.value, 10) || 2;
      const color = habitColorInput.value || 'gold';
      const editId = document.getElementById('habitIdInput').value;

      if (!name) return;

      if (editId) {
        const habit = state.habits.find(h => h.id === editId);
        if (habit) {
          habit.name = name;
          habit.cue = cue;
          habit.icon = icon;
          habit.durationMinutes = durationMinutes;
          habit.color = color;
        }
      } else {
        const newHabit = {
          id: 'h-' + Date.now(),
          name,
          cue,
          icon,
          durationMinutes,
          color,
          completedDates: [],
          streak: 0,
          bestStreak: 0
        };
        state.habits.push(newHabit);
      }

      saveState();
      renderHabits();
      habitModal.classList.add('hidden');
      playCheckClickSound();
    });

    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    let pendingConfirmAction = null;

    function promptConfirm(title, message, action, label = 'Delete') {
      confirmTitle.textContent = title;
      confirmActionBtn.textContent = label;
      confirmMessage.textContent = message;
      pendingConfirmAction = action;
      confirmModal.classList.remove('hidden');
    }

    confirmCancelBtn.addEventListener('click', () => {
      confirmModal.classList.add('hidden');
      pendingConfirmAction = null;
    });

    confirmActionBtn.addEventListener('click', () => {
      if (pendingConfirmAction) pendingConfirmAction();
      confirmModal.classList.add('hidden');
      pendingConfirmAction = null;
    });

    habitListContainer.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.toggle-habit-btn');
      if (toggleBtn) {
        const id = toggleBtn.getAttribute('data-id');
        toggleHabitCompletion(id);
        return;
      }

      const launchTimerBtn = e.target.closest('.launch-timer-btn');
      if (launchTimerBtn) {
        const id = launchTimerBtn.getAttribute('data-id');
        const habit = state.habits.find(h => h.id === id);
        if (habit) {
          timerState.selectedHabitId = habit.id;
          const dur = (habit.durationMinutes || 2) * 60;
          timerState.totalDurationSeconds = dur;
          timerState.remainingSeconds = dur;
          resetTimer();
          populateTimerHabitDropdown();
          switchTab('tabTimer');
        }
        return;
      }

      const deleteBtn = e.target.closest('.delete-habit-btn');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        promptConfirm(
          "Delete this habit?", 
          "Removing this habit will remove its streak from your daily system.", 
          () => {
            state.habits = state.habits.filter(h => h.id !== id);
            saveState();
            renderHabits();
          }
        );
        return;
      }

      if (e.target.closest('.habit-card')) openCalendar(e.target.closest('.habit-card').getAttribute('data-id'));
    });

    // Reset All Data action
    document.getElementById('resetAllDataBtn').addEventListener('click', () => {
      promptConfirm(
        "Reset All Data?",
        "This will delete all habits and restore the original 2-Minute Rule starters.",
        () => {
          state.habits = [...STARTER_HABITS];
          state.identity = 'a deliberate person focused on consistent 1% daily progress';
          saveState();
          renderHabits();
          switchTab('tabToday');
        }
      );
    });

    document.getElementById('addStarterHabitsBtn').addEventListener('click', () => {
      state.habits = [...STARTER_HABITS];
      saveState();
      renderHabits();
    });

    const toggleSoundBtn = document.getElementById('toggleSoundBtn');
    const soundOnIcon = document.getElementById('soundOnIcon');
    const soundOffIcon = document.getElementById('soundOffIcon');

    function updateSoundUI() {
      if (soundEnabled) {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
      } else {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
      }
    }

    toggleSoundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      updateSoundUI();
      saveState();
      if (soundEnabled) initAudio();
    });

    function setDateHeader() {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      const todayFormatted = new Date().toLocaleDateString(undefined, options);
      document.getElementById('headerDate').textContent = todayFormatted;
    }

    /* ===== Toast ===== */
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.remove('opacity-0');
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => t.classList.add('opacity-0'), 2400);
    }

    /* ===== Habit calendar ===== */
    const calModal = document.getElementById('calendarModal');
    const calGrid = document.getElementById('calGrid');
    let calHabitId = null, calYear = 0, calMonth = 0;
    const pad2 = n => String(n).padStart(2, '0');

    function openCalendar(id) {
      if (!state.habits.find(h => h.id === id)) return;
      calHabitId = id;
      const now = new Date();
      calYear = now.getFullYear();
      calMonth = now.getMonth();
      renderCalendar();
      calModal.classList.remove('hidden');
    }

    function renderCalendar() {
      const h = state.habits.find(x => x.id === calHabitId);
      if (!h) return;
      const { currentStreak, bestStreak } = calculateStreaks(h);
      const done = new Set(h.completedDates || []);
      const prefix = `${calYear}-${pad2(calMonth + 1)}-`;
      const monthCount = [...done].filter(d => d.startsWith(prefix)).length;
      const today = getTodayString();
      const now = new Date();

      document.getElementById('calTitle').textContent = `${h.icon || '⚡'} ${h.name}`;
      document.getElementById('calCue').textContent = `After I ${h.cue || 'start my day'}`;
      document.getElementById('calMonthLabel').textContent = new Date(calYear, calMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      document.getElementById('calNextBtn').disabled = (calYear === now.getFullYear() && calMonth === now.getMonth());

      const stat = (label, val) => `<div class="p-2.5 rounded-xl bg-slate-900/80 border border-atomic-border/60 text-center"><span class="block text-base font-black text-white">${val}</span><span class="block text-[10px] text-slate-400">${label}</span></div>`;
      document.getElementById('calStats').innerHTML =
        stat('Streak', currentStreak + '🔥') + stat('Best', bestStreak) + stat('This month', monthCount) + stat('Total', done.size);

      const firstDow = new Date(calYear, calMonth, 1).getDay();
      const days = new Date(calYear, calMonth + 1, 0).getDate();
      let html = '<div></div>'.repeat(firstDow);
      for (let d = 1; d <= days; d++) {
        const ds = `${calYear}-${pad2(calMonth + 1)}-${pad2(d)}`;
        const future = ds > today;
        let cls = 'aspect-square rounded-xl text-xs font-semibold flex items-center justify-center transition-all ';
        if (done.has(ds)) cls += 'bg-gradient-to-tr from-atomic-emerald to-emerald-400 text-slate-950 ';
        else if (future) cls += 'text-slate-700 cursor-not-allowed ';
        else cls += 'bg-slate-900 text-slate-300 border border-atomic-border/60 hover:border-atomic-gold ';
        if (ds === today) cls += 'ring-2 ring-atomic-gold ';
        html += `<button data-date="${ds}" class="${cls}" ${future ? 'disabled' : ''}>${d}</button>`;
      }
      calGrid.innerHTML = html;
    }

    calGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-date]');
      if (!btn) return;
      const h = state.habits.find(x => x.id === calHabitId);
      if (!h) return;
      const ds = btn.getAttribute('data-date');
      if (ds > getTodayString()) return;
      h.completedDates = h.completedDates || [];
      const i = h.completedDates.indexOf(ds);
      if (i === -1) h.completedDates.push(ds); else h.completedDates.splice(i, 1);
      playCheckClickSound();
      renderCalendar();
      renderHabits();
    });

    document.getElementById('calPrevBtn').addEventListener('click', () => {
      calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
    });
    document.getElementById('calNextBtn').addEventListener('click', () => {
      calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    });
    document.getElementById('calCloseBtn').addEventListener('click', () => calModal.classList.add('hidden'));
    calModal.addEventListener('click', (e) => { if (e.target === calModal) calModal.classList.add('hidden'); });

    document.getElementById('calEditBtn').addEventListener('click', () => {
      const h = state.habits.find(x => x.id === calHabitId);
      if (!h) return;
      calModal.classList.add('hidden');
      habitForm.reset();
      document.getElementById('habitIdInput').value = h.id;
      document.getElementById('modalTitle').textContent = 'Edit Atomic Habit';
      habitNameInput.value = h.name;
      habitCueInput.value = h.cue || '';
      habitIconInput.value = h.icon || '⚡';
      habitDurationInput.value = h.durationMinutes || 2;
      habitColorInput.value = h.color || 'gold';
      updateColorPickerUI(h.color || 'gold');
      habitModal.classList.remove('hidden');
    });

    /* ===== Export / Import ===== */
    const BACKUP_KEY = 'atomic_habits_last_backup';
    const lastBackupLabel = document.getElementById('lastBackupLabel');

    function refreshBackupLabel() {
      let v = null;
      try { v = localStorage.getItem(BACKUP_KEY); } catch (e) {}
      lastBackupLabel.textContent = v ? `Last backup: ${v}` : 'No backup yet';
    }

    document.getElementById('exportDataBtn').addEventListener('click', () => {
      const payload = {
        app: 'atomic-habits', version: 1, exportedAt: new Date().toISOString(),
        habits: state.habits, identity: state.identity, soundEnabled
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atomic-habits-backup-${getTodayString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      try { localStorage.setItem(BACKUP_KEY, getTodayString()); } catch (e) {}
      refreshBackupLabel();
      showToast('Backup file downloaded');
    });

    const importFileInput = document.getElementById('importFileInput');
    document.getElementById('importDataBtn').addEventListener('click', () => importFileInput.click());

    importFileInput.addEventListener('change', () => {
      const file = importFileInput.files[0];
      importFileInput.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let data;
        try { data = JSON.parse(reader.result); } catch (e) { return showToast('That file is not a valid backup.'); }
        if (!data || !Array.isArray(data.habits) || data.habits.some(h => !h || !h.id || !h.name)) {
          return showToast('That file is not a valid backup.');
        }
        const dateOk = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
        const habits = data.habits.map(h => ({
          id: String(h.id), name: String(h.name), cue: String(h.cue || ''), icon: String(h.icon || '⚡'),
          color: h.color || 'gold', durationMinutes: parseInt(h.durationMinutes, 10) || 2,
          completedDates: Array.isArray(h.completedDates) ? [...new Set(h.completedDates.filter(dateOk))] : [],
          streak: 0, bestStreak: 0
        }));
        promptConfirm('Restore this backup?',
          `This replaces your current data with ${habits.length} habit${habits.length === 1 ? '' : 's'} from the file.`,
          () => {
            state.habits = habits;
            if (typeof data.identity === 'string' && data.identity.trim()) state.identity = data.identity;
            if (typeof data.soundEnabled === 'boolean') { soundEnabled = data.soundEnabled; updateSoundUI(); }
            saveState();
            renderHabits();
            showToast('Backup restored');
          }, 'Restore');
      };
      reader.readAsText(file);
    });

    /* ===== PWA ===== */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

    window.addEventListener('DOMContentLoaded', () => {
      loadState();
      setDateHeader();
      renderHabits();
      renderWisdomCodex();
      updateTimerDisplay();
      updateStats();
      refreshBackupLabel();
    });
  