// Data Structure untuk Tracker Item
const trackerItems = [
    { id: 'puasa', title: 'Puasa', desc: 'Menahan diri dari makan & minum', icon: 'fa-sun' },
    { id: 'tarawih', title: 'Sholat Tarawih', desc: 'Sholat sunnah malam hari', icon: 'fa-mosque' },
    { id: 'tilawah', title: 'Tilawah Quran', desc: 'Membaca Al-Quran min. 1 juz', icon: 'fa-book-quran' },
    { id: 'sedekah', title: 'Sedekah', desc: 'Berbagi rezeki hari ini', icon: 'fa-hand-holding-dollar' },
    { id: 'tahajud', title: 'Sholat Tahajud', desc: 'Qiyamul Lail', icon: 'fa-star-and-crescent' }
];

// State Management
let currentDate = new Date(); // Hari yang sedang dilihat

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    renderDate();
    renderTrackerList();
    updateProgress();
    calculateStreak();
    calculateRamadhanStats();

    // Event Listeners
    document.getElementById('prevDayBtn').addEventListener('click', () => changeDay(-1));
    document.getElementById('nextDayBtn').addEventListener('click', () => changeDay(1));
    document.getElementById('todayBtn').addEventListener('click', () => {
        currentDate = new Date();
        updateUI();
    });

    // Settings Listeners
    document.getElementById('settingsBtn').addEventListener('click', openSettings);

    // View Toggles
    const showListBtn = document.getElementById('showListBtn');
    const showCalendarBtn = document.getElementById('showCalendarBtn');

    if (showListBtn && showCalendarBtn) {
        showListBtn.addEventListener('click', () => {
            document.getElementById('trackerList').style.display = 'flex';
            document.getElementById('trackerCalendar').style.display = 'none';
            showListBtn.style.background = 'linear-gradient(135deg, var(--emerald-600), var(--emerald-900))';
            showListBtn.style.color = 'white';
            showListBtn.style.border = 'none';
            showCalendarBtn.style.background = 'var(--glass-bg)';
            showCalendarBtn.style.color = 'var(--text-muted)';
            showCalendarBtn.style.border = '1px solid var(--glass-border)';
        });

        showCalendarBtn.addEventListener('click', () => {
            document.getElementById('trackerList').style.display = 'none';
            document.getElementById('trackerCalendar').style.display = 'block';
            showCalendarBtn.style.background = 'linear-gradient(135deg, var(--emerald-600), var(--emerald-900))';
            showCalendarBtn.style.color = 'white';
            showCalendarBtn.style.border = 'none';
            showListBtn.style.background = 'var(--glass-bg)';
            showListBtn.style.color = 'var(--text-muted)';
            showListBtn.style.border = '1px solid var(--glass-border)';
            renderCalendarView();
        });

        // Default init
        showListBtn.style.background = 'linear-gradient(135deg, var(--emerald-600), var(--emerald-900))';
        showListBtn.style.color = 'white';
        showListBtn.style.border = 'none';
    }
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // Theme Toggle Listener
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
});

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('ramadhan_theme');
    const icon = document.querySelector('#themeToggleBtn i');
    const text = document.getElementById('themeToggleText');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (icon) icon.className = 'fa-solid fa-sun';
        if (text) text.textContent = 'Terang';
    } else {
        if (icon) icon.className = 'fa-solid fa-moon';
        if (text) text.textContent = 'Gelap';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const icon = document.querySelector('#themeToggleBtn i');
    const text = document.getElementById('themeToggleText');

    if (isLight) {
        localStorage.setItem('ramadhan_theme', 'light');
        if (icon) icon.className = 'fa-solid fa-sun';
        if (text) text.textContent = 'Terang';
    } else {
        localStorage.setItem('ramadhan_theme', 'dark');
        if (icon) icon.className = 'fa-solid fa-moon';
        if (text) text.textContent = 'Gelap';
    }
}

// Settings & Ramadhan Stats Logic
function openSettings() {
    const startStr = localStorage.getItem('ramadhan_start') || '';
    const totalDays = localStorage.getItem('ramadhan_total') || '30';

    if (startStr) document.getElementById('ramadhanStartDate').value = startStr;
    document.getElementById('ramadhanTotalDays').value = totalDays;

    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const startDate = document.getElementById('ramadhanStartDate').value;
    const totalDays = document.getElementById('ramadhanTotalDays').value;

    if (startDate) {
        localStorage.setItem('ramadhan_start', startDate);
        localStorage.setItem('ramadhan_total', totalDays);
    }
    closeSettings();
    calculateRamadhanStats();
}

