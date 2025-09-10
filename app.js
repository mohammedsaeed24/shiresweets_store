// Mobile menu toggle
document.getElementById('mobileMenuBtn')?.addEventListener('click', ()=>{
  document.getElementById('mobileMenu')?.classList.toggle('hidden');
});

// Set year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Seed sample products/offers if empty
const defaultProducts = [
  {id:1, name:'Besan Laddu', price:5.0, category:'Laddus', image:'images/laddus.jpg'},
  {id:2, name:'Kaju Barfi', price:8.0, category:'Barfis', image:'images/barfis.jpg'},
  {id:3, name:'Gulab Jamun (4 pcs)', price:4.5, category:'Gulab Jamun', image:'images/gulab.jpg'},
  {id:4, name:'Rasgulla (4 pcs)', price:4.5, category:'Rasgulla', image:'images/rasgulla.jpg'},
  {id:5, name:'Carrot Halwa', price:6.0, category:'Halwa', image:'images/halwa.jpg'},
  {id:6, name:'Mango Kulfi', price:3.5, category:'Seasonal', image:'images/seasonal.jpg'},
];
const defaultOffers = [
  {id:1, title:'Festive Pack – 10% off', description:'Assorted box of 12 sweets', tag:'Limited'},
  {id:2, title:'Buy 2 Get 1 Free', description:'On Gulab Jamun & Rasgulla', tag:'Today'}
];

if(!localStorage.getItem('products')){
  localStorage.setItem('products', JSON.stringify(defaultProducts));
}
if(!localStorage.getItem('offers')){
  localStorage.setItem('offers', JSON.stringify(defaultOffers));
}

// Render products
const productGrid = document.getElementById('productGrid');
function renderProducts(filter='All'){
  const items = JSON.parse(localStorage.getItem('products')||'[]');
  productGrid.innerHTML = '';
  items.filter(p=> filter==='All' || p.category===filter).forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="w-full h-44 object-cover rounded-xl" src="${p.image}" alt="${p.name}"/>
      <div class="p-2">
        <h3 class="font-bold text-brown text-lg">${p.name}</h3>
        <p class="text-brown/70 mt-1">${p.category}</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="font-semibold text-brown">\u20B9${p.price.toFixed(2)}</span>
          <button class="btn-primary add-inquiry" data-id="${p.id}">Add to Inquiry</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}
renderProducts();

// Filter chips
document.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    renderProducts(chip.dataset.filter);
  });
});

// Add to inquiry (stores in localStorage)
function addToInquiry(id){
  const items = JSON.parse(localStorage.getItem('products')||'[]');
  const found = items.find(x=>x.id == id);
  if(!found) return;
  const bag = JSON.parse(localStorage.getItem('inquiryBag')||'[]');
  bag.push({id:found.id, name:found.name, price:found.price, qty:1});
  localStorage.setItem('inquiryBag', JSON.stringify(bag));
  alert('Added to inquiry! We will contact you soon.');
}
productGrid.addEventListener('click', (e)=>{
  const target = e.target.closest('.add-inquiry');
  if(target){ addToInquiry(target.dataset.id); }
});

// Contact form -> save to localStorage "inquiries"
document.getElementById('contactForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const inquiry = Object.fromEntries(fd.entries());
  inquiry.date = new Date().toISOString();
  const all = JSON.parse(localStorage.getItem('inquiries')||'[]');
  all.push(inquiry);
  localStorage.setItem('inquiries', JSON.stringify(all));
  e.target.reset();
  alert('Thank you! Your inquiry has been received.');
});

// Render offers
const offersGrid = document.getElementById('offersGrid');
function renderOffers(){
  const offers = JSON.parse(localStorage.getItem('offers')||'[]');
  offersGrid.innerHTML = '';
  offers.forEach(o=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="p-2">
        <span class="inline-block text-xs px-2 py-1 rounded-full bg-gold/30 text-brown font-semibold">${o.tag||'Offer'}</span>
        <h3 class="font-bold text-brown text-xl mt-2">${o.title}</h3>
        <p class="text-brown/80 mt-1">${o.description||''}</p>
      </div>
    `;
    offersGrid.appendChild(card);
  });
}
renderOffers();
