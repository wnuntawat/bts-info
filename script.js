// --- ตั้งค่าข้อมูลของคุณที่นี่ ---
const SHEET_ID = '1-xqP86a-1UGOvZxuVBsi6KlPzBj4N1M0gc9Bsd9QqyZaGxl2uY4A';
const API_KEY = 'AIzaSyDcFwjJrIMezNVeMlmLO00efP9H4H9F990';
const RANGE = 'Sheet1!A2:C100'; // ปรับตามชื่อ Sheet และช่วงข้อมูลของคุณ

async function updateDashboard() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`);
        const data = await response.json();
        const rows = data.values;

        if (!rows) return;

        let currentYear = "";
        const cleanData = [];

        rows.forEach(row => {
            // Logic เติมปีอัตโนมัติ (Fill Down)
            if (row[0] && row[0].trim() !== "") currentYear = row[0];
            
            const month = row[1];
            const qty = parseFloat(row[2]) || 0;

            if (month) {
                cleanData.push({
                    fullLabel: `${currentYear} ${month}`,
                    value: qty
                });
            }
        });

        // --- 1. คำนวณ KPI ---
        const total = cleanData.reduce((acc, curr) => acc + curr.value, 0);
        const avg = total / cleanData.length;
        const maxItem = [...cleanData].sort((a, b) => b.value - a.value)[0];

        // อัปเดตหน้าจอ
        document.getElementById('kpi-total').innerText = total.toLocaleString();
        document.getElementById('kpi-avg').innerText = Math.round(avg).toLocaleString();
        document.getElementById('kpi-max').innerText = maxItem ? maxItem.fullLabel : "N/A";
        document.getElementById('kpi-count').innerText = cleanData.length;

        // --- 2. วาดกราฟ ---
        drawChart(cleanData);

    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

function drawChart(dataset) {
    const ctx = document.getElementById('lossChart').getContext('2d');
    if (window.myChart instanceof Chart) window.myChart.destroy();

    const labels = dataset.map(d => d.fullLabel);
    const values = dataset.map(d => d.value);

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                borderColor: '#ef4444', // Red-500
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#ef4444',
                pointHoverRadius: 8,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#38bdf8',
                    bodyFont: { size: 14 },
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8', font: { size: 12 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                }
            }
        }
    });
}

// เริ่มต้นทำงานและ Refresh ทุก 1 นาที
updateDashboard();
setInterval(updateDashboard, 60000);

// เริ่มทำงาน
initDashboard();

// (Optional) ตั้งเวลาให้ Refresh ทุกๆ 5 นาที
setInterval(initDashboard, 300000);
