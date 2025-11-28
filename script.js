/* ===== DATA ===== */
const carsData = [
  { id: "c1", name: "Honda City", type: "sedan", price: 2000, img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80", seats:5, transmission:"Automatic"},
  { id: "c2", name: "Hyundai Verna", type: "sedan", price: 2200, img: "https://images.unsplash.com/photo-1549921296-3f3b9b5b5462?auto=format&fit=crop&w=1200&q=80", seats:5, transmission:"Manual"},
  { id: "c3", name: "Toyota Fortuner", type: "suv", price: 4000, img: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80", seats:7, transmission:"Automatic"},
  { id: "c4", name: "Mahindra XUV700", type: "suv", price: 3600, img: "https://images.unsplash.com/photo-1606851094573-9e0e9c7f7b9a?auto=format&fit=crop&w=1200&q=80", seats:7, transmission:"Automatic"},
  { id: "c5", name: "BMW 5 Series", type: "luxury", price: 7000, img: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80", seats:5, transmission:"Automatic"},
  { id: "c6", name: "Mercedes S-Class", type: "luxury", price: 9000, img: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80", seats:5, transmission:"Automatic"},
  { id: "c7", name: "Porsche 911", type: "sports", price: 12000, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", seats:2, transmission:"Automatic"},
  { id: "c8", name: "Audi R8", type: "sports", price: 11000, img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80", seats:2, transmission:"Automatic"}
];

/* ===== UTIL ===== */
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return Array.from(document.querySelectorAll(sel))}

/* ===== DARK MODE ===== */
function initDarkMode(){
  const theme = localStorage.getItem('rmc-theme');
  if(theme==='dark') document.documentElement.style.background="#0b1220";
  // toggle buttons
  qsa('#darkToggle').forEach(b=>{
    b.addEventListener('click', ()=>{
      const current = localStorage.getItem('rmc-theme');
      if(current==='dark'){ localStorage.removeItem('rmc-theme'); document.documentElement.style.background=''; b.textContent='🌙'; }
      else { localStorage.setItem('rmc-theme','dark'); document.documentElement.style.background='#0b1220'; b.textContent='☀️';}
    });
  });
}

/* ===== HOME: testimonials & search redirect ===== */
function initHome(){
  const testi = [
    {name:"Asha", text:"Great service, clean cars and friendly staff."},
    {name:"Ravi", text:"Quick booking and competitive price."},
    {name:"Sneha", text:"Perfect for family trips. Highly recommend."}
  ];
  const slider = qs('#testimonialSlider');
  if(!slider) return;
  slider.innerHTML = '';
  testi.forEach(t=>{
    const d=document.createElement('div'); d.className='testi'; d.innerHTML=`<strong>${t.name}</strong><p>${t.text}</p>`;
    slider.appendChild(d);
  });
  // auto scroll
  let idx=0;
  setInterval(()=>{ idx = (idx+1)%testi.length; slider.scrollTo({left:idx*280,behavior:'smooth'}) }, 3500);
}
function goToCars(e){
  e?.preventDefault();
  const loc = qs('#qLocation')?.value || '';
  const budget = qs('#qBudget')?.value || '';
  const purpose = qs('#qPurpose')?.value || '';
  const params = new URLSearchParams();
  if(loc) params.set('loc',loc);
  if(budget) params.set('max',budget);
  if(purpose) params.set('type',purpose);
  location.href = 'cars.html?'+params.toString();
}

/* ===== CARS PAGE ===== */
function getQueryParams(){
  return Object.fromEntries(new URLSearchParams(location.search));
}
function renderCars(){
  const grid = qs('#carsGrid');
  if(!grid) return;
  grid.innerHTML='';
  const p = getQueryParams();
  const typeFilter = qs('#filterType')?.value || p.type || '';
  const priceFilter = Number(qs('#filterPrice')?.value || p.max || 0);
  const filtered = carsData.filter(c=>{
    if(typeFilter && c.type!==typeFilter) return false;
    if(priceFilter && c.price>priceFilter) return false;
    return true;
  });
  filtered.forEach(c=>{
    const div=document.createElement('div'); div.className='car-card';
    div.innerHTML = `
      <input class="compare-checkbox" type="checkbox" data-id="${c.id}" onchange="onCompareCheck(this)"/>
      <div class="heart" onclick="toggleFav('${c.id}', this)">♡</div>
      <img src="${c.img}" alt="${c.name}"/>
      <div class="card-body">
        <h4>${c.name}</h4>
        <div class="muted">${c.transmission} • ${c.seats} seats</div>
        <div class="price">₹${c.price}/day</div>
        <div style="margin-top:10px">
          <button class="btn" onclick="goBooking('${c.id}')">Rent Now</button>
          <button class="btn ghost" onclick="addToCompare('${c.id}')">Compare</button>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
  renderFavorites();
  // pre-check favorites hearts
  qsa('.car-card').forEach(card=>{
    const id = card.querySelector('img').src;
  });
}
function clearFilters(){
  qs('#filterPrice').value=''; qs('#filterType').value='';
  renderCars();
}

/* ===== FAVORITES ===== */
function getFavs(){ return JSON.parse(localStorage.getItem('rmc-favs')||'[]') }
function toggleFav(id, el){
  const favs = getFavs();
  const idx = favs.indexOf(id);
  if(idx>=0) favs.splice(idx,1), el.textContent='♡';
  else favs.push(id), el.textContent='❤️';
  localStorage.setItem('rmc-favs', JSON.stringify(favs));
  renderFavorites();
}
function renderFavorites(){
  const favGrid = qs('#favoritesGrid');
  if(!favGrid) return;
  const favs = getFavs();
  favGrid.innerHTML='';
  favs.forEach(id=>{
    const c = carsData.find(x=>x.id===id);
    if(!c) return;
    const d=document.createElement('div'); d.className='car-card';
    d.innerHTML=`<img src="${c.img}" alt="${c.name}"/><div class="card-body"><h4>${c.name}</h4><div class="price">₹${c.price}/day</div><div style="margin-top:10px"><button class="btn" onclick="goBooking('${c.id}')">Book</button></div></div>`;
    favGrid.appendChild(d);
  });
}

/* ===== COMPARE feature (choose up to 2) ===== */
function onCompareCheck(chk){ /* keep for UI */ }
function addToCompare(id){
  const current = JSON.parse(localStorage.getItem('rmc-compare')||'[]');
  if(!current.includes(id) && current.length>=2){ alert('You can only compare 2 cars'); return; }
  if(current.includes(id)){
    const idx=current.indexOf(id); current.splice(idx,1);
  } else current.push(id);
  localStorage.setItem('rmc-compare', JSON.stringify(current));
  openCompare();
}
function openCompare(){
  const arr = JSON.parse(localStorage.getItem('rmc-compare')||'[]');
  if(arr.length<1){ alert('Select cars to compare'); return; }
  const modal = qs('#compareModal'); const area = qs('#compareArea');
  area.innerHTML='';
  arr.forEach(id=>{
    const c = carsData.find(x=>x.id===id);
    const card = document.createElement('div'); card.className='compare-card';
    card.innerHTML = `<img src="${c.img}" style="width:100%;height:140px;object-fit:cover;border-radius:8px"/><h4>${c.name}</h4><p>${c.type} • ${c.transmission} • ${c.seats} seats</p><p class="price">₹${c.price}/day</p>`;
    area.appendChild(card);
  });
  modal.classList.remove('hidden');
}
function closeCompare(){ qs('#compareModal').classList.add('hidden'); localStorage.removeItem('rmc-compare'); }

/* ===== BOOKING ===== */
function goBooking(id){
  const params = new URLSearchParams();
  if(id) params.set('car', id);
  location.href = 'booking.html?'+params.toString();
}
function initBooking(){
  const sel = qs('#bookCar');
  if(!sel) return;
  sel.innerHTML = carsData.map(c=>`<option value="${c.id}">${c.name} - ₹${c.price}/day</option>`).join('');
  const p = getQueryParams();
  if(p.car) sel.value = p.car;
  // hook change to set priceDay
  sel.addEventListener('change', ()=> {
    const c = carsData.find(x=>x.id===sel.value);
    qs('#priceDay').textContent = c ? c.price : 0;
  });
  // init price/day value
  const first = carsData.find(x=>x.id===sel.value) || carsData[0];
  qs('#priceDay').textContent = first.price;
}
function calculatePrice(){
  const sel = qs('#bookCar'); const from = qs('#pickup').value; const to = qs('#return').value;
  if(!from || !to){ alert('Select dates'); return; }
  const d1 = new Date(from); const d2 = new Date(to);
  let diff = Math.ceil((d2 - d1)/(1000*60*60*24));
  if(diff<=0) diff = 1;
  qs('#totalDays').textContent = diff;
  const car = carsData.find(x=>x.id===sel.value);
  const total = diff * (car ? car.price : 0);
  qs('#totalPrice').textContent = total;
}
function submitBooking(e){
  e.preventDefault();
  calculatePrice();
  const name = qs('#bookName').value;
  const car = carsData.find(x=>x.id===qs('#bookCar').value);
  const total = qs('#totalPrice').textContent;
  qs('#confirmText').textContent = `Thank you ${name}. Your booking for ${car.name} is confirmed. Amount: ₹${total}.`;
  qs('#confirmModal').classList.remove('hidden');
}
function closeConfirm(){ qs('#confirmModal').classList.add('hidden'); }

/* ===== CONTACT ===== */
function submitContact(e){
  e.preventDefault();
  alert('Message sent — (mock) we will contact you soon.');
  qs('#cname').value=''; qs('#cemail').value=''; qs('#cmsg').value='';
}

/* ===== INIT for any page ===== */
function initCommon(){
  // set years
  qsa('#year,#year2,#year3,#year4,#year5').forEach(el => { if(el) el.textContent = new Date().getFullYear() });
  // dark mode init
  initDarkMode();
  // home init
  initHome();
  // cars page detection
  if(qs('#carsGrid')) renderCars();
  if(qs('#bookingForm')) initBooking();
  // testimonials already done in initHome
  // wire compare modal close when clicked outside
  window.addEventListener('click', e => { if(e.target.classList.contains('modal')) e.target.classList.add('hidden') });
}
document.addEventListener('DOMContentLoaded', initCommon);
