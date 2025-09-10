// ====== Simple Auth ======
const DEMO_USER = {username:'admin', password:'admin123', role:'owner'};

function isLoggedIn(){
  return !!localStorage.getItem('authUser');
}
function login(u, p){
  if(u===DEMO_USER.username && p===DEMO_USER.password){
    localStorage.setItem('authUser', JSON.stringify({u, role: DEMO_USER.role, time:Date.now()}));
    return true;
  }
  // also allow any user existing in "users"
  const users = JSON.parse(localStorage.getItem('users')||'[]');
  const found = users.find(x=>x.username===u && x.password===p);
  if(found){
    localStorage.setItem('authUser', JSON.stringify({u, role: found.role||'staff', time:Date.now()}));
    return true;
  }
  return false;
}
function logout(){
  localStorage.removeItem('authUser');
  location.reload();
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// Login form
document.getElementById('loginForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const ok = login(fd.get('username'), fd.get('password'));
  if(ok){
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    initDashboard();
  }else{
    alert('Invalid credentials');
  }
});

// Auto-login if already authenticated
if(isLoggedIn()){
  document.getElementById('loginScreen')?.classList.add('hidden');
  document.getElementById('dashboard')?.classList.remove('hidden');
  initDashboard();
}

// ====== Dashboard Screens ======
document.querySelectorAll('.side-link').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const screen = btn.dataset.screen;
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('screen-'+screen).classList.remove('hidden');
  });
});

function initDashboard(){
  // Stats
  const products = JSON.parse(localStorage.getItem('products')||'[]');
  const categories = [...new Set(products.map(p=>p.category))];
  const inquiries = JSON.parse(localStorage.getItem('inquiries')||'[]');
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statCategories').textContent = categories.length;
  document.getElementById('statInquiries').textContent = inquiries.length;
  document.getElementById('statVisitors').textContent = Math.floor(50 + Math.random()*150);

  // Chart
  drawOverviewChart('overviewChart', [12,18,10,22,30,25,28], ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);

  // Tables
  renderProductsTable();
  renderOffersTable();
  renderInquiriesTable();
  renderUsersTable();

  // Add buttons
  document.getElementById('addProductBtn')?.addEventListener('click', ()=>{
    const name = prompt('Product name');
    if(!name) return;
    const price = parseFloat(prompt('Price (e.g., 5.5)')||'0');
    const category = prompt('Category (Laddus/Barfis/Gulab Jamun/Rasgulla/Halwa/Seasonal)')||'Laddus';
    const image = prompt('Image path (e.g., images/laddus.jpg)')||'images/laddus.jpg';
    const items = JSON.parse(localStorage.getItem('products')||'[]');
    const id = items.length? Math.max(...items.map(x=>x.id))+1 : 1;
    items.push({id, name, price, category, image});
    localStorage.setItem('products', JSON.stringify(items));
    renderProductsTable();
  });

  document.getElementById('addOfferBtn')?.addEventListener('click', ()=>{
    const title = prompt('Offer title');
    if(!title) return;
    const description = prompt('Description')||'';
    const tag = prompt('Tag')||'Offer';
    const items = JSON.parse(localStorage.getItem('offers')||'[]');
    const id = items.length? Math.max(...items.map(x=>x.id))+1 : 1;
    items.push({id, title, description, tag});
    localStorage.setItem('offers', JSON.stringify(items));
    renderOffersTable();
  });

  document.getElementById('addUserBtn')?.addEventListener('click', ()=>{
    const username = prompt('Username');
    if(!username) return;
    const password = prompt('Password')||'12345678';
    const role = prompt('Role (owner/staff)')||'staff';
    const users = JSON.parse(localStorage.getItem('users')||'[]');
    users.push({username, password, role});
    localStorage.setItem('users', JSON.stringify(users));
    renderUsersTable();
  });
}

// ====== Render Tables ======
function renderProductsTable(){
  const items = JSON.parse(localStorage.getItem('products')||'[]');
  const el = document.getElementById('productsTable');
  const rows = items.map(p=>`
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>\u20B9${p.price.toFixed(2)}</td>
      <td><span class="badge">${p.category}</span></td>
      <td>${p.image}</td>
      <td>
        <span class="action" data-action="edit" data-id="${p.id}">Edit</span>
        <span class="action" data-action="delete" data-id="${p.id}">Delete</span>
      </td>
    </tr>
  `).join('');
  el.innerHTML = `<table class="table">
    <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Image</th><th>Actions</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">No products</td></tr>'}</tbody>
  </table>`;
  el.querySelectorAll('.action').forEach(a=>{
    a.addEventListener('click', ()=>{
      const id = Number(a.dataset.id);
      const action = a.dataset.action;
      const items = JSON.parse(localStorage.getItem('products')||'[]');
      const idx = items.findIndex(x=>x.id===id);
      if(idx<0) return;
      if(action==='delete'){
        if(confirm('Delete this product?')){
          items.splice(idx,1);
          localStorage.setItem('products', JSON.stringify(items));
          renderProductsTable();
        }
      }else if(action==='edit'){
        const p = items[idx];
        const name = prompt('Name', p.name) || p.name;
        const price = parseFloat(prompt('Price', p.price) || p.price);
        const category = prompt('Category', p.category) || p.category;
        const image = prompt('Image', p.image) || p.image;
        items[idx] = {id:p.id, name, price, category, image};
        localStorage.setItem('products', JSON.stringify(items));
        renderProductsTable();
      }
    });
  });
}

