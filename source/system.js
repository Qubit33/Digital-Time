const PI = Math.PI;  
const radius = 140;  
const timezoneSelect = document.getElementById("timezone");
const themeSelect = document.getElementById("theme");  
const clock = 
document.getElementById("clock");
 
// Criar números usando π  
for (let n = 1; n <= 12; n++) {  
    const angle = (n / 12) * 2 * PI;  
    const x = 160 + radius * Math.sin(angle);  
    const y = 160 - radius * Math.cos(angle);  
  
    const number = document.createElement("div");  
    number.className = "number";  
    number.innerText = n;  
    number.style.left = x + "px";  
    number.style.top = y + "px";  
  
    clock.appendChild(number);  
}  
  
// Alterar tema  
themeSelect.addEventListener("change", () => {  
    document.body.className = themeSelect.value;  
});  
  
function getTimeInZone(timeZone) {  
    const now = new Date();  
  
    // 🔥 Caso especial: Quantic Clock  
    if (timeZone === "Quantic") {  
        const ms = now.getTime();  
  
        // Tempo "quântico" (acelerado e não linear)  
        const quantic = ms / 7; // ajuste aqui pra velocidade  
  
        const totalSeconds = Math.floor(quantic / 1000);  
  
        const second = totalSeconds % 60;  
        const minute = Math.floor(totalSeconds / 60) % 60;  
        const hour = Math.floor(totalSeconds / 3600) % 24;  
  
        return { hour, minute, second };  
    }  
  
    // 🌍 Fuso normal  
    const formatter = new Intl.DateTimeFormat("pt-BR", {  
        timeZone,  
        hour: "numeric",  
        minute: "numeric",  
        second: "numeric",  
        hour12: false  
    });  
  
    const parts = formatter.formatToParts(now);  
  
    return {  
        hour: parseInt(parts.find(p => p.type === "hour").value),  
        minute: parseInt(parts.find(p => p.type === "minute").value),  
        second: parseInt(parts.find(p => p.type === "second").value)  
    };  
}  
  
function updateClock() {  
    const { hour, minute, second, millisecond } = getTimeInZone(timezoneSelect.value);  
        
    const secondAngle = (second / 60) * 2 * PI;  
    const minuteAngle = ((minute + second/60) / 60) * 2 * PI;  
    const hourAngle = ((hour % 12 + minute/60 + second/3600) / 12) * 2 * PI;  
  
    const toDegrees = angle => angle * (180 / PI);  
       document.getElementById("second").style.transform =  
        `translateX(-50%) rotate(${toDegrees(secondAngle)}deg)`;  
  
    document.getElementById("minute").style.transform =  
        `translateX(-50%) rotate(${toDegrees(minuteAngle)}deg)`;  
  
    document.getElementById("hour").style.transform =  
        `translateX(-50%) rotate(${toDegrees(hourAngle)}deg)`;  
  
    // 🔥 CONTADOR DIGITAL  
    const format = n => String(n).padStart(2, '0');  
  
    document.getElementById("digital").innerText =  
        `${format(hour)}:${format(minute)}:${format(second)}`;  
}  
  
setInterval(updateClock, 1000);  
updateClock();  
