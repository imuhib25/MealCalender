const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const totalMealsEl = document.getElementById("totalMeals");
const totalCostEl = document.getElementById("totalCost");
const mealCostInput = document.getElementById("mealCost");
const modalTitle = document.getElementById("modalTitle");
const lunch = document.getElementById("lunch");
const dinner = document.getElementById("dinner");

let selectedDay = null;
let mealData = {};
let chart;

const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
months.forEach((m,i)=>monthSelect.innerHTML+=`<option value="${i}">${m}</option>`);

for(let y=2020;y<=2035;y++) yearSelect.innerHTML+=`<option>${y}</option>`;

monthSelect.value = new Date().getMonth();
yearSelect.value = new Date().getFullYear();

function daysInMonth(){
    return new Date(yearSelect.value, Number(monthSelect.value)+1, 0).getDate();
}

async function loadData(){
    mealData = await window.electronAPI.getMonth(Number(monthSelect.value), Number(yearSelect.value)) || {};
    const cost = await window.electronAPI.getCost(Number(monthSelect.value), Number(yearSelect.value));
    mealCostInput.value = cost ?? "";
}

mealCostInput.oninput = ()=>{
    window.electronAPI.setCost(Number(monthSelect.value), Number(yearSelect.value), mealCostInput.value);
};

async function generateCalendar(){
    await loadData();
    calendar.innerHTML="";
    for(let d=1; d<=daysInMonth(); d++){
        let div=document.createElement("div");
        div.className="day";
        div.innerText=d;
        if(mealData[d]) div.classList.add("active");
        div.onclick=()=>openModal(d);
        calendar.appendChild(div);
    }
    updateSummary();
}

function openModal(d){
    selectedDay=d;
    modal.style.display="flex";
    modalTitle.innerText=`Day ${d}`;
    lunch.checked=mealData[d]?.lunch||false;
    dinner.checked=mealData[d]?.dinner||false;
}

async function saveDay(){
    mealData[selectedDay]={ lunch:lunch.checked, dinner:dinner.checked };
    await window.electronAPI.saveDay(Number(monthSelect.value), Number(yearSelect.value), selectedDay, mealData[selectedDay]);
    modal.style.display="none";
    generateCalendar();
}

function updateSummary(){
    let lunchCount=0, dinnerCount=0;
    Object.values(mealData).forEach(d=>{
        if(d.lunch) lunchCount++;
        if(d.dinner) dinnerCount++;
    });
    let totalMeals=lunchCount+dinnerCount;
    totalMealsEl.innerText=totalMeals;

    let cost=Number(mealCostInput.value)||0;
    totalCostEl.innerText=totalMeals*cost;

    updateChart(lunchCount,dinnerCount);
}

function updateChart(lunch,dinner){
    if(chart) chart.destroy();
    chart=new Chart(document.getElementById("mealChart"),{
        type:"bar",
        data:{
            labels:["Lunch","Dinner"],
            datasets:[{
                label:"Meal Count",
                data:[lunch,dinner]
            }]
        }
    });
}

function selectWholeMonth(){
    for(let i=1;i<=daysInMonth();i++){
        mealData[i]={lunch:true,dinner:true};
    }
    window.electronAPI.selectWholeMonth(Number(monthSelect.value), Number(yearSelect.value), daysInMonth());
    generateCalendar();
}

/* ===== CSV EXPORT ===== */
function exportCSV(){
    (async ()=>{
        const csv = await window.electronAPI.exportCSV(Number(monthSelect.value), Number(yearSelect.value), daysInMonth());
        let blob=new Blob([csv],{type:"text/csv"});
        let a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="meal-report.csv";
        a.click();
    })();
}

/* ===== PDF EXPORT ===== */
function exportPDF(){
    if(window.electronAPI && window.electronAPI.exportPDF){
        window.electronAPI.exportPDF().then(res=>{
            if(res && !res.canceled) alert('PDF saved: '+res.filePath);
            else if(res && res.error) alert('PDF export failed: '+res.error);
        });
    }else{
        window.print();
    }
}

function clearMonth(){
    if(confirm("Clear this month?")){
        window.electronAPI.clearMonth(Number(monthSelect.value), Number(yearSelect.value));
        generateCalendar();
    }
}

monthSelect.onchange=generateCalendar;
yearSelect.onchange=generateCalendar;
window.onclick=e=>{ if(e.target===modal) modal.style.display="none"; };

generateCalendar();