function renderOffersTable(){
  const items = JSON.parse(localStorage.getItem('offers')||'[]');
  const el = document.getElementById('offersTable');
  const rows = items.map(o=>`
    <tr>
      <td>${o.id}</td>
      <td>${o.title}</td>
      <td>${o.description||''}</td>
      <td><span class="badge">${o.tag||'Offer'}</span></td>
      <td>
        <span class="action" data-action="edit" data-id="${o.id}">Edit</span>
        <span class="action" data-action="delete" data-id="${o.id}">Delete</span>
      </td>
    </tr>
  `).join('');
  el.innerHTML = `<table class="table">
    <thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Tag</th><th>Actions</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5">No offers</td></tr>'}</tbody>
  </table>`;
  el.querySelectorAll('.action').forEach(a=>{
    a.addEventListener('click', ()=>{
      const id = Number(a.dataset.id);
      const action = a.dataset.action;
      const items = JSON.parse(localStorage.getItem('offers')||'[]');
      const idx = items.findIndex(x=>x.id===id);
      if(idx<0) return;
      if(action==='delete'){
        if(confirm('Delete this offer?')){
          items.splice(idx,1);
          localStorage.setItem('offers', JSON.stringify(items));
          renderOffersTable();
        }
      }else if(action==='edit'){
        const o = items[idx];
        const title = prompt('Title', o.title) || o.title;
        const description = prompt('Description', o.description||'') || o.description;
        const tag = prompt('Tag', o.tag||'Offer') || o.tag;
        items[idx] = {id:o.id, title, description, tag};
        localStorage.setItem('offers', JSON.stringify(items));
        renderOffersTable();
      }
    });
  });
}

function renderInquiriesTable(){
  const items = JSON.parse(localStorage.getItem('inquiries')||'[]');
  const el = document.getElementById('inquiriesTable');
  const rows = items.map((q,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${q.name||''}</td>
      <td>${q.email||''}</td>
      <td>${q.phone||''}</td>
      <td>${q.message||''}</td>
      <td>${new Date(q.date||Date.now()).toLocaleString()}</td>
      <td><span class="action" data-index="${i}" data-action="delete">Delete</span></td>
    </tr>
  `).join('');
  el.innerHTML = `<table class="table">
    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7">No inquiries yet</td></tr>'}</tbody>
  </table>`;
  el.querySelectorAll('.action').forEach(a=>{
    a.addEventListener('click', ()=>{
      if(a.dataset.action==='delete'){
        const items = JSON.parse(localStorage.getItem('inquiries')||'[]');
        items.splice(Number(a.dataset.index),1);
        localStorage.setItem('inquiries', JSON.stringify(items));
        renderInquiriesTable();
      }
    });
  });
}

function renderUsersTable(){
  const users = JSON.parse(localStorage.getItem('users')||'[]');
  const el = document.getElementById('usersTable');
  const rows = users.map((u,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${u.username}</td>
      <td>${u.role||'staff'}</td>
      <td><span class="action" data-index="${i}" data-action="delete">Delete</span></td>
    </tr>
  `).join('');
  el.innerHTML = `<table class="table">
    <thead><tr><th>#</th><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="4">No users</td></tr>'}</tbody>
  </table>`;
  el.querySelectorAll('.action').forEach(a=>{
    a.addEventListener('click', ()=>{
      const idx = Number(a.dataset.index);
      const users = JSON.parse(localStorage.getItem('users')||'[]');
      users.splice(idx,1);
      localStorage.setItem('users', JSON.stringify(users));
      renderUsersTable();
    });
  });
}

// ====== Simple Canvas Chart (no external libs) ======
function drawOverviewChart(canvasId, values, labels){
  const c = document.getElementById(canvasId);
  if(!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0,0,W,H);
  // axes
  ctx.strokeStyle = '#8a613f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40,10);
  ctx.lineTo(40,H-30);
  ctx.lineTo(W-10,H-30);
  ctx.stroke();
  // bars
  const max = Math.max(...values, 1);
  const bw = (W-70)/values.length;
  values.forEach((v,i)=>{
    const h = (H-60)*(v/max);
    const x = 45 + i*bw + 8;
    const y = H-30 - h;
    ctx.fillStyle = '#f6c453';
    ctx.fillRect(x, y, bw-16, h);
    ctx.fillStyle = '#5e2a00';
    ctx.font = '12px sans-serif';
    ctx.fillText(labels[i], x, H-12);
  });
}
