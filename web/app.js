const tg=window.Telegram?.WebApp; if(tg){tg.ready();tg.expand();}
let products=[
{id:1,name:"Городской рюкзак",desc:"Практичный аксессуар на каждый день",price:2490,cat:"Аксессуары",symbol:"▧"},
{id:2,name:"Футболка Basic",desc:"Минималистичный повседневный стиль",price:1290,cat:"Одежда",symbol:"♧"},
{id:3,name:"Настольный светильник",desc:"Лаконичный предмет для интерьера",price:3190,cat:"Для дома",symbol:"◉"},
{id:4,name:"Кардхолдер",desc:"Компактный аксессуар для карт",price:990,cat:"Аксессуары",symbol:"▤"},
{id:5,name:"Кепка Mono",desc:"Базовая кепка с лаконичным дизайном",price:1490,cat:"Одежда",symbol:"⌒"},
{id:6,name:"Органайзер",desc:"Помогает поддерживать порядок",price:1790,cat:"Для дома",symbol:"▦"}
];
async function loadProducts(){
 try{
  const r=await fetch('/api/products');
  if(!r.ok) throw new Error('API unavailable');
  const data=await r.json();
  if(Array.isArray(data.products)&&data.products.length) products=data.products;
 }catch(e){console.info('Используется демонстрационный каталог:',e.message);}
}
const categories=["Все","Аксессуары","Одежда","Для дома","Другое"];
let category="Все",tab="catalog",favorites=JSON.parse(localStorage.getItem("sr_favs")||"[]"),cart=JSON.parse(localStorage.getItem("sr_cart")||"{}");
const escapeAttr=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=s=>document.querySelector(s), money=n=>new Intl.NumberFormat("ru-RU").format(n)+" ₽";
function save(){localStorage.setItem("sr_favs",JSON.stringify(favorites));localStorage.setItem("sr_cart",JSON.stringify(cart));}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800);}
function renderCats(){$("#categories").innerHTML=categories.map(c=>`<button class="chip ${c===category?"active":""}" data-cat="${c}">${c}</button>`).join("");}
function render(){
 renderCats();let q=$("#search").value.trim().toLowerCase();
 let list=products.filter(p=>(category==="Все"||p.cat===category)&&(tab!=="favorites"||favorites.includes(p.id))&&(`${p.name} ${p.desc} ${p.cat}`.toLowerCase().includes(q)));
 $("#count").textContent=list.length+" товара";$("#favCount").textContent=favorites.length||"";$("#cartCount").textContent=Object.values(cart).reduce((a,b)=>a+b,0)||"";
 $("#products").innerHTML=list.length?list.map(p=>`<article class="product"><div class="product-art">${p.image_url?`<img class="product-photo" src="${escapeAttr(p.image_url)}" alt="${escapeAttr(p.name)}" loading="lazy">`:`<span class="symbol">${p.symbol||"◇"}</span>`}<button class="heart ${favorites.includes(p.id)?"on":""}" data-fav="${p.id}">${favorites.includes(p.id)?"♥":"♡"}</button></div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add" data-add="${p.id}">+</button></div></div></article>`).join(""):`<div class="empty">Здесь пока ничего нет</div>`;
 document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.tab===tab));
}
function openDrawer(title,html){$("#drawerTitle").textContent=title;$("#drawerContent").innerHTML=html;$("#drawer").classList.add("show");$("#overlay").classList.add("show");}
function closeDrawer(){$("#drawer").classList.remove("show");$("#overlay").classList.remove("show");}
function cartRows(){let rows=products.filter(p=>cart[p.id]);return rows.map(p=>`<div class="cart-row"><div class="mini-art">${p.symbol}</div><div class="details"><b>${p.name}</b><small>${money(p.price)} · ${money(p.price*cart[p.id])}</small></div><div class="qty"><button data-dec="${p.id}">−</button>${cart[p.id]}<button data-inc="${p.id}">+</button></div></div>`).join("");}
function showCart(){let total=products.reduce((s,p)=>s+p.price*(cart[p.id]||0),0),count=Object.values(cart).reduce((a,b)=>a+b,0);openDrawer("Корзина",count?`${cartRows()}<div class="total"><span>Итого</span><span>${money(total)}</span></div><button class="action" id="shareCart">Поделиться списком</button><button class="action secondary" id="saveImage">Сохранить PNG-картинку</button>`:`<div class="empty">Корзина пока пуста</div>`);}
function shareText(){let lines=products.filter(p=>cart[p.id]).map(p=>`${p.name} × ${cart[p.id]} — ${money(p.price*cart[p.id])}`);let total=products.reduce((s,p)=>s+p.price*(cart[p.id]||0),0);return "Мой список из SmokingRaw:\n"+lines.join("\n")+"\nИтого: "+money(total);}
function shareCart(){let text=shareText();if(tg?.switchInlineQuery){tg.switchInlineQuery(text,[]);}else if(navigator.share){navigator.share({title:"Список SmokingRaw",text}).catch(()=>{});}else{navigator.clipboard?.writeText(text);toast("Список скопирован");}}
function saveCartImage(){
 const rows=products.filter(p=>cart[p.id]);if(!rows.length)return;
 const total=rows.reduce((s,p)=>s+p.price*cart[p.id],0),canvas=document.createElement("canvas");canvas.width=900;canvas.height=300+rows.length*100;
 const c=canvas.getContext("2d");c.fillStyle="#0b0b0d";c.fillRect(0,0,900,canvas.height);c.fillStyle="#e33b43";c.fillRect(54,52,7,54);c.fillStyle="#fff";c.font="800 36px Arial";c.fillText("SMOKINGRAW",82,90);c.fillStyle="#999";c.font="18px Arial";c.fillText("СПИСОК ТОВАРОВ",82,126);
 let y=210;c.font="24px Arial";rows.forEach(p=>{c.fillStyle="#f4f4f5";c.fillText(p.name+" × "+cart[p.id],58,y);c.fillStyle="#e33b43";c.textAlign="right";c.fillText(money(p.price*cart[p.id]),840,y);c.textAlign="left";c.strokeStyle="#29292e";c.beginPath();c.moveTo(58,y+25);c.lineTo(842,y+25);c.stroke();y+=100;});
 c.fillStyle="#aaa";c.font="20px Arial";c.fillText("ИТОГО",58,y+15);c.fillStyle="#fff";c.font="800 28px Arial";c.textAlign="right";c.fillText(money(total),840,y+15);
 const a=document.createElement("a");a.download="SmokingRaw-list.png";a.href=canvas.toDataURL("image/png");a.click();toast("Картинка сохранена");
}
$("#categories").addEventListener("click",e=>{let b=e.target.closest("[data-cat]");if(b){category=b.dataset.cat;render();}});
$("#products").addEventListener("click",e=>{let f=e.target.closest("[data-fav]"),a=e.target.closest("[data-add]");if(f){let id=+f.dataset.fav;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();render();}if(a){let id=+a.dataset.add;cart[id]=(cart[id]||0)+1;save();render();toast("Добавлено в корзину");}});
$("#search").addEventListener("input",render);
document.querySelector(".bottom-nav").addEventListener("click",e=>{let b=e.target.closest("[data-tab]");if(!b)return;tab=b.dataset.tab;category="Все";render();if(tab==="cart")showCart();});
$("#closeDrawer").onclick=closeDrawer;$("#overlay").onclick=closeDrawer;
$("#drawerContent").addEventListener("click",e=>{let inc=e.target.closest("[data-inc]"),dec=e.target.closest("[data-dec]");if(inc){let id=inc.dataset.inc;cart[id]=(cart[id]||0)+1;save();showCart();render();}if(dec){let id=dec.dataset.dec;cart[id]--;if(cart[id]<=0)delete cart[id];save();showCart();render();}if(e.target.id==="shareCart")shareCart();if(e.target.id==="saveImage")saveCartImage();});
$("#profileBtn").onclick=()=>{let u=tg?.initDataUnsafe?.user;openDrawer("Профиль",`<div class="empty">${u?`<b>${u.first_name||"Пользователь"}</b><br>@${u.username||"username не указан"}`:"Откройте каталог внутри Telegram, чтобы отобразить данные профиля."}<br><br><span class="muted">Профиль пока работает в режиме просмотра.</span></div>`);};
render();
loadProducts().then(render);
async function loadOwnerContact(){
 try{
  const r=await fetch('/api/settings'); if(!r.ok)return;
  const s=await r.json(); const name=String(s.owner_contact||"").replace(/^@/,"");
  if(name){const f=document.querySelector(".site-footer");if(f)f.innerHTML=`<a href="https://t.me/${encodeURIComponent(name)}" target="_blank" rel="noopener">Связаться с владельцем · @${escapeAttr(name)}</a><br><a href="admin.html">Управление каталогом</a>`;}
 }catch(e){console.info("Контакт владельца пока не настроен");}
}
loadOwnerContact();
