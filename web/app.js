const tg=window.Telegram?.WebApp;
if(tg){tg.ready();tg.expand();tg.setHeaderColor?.("#09090b");tg.setBackgroundColor?.("#09090b");}
const $=s=>document.querySelector(s);
const toast=t=>{const el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2100);};
function showView(view){$("#helpView").classList.toggle("hidden",view!=="help");$("#profileView").classList.toggle("hidden",view!=="profile");document.querySelectorAll(".welcome,.quick-grid,.section,.notice").forEach(el=>el.classList.toggle("hidden",view!=="home"));document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.view===view));window.scrollTo({top:0,behavior:"smooth"});}
document.addEventListener("click",e=>{const nav=e.target.closest("[data-view]");if(nav)showView(nav.dataset.view);});
const user=tg?.initDataUnsafe?.user;
if(user){const name=user.first_name||"Пользователь";$("#greeting").textContent="Рады видеть, "+name+".";$("#profileName").textContent=[user.first_name,user.last_name].filter(Boolean).join(" ")||name;$("#profileUsername").textContent=user.username?"@"+user.username:"Пользователь Telegram";$("#profileAvatar").textContent=(user.first_name||"S").slice(0,1).toUpperCase();}
$("#profileBtn").onclick=()=>showView("profile");
$("#botHelp").onclick=()=>{if(tg?.openTelegramLink){tg.openTelegramLink("https://t.me/");}else{toast("Открой Telegram и найди бота SmokingRaw через поиск.");}};
$("#copySite").onclick=async()=>{try{await navigator.clipboard.writeText("https://smokingraw.pages.dev");toast("Ссылка скопирована");}catch{toast("Адрес сайта: smokingraw.pages.dev");}};
showView("home");