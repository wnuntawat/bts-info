// --- ตั้งค่าข้อมูลของคุณที่นี่ ---
const SHEET_ID = 'ใส่_SHEET_ID_ของคุณที่นี่';
const API_KEY = 'ใส่_API_KEY_จาก_Google_Cloud';
const RANGE = 'Sheet1!A1:B13'; // ปรับตามชื่อ Sheet และช่วงข้อมูลของคุณ

async function initDashboard() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const rows = data.values;

        if (!rows) return;

        // แยกหัวข้อ (Header) และข้อมูล (Data)
        const labels = rows.slice(1).map(row => row[0]); // คอลัมน์ A (เช่น เดือน)
        const values = rows.slice(1).map(row => parseFloat(row[1])); // คอลัมน์ B (เช่น ยอดขาย)

        // อัปเดต KPI แบบง่าย (ตัวอย่าง: เอาผลรวมทั้งหมด)
        const total = values.reduce((a, b) => a + b, 0);
        document.getElementById('kpi-sales').innerText = `฿${total.toLocaleString()}`;
        document.getElementById('kpi-users').innerText = values.length;

        // สร้างกราฟ
        renderChart(labels, values);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function renderChart(labels, values) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    // เคลียร์กราฟเก่าถ้ามี (สำหรับกรณีทำ Auto-refresh)
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance Data',
                data: values,
                borderColor: '#22d3ee', // Cyan-400
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#22d3ee'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            }
        }
    });
}

// เริ่มทำงาน
initDashboard();

// (Optional) ตั้งเวลาให้ Refresh ทุกๆ 5 นาที
setInterval(initDashboard, 300000);