function calculateRamadhanStats() {
    const startStr = localStorage.getItem('ramadhan_start');
    const box = document.getElementById('ramadhanStatsBox');

    if (!startStr) {
        box.style.display = 'none';
        return;
    }

    box.style.display = 'flex';
    const totalDays = parseInt(localStorage.getItem('ramadhan_total') || '30');

    // Parse start date accurately
    const startParts = startStr.split('-');
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    startDate.setHours(0, 0, 0, 0);

    // Calculate current day index (1-30)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today - startDate;
    let currentDayDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (currentDayDiff < 1) {
        document.getElementById('hariKeText').textContent = '-';
        document.getElementById('puasaSisaText').textContent = totalDays;
    } else if (currentDayDiff > totalDays) {
        document.getElementById('hariKeText').textContent = 'Selesai';
        document.getElementById('puasaSisaText').textContent = 0;
    } else {
        document.getElementById('hariKeText').textContent = currentDayDiff;
        document.getElementById('puasaSisaText').textContent = totalDays - currentDayDiff;
    }

    // Calculate Total Puasa Selesai
    let puasaCount = 0;
    for (let i = 0; i < totalDays; i++) {
        const checkD = new Date(startDate);
        checkD.setDate(startDate.getDate() + i);
        const key = `tracker_${getDateKey(checkD)}`;
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
            const data = JSON.parse(dataStr);
            if (data['puasa']) puasaCount++;
        }
    }
    document.getElementById('puasaSelesaiText').textContent = puasaCount;

    // Update calendar if visible
    const calArea = document.getElementById('trackerCalendar');
    if (calArea && calArea.style.display !== 'none') {
        renderCalendarView();
    }
}

function renderCalendarView() {
    const startStr = localStorage.getItem('ramadhan_start');
    const container = document.getElementById('calendarGrid');
    if (!container) return;

    container.innerHTML = '';

    if (!startStr) {
        container.innerHTML = '<p class="text-center w-full" style="grid-column: span 7; color: var(--gold); font-size: 13px;">Silakan atur Tanggal 1 Ramadhan terlebih dahulu (Ikon Gear di atas).</p>';
        return;
    }

    const totalDays = parseInt(localStorage.getItem('ramadhan_total') || '30');
    const startParts = startStr.split('-');
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < totalDays; i++) {
        const checkD = new Date(startDate);
        checkD.setDate(startDate.getDate() + i);
        const dateStr = checkD.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

        const key = `tracker_${getDateKey(checkD)}`;
        const dataStr = localStorage.getItem(key);
        let isPuasaDone = false;
        if (dataStr) {
            const data = JSON.parse(dataStr);
            isPuasaDone = data['puasa'] === true;
        }

        const card = document.createElement('div');
        card.className = 'cal-day';
        
        let row = Math.floor(i / 7) + 1;
        let col = (i % 7) + 1;
        card.style.gridArea = `${row} / ${col} / ${row + 1} / ${col + 1}`;
        card.style.zIndex = '1';

        const ramadhanDay = i + 1;
        const isLast10Days = ramadhanDay >= 21;
        const isLailatulQadar = isLast10Days && (ramadhanDay % 2 !== 0);

        let statusClass = '';
        if (checkD < today) {
            statusClass = isPuasaDone ? 'completed' : 'missed';
        } else if (checkD.getTime() === today.getTime()) {
            statusClass = 'today';
            if (isPuasaDone) statusClass += ' completed';
        }

        if (statusClass) card.className += ` ${statusClass}`;

        if (isLailatulQadar) {
            card.className += ' qadar-night';
        }

        let specialLabel = '';
        if (isLailatulQadar) {
            specialLabel = '<div class="qadar-label"><i class="fa-solid fa-star"></i></div>';
        }

        card.innerHTML = `
            ${specialLabel}
            <div>${ramadhanDay}</div>
            <div class="cal-date-label">${dateStr}</div>
        `;

        card.addEventListener('click', () => {
            currentDate = new Date(checkD);
            document.getElementById('showListBtn').click();
            updateUI();
        });

        container.appendChild(card);
    }

    // Background blocks for 10 Hari Terakhir (Day 21-30, indices 20-29)
    let segments = [];
    let currentSegment = null;
    for (let i = 20; i < totalDays; i++) {
        let row = Math.floor(i / 7) + 1;
        let col = (i % 7) + 1;
        if (!currentSegment || currentSegment.row !== row) {
            if (currentSegment) segments.push(currentSegment);
            currentSegment = { row: row, startCol: col, endCol: col };
        } else {
            currentSegment.endCol = col;
        }
    }
    if (currentSegment) segments.push(currentSegment);

    segments.forEach((seg) => {
        const bg = document.createElement('div');
        bg.className = 'last-10-days-bg';
        bg.style.gridArea = `${seg.row} / ${seg.startCol} / ${seg.row + 1} / ${seg.endCol + 1}`;
        container.appendChild(bg);
    });
}

// Format Tanggal (Kunci LocalStorage) e.g., "2024-03-12"
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Navigasi Hari
function changeDay(offset) {
    currentDate.setDate(currentDate.getDate() + offset);
    updateUI();
}

function updateUI() {
    renderDate();
    renderTrackerList();
    updateProgress();
    renderTarawihData();
    checkLailatulQadar();
}

function getRamadhanDay(dateObj) {
    const startStr = localStorage.getItem('ramadhan_start');
    if (!startStr) return -1;
    const startParts = startStr.split('-');
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    startDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateObj);
    checkDate.setHours(0, 0, 0, 0);
    const diffTime = checkDate - startDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function checkLailatulQadar() {
    const card = document.getElementById('lailatulQadarInfo');
    if (!card) return;
    const rDay = getRamadhanDay(currentDate);
    const totalDays = parseInt(localStorage.getItem('ramadhan_total') || '30');

    if (rDay < 20 || rDay > totalDays) {
        card.style.display = 'none';
        return;
    }

    let malam = -1; let startD = -1; let endD = -1;
    if (rDay === 20 || rDay === 21) { malam = 21; startD = 20; endD = 21; }
    else if (rDay === 22 || rDay === 23) { malam = 23; startD = 22; endD = 23; }
    else if (rDay === 24 || rDay === 25) { malam = 25; startD = 24; endD = 25; }
    else if (rDay === 26 || rDay === 27) { malam = 27; startD = 26; endD = 27; }
    else if (rDay === 28 || rDay === 29) { malam = 29; startD = 28; endD = 29; }

    if (malam === -1) {
        card.style.display = 'none';
        return;
    }

    const startStr = localStorage.getItem('ramadhan_start');
    const startParts = startStr.split('-');
    const ramadhanStartDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);

    const dateMulai = new Date(ramadhanStartDate);
    dateMulai.setDate(ramadhanStartDate.getDate() + startD - 1);
    const dateSelesai = new Date(ramadhanStartDate);
    dateSelesai.setDate(ramadhanStartDate.getDate() + endD - 1);

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const strMulai = dateMulai.toLocaleDateString('id-ID', options);
    const strSelesai = dateSelesai.toLocaleDateString('id-ID', options);

    let maghribTime = "18:00 (Est)";
    let subuhTime = "04:30 (Est)";
    try {
        const timingsStr = localStorage.getItem('last_timings');
        if (timingsStr) {
            const timings = JSON.parse(timingsStr);
            if (timings.Maghrib) maghribTime = timings.Maghrib;
            if (timings.Fajr) subuhTime = timings.Fajr;
        }
    } catch (e) { }

    card.style.display = 'block';
    card.innerHTML = `
        <div class="glass-panel qadar-info-card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; min-width: 40px; border-radius: 12px; background: var(--gold); color: var(--bg-color); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    <i class="fa-solid fa-star"></i>
                </div>
                <div>
                    <h3 style="color: var(--gold); font-size: 16px; margin: 0; font-weight: 700;">Malam Lailatul Qadar</h3>
                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Potensi Malam ke-${malam}</p>
                </div>
            </div>
            
            <div class="qadar-table-box">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.15); padding-bottom: 8px;">
                    <div>
                        <div style="font-size: 11px; color: var(--emerald-100);"><i class="fa-solid fa-moon" style="font-size: 9px; margin-right: 4px;"></i> Dimulai (Malam)</div>
                        <div class="qadar-text-main" style="font-size: 13px; font-weight: 600; margin-top: 2px;">${strMulai}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; color: var(--emerald-100);">Jam (Maghrib)</div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--gold); margin-top: 2px;">${maghribTime}</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <div style="font-size: 11px; color: var(--emerald-100);"><i class="fa-solid fa-sun" style="font-size: 9px; margin-right: 4px;"></i> Berakhir (Subuh)</div>
                        <div class="qadar-text-main" style="font-size: 13px; font-weight: 600; margin-top: 2px;">${strSelesai}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; color: var(--emerald-100);">Jam (Subuh)</div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--gold); margin-top: 2px;">${subuhTime}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Tampilan Tanggal
function renderDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = currentDate.toLocaleDateString('id-ID', options);
    document.getElementById('currentDateDisplay').textContent = dateStr;

    const tarawihDateEl = document.getElementById('tarawihDateDisplay');
    if (tarawihDateEl) tarawihDateEl.textContent = dateStr;

    // Disable "Next" if it's tomorrow
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewDate = new Date(currentDate);
    viewDate.setHours(0, 0, 0, 0);

    document.getElementById('nextDayBtn').disabled = viewDate >= today;

    // Juga update stat boxes
    setTimeout(calculateRamadhanStats, 50);
}

// Mengambil data checklist dari LocalStorage
function getDayData() {
    const key = `tracker_${getDateKey(currentDate)}`;
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }

    // Default state: Semua False (Kosong)
    const defaultState = {};
    trackerItems.forEach(item => defaultState[item.id] = false);
    return defaultState;
}

// Menyimpan data checklist ke LocalStorage
function saveDayData(data) {
    const key = `tracker_${getDateKey(currentDate)}`;
    localStorage.setItem(key, JSON.stringify(data));
    updateProgress();
    calculateStreak();
}

// Toggle status item
function toggleItem(itemId) {
    const data = getDayData();
    data[itemId] = !data[itemId];
    saveDayData(data);

    // Animate UI specifically (without re-rendering full list)
    const el = document.getElementById(`item-${itemId}`);
    if (data[itemId]) {
        el.classList.add('completed');
    } else {
        el.classList.remove('completed');
    }
}

// Render isi Tracker
function renderTrackerList() {
    const container = document.getElementById('trackerList');
    container.innerHTML = ''; // Clear existing

    const dayData = getDayData();

    trackerItems.forEach(item => {
        const isCompleted = dayData[item.id];

        const div = document.createElement('div');
        div.className = `tracker-item ${isCompleted ? 'completed' : ''}`;
        div.id = `item-${item.id}`;
        div.onclick = () => toggleItem(item.id);

        div.innerHTML = `
            <div class="item-info">
                <div class="item-icon">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="item-text">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
            <div class="check-circle">
                <i class="fa-solid fa-check"></i>
            </div>
        `;
        container.appendChild(div);
    });
}

// Update Progress Bar
function updateProgress() {
    const data = getDayData();
    const total = trackerItems.length;
    const completed = Object.values(data).filter(Boolean).length;

    const percentage = (completed / total) * 100;

    document.getElementById('progressText').textContent = `${completed}/${total}`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
}

// Hitung Streak beruntun
function calculateStreak() {
    let streak = 0;
    let checkDate = new Date();

    // Cek mundurkan hari, hitung berapa hari berturut-turut puasa selesai (sebagai indikator streak)
    while (true) {
        const key = `tracker_${getDateKey(checkDate)}`;
        const dataStr = localStorage.getItem(key);

        if (!dataStr) break;

        const data = JSON.parse(dataStr);
        // Anggap streak valid jika item 'puasa' selesai (minimum daily ibadah)
        if (data['puasa']) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    document.getElementById('streakValue').textContent = streak;
}

// ==========================================
// FEATURE: Tarawih Tracker
// ==========================================
function getTarawihData() {
    const key = `tarawih_${getDateKey(currentDate)}`;
    const dataStr = localStorage.getItem(key);
    if (dataStr) return JSON.parse(dataStr);
    return { tarawih: 0, witir: 0 };
}

function saveTarawihData(data) {
    const key = `tarawih_${getDateKey(currentDate)}`;
    localStorage.setItem(key, JSON.stringify(data));

    // Auto-check tracker box if target reached (bonus integration)
    const trackerData = getDayData();
    if (data.tarawih >= 8 && data.witir >= 1) {
        if (!trackerData['tarawih']) toggleItem('tarawih'); // mark as done automatically
    }
}

function renderTarawihData() {
    const data = getTarawihData();
    document.getElementById('tarawihCount').textContent = data.tarawih;
    document.getElementById('witirCount').textContent = data.witir;
}

function resetTarawih() {
    if (confirm('Apakah Anda yakin ingin mereset hitungan malam ini?')) {
        const data = { tarawih: 0, witir: 0 };
        saveTarawihData(data);
        renderTarawihData();
    }
}

function updateRakaat(type, amount) {
    const data = getTarawihData();
    let newVal = data[type] + amount;

    // Constraints
    if (newVal < 0) newVal = 0;
    if (type === 'tarawih' && newVal > 36) newVal = 36;
    if (type === 'witir' && newVal > 11) newVal = 11;

    data[type] = newVal;
    saveTarawihData(data);

    // Animate the text
    const el = document.getElementById(`${type}Count`);
    el.style.transform = 'scale(1.2)';
    el.style.color = 'var(--gold)';
    el.textContent = newVal;

    setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.color = 'var(--text-main)';
    }, 200);
}

// Add simple particle effects on init (aesthetic boost)
function initUI() {
    console.log("Ramadhan Web App Initialized");
    initNavigation();
    initTheme();

    // Auto load current date prayer times if location is already granted before
    const cachedLat = localStorage.getItem('jadwal_lat');
    const cachedLng = localStorage.getItem('jadwal_lng');
    const cachedCity = localStorage.getItem('jadwal_city');

    if (cachedLat && cachedLng) {
        document.getElementById('locationText').innerHTML = `<i class="fa-solid fa-map-location-dot" style="color:var(--gold); margin-right:4px;"></i> Menampilkan Jadwal untuk: <strong>${cachedCity || 'Lokasi Tersimpan'}</strong>`;
        fetchPrayerTimes(cachedLat, cachedLng, true); // true = skip geocoding city name again
    } else {
        document.getElementById('locationText').textContent = "Klik 'Perbarui Lokasi' untuk melihat jadwal.";
        document.getElementById('prayerTimesContainer').innerHTML = '<p class="text-center" style="grid-column: span 2; color: var(--text-muted); font-size: 14px;">Belum ada data lokasi.</p>';
    }

    renderTarawihData();
    initDoaFeature();
    initZakatFeature();
}

// ==========================================
// FEATURE: Tab Navigation
// ==========================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all tabs & navs
            document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

            // Add active to clicked nav and target tab
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// ==========================================
// FEATURE: Jadwal Sholat (Aladhan API)
// ==========================================
document.getElementById('getLocationBtn').addEventListener('click', getLocationAndPrayerTimes);

function getLocationAndPrayerTimes() {
    const locationText = document.getElementById('locationText');
    const container = document.getElementById('prayerTimesContainer');

    locationText.textContent = "Mencari lokasi GPS Anda...";
    container.innerHTML = '<div class="loader-spinner"></div>';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                locationText.textContent = `Menganalisa koordinat...`;

                // Save coordinates
                localStorage.setItem('jadwal_lat', lat);
                localStorage.setItem('jadwal_lng', lng);

                fetchPrayerTimes(lat, lng, false);
            },
            (error) => {
                locationText.textContent = "Akses lokasi ditolak atau gagal. Pastikan GPS aktif.";
                container.innerHTML = '<p class="text-center" style="grid-column: span 2; color: #fca5a5;">Gagal mendapatkan lokasi. Silakan izinkan akses lokasi di browser Anda.</p>';
            }
        );
    } else {
        locationText.textContent = "Browser penguna tidak menduktung fitur lokasi Geolocation.";
    }
}

async function fetchPrayerTimes(lat, lng, skipGeocoding = false) {
    const container = document.getElementById('prayerTimesContainer');
    // Using current date
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);

    try {
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=11`; // Method 11 is Majlis Ugama Islam Singapura (close to SEA standard) / can use 20 for Kemenag if preferred
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.code === 200) {
            const timings = data.data.timings;
            renderPrayerTimes(timings);

            localStorage.setItem('last_timings', JSON.stringify(timings));
            if (typeof checkLailatulQadar === 'function') checkLailatulQadar();

            if (!skipGeocoding) {
                // Ambil Nama Kota (Reverse Geocoding OpenStreetMap API - Gratis)
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`)
                    .then(res => res.json())
                    .then(geoData => {
                        const city = geoData.address.city || geoData.address.town || geoData.address.regency || geoData.address.county || "Lokasi Anda";
                        localStorage.setItem('jadwal_city', city);
                        document.getElementById('locationText').innerHTML = `<i class="fa-solid fa-map-location-dot" style="color:var(--gold); margin-right:4px;"></i> Menampilkan Jadwal untuk: <strong>${city}</strong>`;
                    })
                    .catch(e => {
                        console.log("Geocoding API error", e);
                        document.getElementById('locationText').innerHTML = `Gagal mendapatkan nama kota. Menggunakan koordinat.`;
                    });
            }

        } else {
            throw new Error("Invalid API response");
        }
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="grid-column: span 2; color: #fca5a5;">Gagal mengambil data jadwal sholat. Periksa koneksi internet Anda.</p>';
        console.error(err);
    }
}

function renderPrayerTimes(timings) {
    const container = document.getElementById('prayerTimesContainer');
    container.innerHTML = '';

    // Opsi ikon yang lebih relevan untuk Jadwal
    const prayers = [
        { id: 'Imsak', name: 'Imsak', icon: 'fa-star-and-crescent', style: 'highlight-small' },
        { id: 'Fajr', name: 'Subuh', icon: 'fa-cloud-moon', style: 'normal' },
        { id: 'Dhuhr', name: 'Dzuhur', icon: 'fa-sun', style: 'normal' },
        { id: 'Asr', name: 'Ashar', icon: 'fa-cloud-sun', style: 'normal' },
        { id: 'Maghrib', name: 'Maghrib', icon: 'fa-utensils', style: 'highlight-big', subText: '(Waktu Buka Puasa)' },
        { id: 'Isha', name: 'Isya', icon: 'fa-moon', style: 'normal' }
    ];

    prayers.forEach(p => {
        const timeStr = timings[p.id];
        const card = document.createElement('div');

        let subHtml = p.subText ? `<span style="font-size: 11px; color: var(--emerald-100); display: block;">${p.subText}</span>` : '';
        let layoutClass = 'jadwal-card-modern';
        if (p.style === 'highlight-small') layoutClass += ' span-2 style-highlight';
        if (p.style === 'highlight-big') layoutClass += ' span-2 style-maghrib';

        card.className = layoutClass;
        card.innerHTML = `
            <div class="jc-content">
                <i class="fa-solid ${p.icon} jc-icon"></i>
                <div class="jc-text">
                    <h4>${p.name}</h4>
                    ${subHtml}
                </div>
            </div>
            <div class="time">${timeStr}</div>
        `;
        container.appendChild(card);
    });

    startPrayerCountdown(timings);
}

// Countdown Logic
let countdownInterval;

function startPrayerCountdown(timings) {
    if (countdownInterval) clearInterval(countdownInterval);
    if (!timings) return;

    const box = document.getElementById('prayerCountdownBox');
    const nameEl = document.getElementById('nextPrayerName');
    const timerEl = document.getElementById('countdownTimer');

    if (!box || !nameEl || !timerEl) return;
    box.style.display = 'block';

    function updateCountdown() {
        const now = new Date();
        const prayerDates = [];
        const requiredPrayers = ['Imsak', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const prayerNames = { 'Imsak': 'Imsak', 'Fajr': 'Subuh', 'Dhuhr': 'Dzuhur', 'Asr': 'Ashar', 'Maghrib': 'Maghrib (Buka Puasa)', 'Isha': 'Isya' };

        requiredPrayers.forEach(p => {
            const timeStr = timings[p];
            if (timeStr) {
                const parts = timeStr.split(':');
                const d = new Date(now);
                d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
                prayerDates.push({ id: p, name: prayerNames[p], date: d });
            }
        });

        prayerDates.sort((a, b) => a.date - b.date);

        let nextPrayer = prayerDates.find(p => p.date > now);

        // If all prayers today have passed, set to Imsak tomorrow
        if (!nextPrayer) {
            const imsak = prayerDates.find(p => p.id === 'Imsak');
            if (imsak) {
                nextPrayer = { ...imsak };
                nextPrayer.date = new Date(imsak.date);
                nextPrayer.date.setDate(nextPrayer.date.getDate() + 1);
            }
        }

        if (!nextPrayer) return; // Should not happen

        nameEl.textContent = nextPrayer.name;

        const diff = nextPrayer.date - now;
        if (diff <= 0) {
            timerEl.textContent = "00:00:00";
            // Refresh API or render automatically? For now just stay at 0.
            return;
        }

        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// ==========================================
// FEATURE: Doa & Dzikir Harian
// ==========================================
const doaData = [
    {
        title: "Doa Niat Puasa Ramadhan",
        arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانِ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى",
        latin: "Nawaitu shauma ghadin 'an adaa'i fardhi syahri ramadhaani haadzihis sanati lillaahi ta'aalaa",
        arti: "Aku niat berpuasa esok hari untuk menunaikan Fardhu di bulan Ramadhan tahun ini, karena Allah Ta'ala."
    },
    {
        title: "Doa Buka Puasa (Dhahabaz Zhama'u)",
        arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللهُ",
        latin: "Dzahabaz zhama'u wabtallatil 'uruuqu wa tsabatal ajru, insyaa Allah",
        arti: "Telah hilang rasa haus, dan urat-urat telah basah serta pahala telah ditetapkan, insya Allah."
    },
    {
        title: "Doa Setelah Sholat Tarawih (Kamilin)",
        arabic: "اَللّٰهُمَّ اجْعَلْنَا بِالْإِيْمَانِ كَامِلِيْنَ، وَلِلْفَرَائِضِ مُؤَدِّيْنَ",
        latin: "Allahummaj'alna bil iimaani kaamiliin, wa lil faraa'idhi mu'addiin",
        arti: "Ya Allah, jadikanlah kami orang-orang yang sempurna imannya, yang melaksanakan kewajiban-kewajiban."
    },
    {
        title: "Doa Setelah Sholat Witir",
        arabic: "سُبْحَانَ الْمَلِكِ الْقُدُّوسِ",
        latin: "Subhaanal malikil qudduus (3x)",
        arti: "Maha Suci Engkau yang Maha Merajai lagi Maha Suci dari berbagai kekurangan. (Dibaca 3x)"
    },
    {
        title: "Doa Malam Lailatul Qadar",
        arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        latin: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
        arti: "Ya Allah, sesungguhnya Engkau Maha Pemaaf dan senang memaafkan, maka maafkanlah kesalahanku."
    }
];

function initDoaFeature() {
    renderDoaList(doaData);

    document.getElementById('doaSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = doaData.filter(doa =>
            doa.title.toLowerCase().includes(query) ||
            doa.arti.toLowerCase().includes(query)
        );
        renderDoaList(filtered);
    });
}

function renderDoaList(list) {
    const container = document.getElementById('doaListContainer');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="text-center mt-main text-muted">Doa tidak ditemukan.</p>';
        return;
    }

    list.forEach(doa => {
        const card = document.createElement('div');
        card.className = 'doa-card';
        card.innerHTML = `
            <div class="doa-title">${doa.title}</div>
            <div class="doa-arabic" dir="rtl">${doa.arabic}</div>
            <div class="doa-latin">${doa.latin}</div>
            <div class="doa-arti">"${doa.arti}"</div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// FEATURE: Kalkulator Zakat
// ==========================================
function initZakatFeature() {
    const typeSelect = document.getElementById('zakatType');
    const fitrahInputs = document.getElementById('fitrahInputs');
    const malInputs = document.getElementById('malInputs');
    const btn = document.getElementById('calculateZakatBtn');
    const resultDiv = document.getElementById('zakatResult');
    const amountText = document.getElementById('zakatAmountText');

    typeSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        if (type === 'fitrah') {
            fitrahInputs.style.display = 'block';
            malInputs.style.display = 'none';
        } else {
            fitrahInputs.style.display = 'none';
            malInputs.style.display = 'block';
        }
        resultDiv.style.display = 'none'; // reset result
    });

    btn.addEventListener('click', () => {
        const type = typeSelect.value;
        let total = 0;

        if (type === 'fitrah') {
            const price = parseFloat(document.getElementById('berasPrice').value) || 0;
            const count = parseInt(document.getElementById('familyCount').value) || 1;
            // Zakat fitrah: 2.5 kg atau 3.5 liter beras per orang (Kita gunakan standar 2.5 kg * Harga)
            total = price * 2.5 * count;
        } else {
            const harta = parseFloat(document.getElementById('hartaTotal').value) || 0;
            // Zakat mal: 2.5% dari total harta (Asumsi user sudah memasukkan harta >= Nisab yang sudah haul 1 tahun)
            total = harta * 0.025;
        }

        // Format to IDR
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });

        amountText.textContent = formatter.format(total);
        resultDiv.style.display = 'block';
    });
}
