import { useState, useMemo, useRef, useEffect, useCallback, createContext, useContext } from "react";

const VERSION = "5.3";

/* ─── DATA ────────────────────────────────────────────────────── */
const KATEGORIEN = [
  { id:"all",       label:"Alle",        emoji:"🗂️" },
  { id:"getraenke", label:"Getränke",    emoji:"🧃" },
  { id:"konserven", label:"Konserven",   emoji:"🥫" },
  { id:"trocken",   label:"Trockenware", emoji:"🌾" },
  { id:"snacks",    label:"Snacks",      emoji:"🍫" },
  { id:"gewuerze",  label:"Gewürze",     emoji:"🧂" },
  { id:"kuehlung",  label:"Kühlung",     emoji:"🧊" },
  { id:"sonstiges", label:"Sonstiges",   emoji:"📦" },
];
const EINHEITEN  = ["Stück","Liter","kg","g","Packung","Dose","Flasche","Beutel"];
const LAGERORTE  = [
  { id:"",         label:"Kein Ort",  emoji:"📦" },
  { id:"kuehlbox", label:"Kühlbox",   emoji:"🧊" },
  { id:"salon",    label:"Salon",     emoji:"🛋️" },
  { id:"cockpit",  label:"Cockpit",   emoji:"⛵" },
  { id:"bilge",    label:"Bilge",     emoji:"🔧" },
  { id:"backbord", label:"Backbord",  emoji:"🔴" },
  { id:"steuerbord",label:"Steuerbord",emoji:"🟢"},
];
const VIEWS     = ["inventar","einkaufen","mahlzeiten","stauraum","statistik","planung"];
const STARTER   = [
  { id:1, name:"Mineralwasser", kategorie:"getraenke", menge:21, einheit:"Liter",   notiz:"Still",             ablaufdatum:"", mindestbestand:6,   gewicht:1000,tagesbedarf:3,   einkaufen:false, lagerort:"bilge",    preis:0, kaufort:"" },
  { id:2, name:"Thunfisch",     kategorie:"konserven", menge:6,  einheit:"Dose",    notiz:"",                  ablaufdatum:"", mindestbestand:4,   gewicht:185, tagesbedarf:0,   einkaufen:false, lagerort:"salon",    preis:1.5,kaufort:"" },
  { id:3, name:"Nudeln",        kategorie:"trocken",   menge:2,  einheit:"kg",      notiz:"Penne & Spaghetti", ablaufdatum:"", mindestbestand:1,   gewicht:1000,tagesbedarf:0,   einkaufen:false, lagerort:"salon",    preis:1.2,kaufort:"" },
  { id:4, name:"Müsliriegel",   kategorie:"snacks",    menge:20, einheit:"Stück",   notiz:"",                  ablaufdatum:"", mindestbestand:10,  gewicht:35,  tagesbedarf:1,   einkaufen:false, lagerort:"cockpit",  preis:0.8,kaufort:"" },
  { id:5, name:"Meersalz",      kategorie:"gewuerze",  menge:1,  einheit:"Packung", notiz:"",                  ablaufdatum:"", mindestbestand:1,   gewicht:500, tagesbedarf:0,   einkaufen:false, lagerort:"salon",    preis:0.9,kaufort:"" },
  { id:6, name:"Käse",          kategorie:"kuehlung",  menge:500,einheit:"g",       notiz:"Gouda",             ablaufdatum:"", mindestbestand:200, gewicht:1,   tagesbedarf:0,   einkaufen:false, lagerort:"kuehlbox", preis:3.5,kaufort:"" },
];
const STARTER_RECIPES = [
  { id:1, name:"Pasta Bolognese", portionen:4, zutaten:[{name:"Nudeln",menge:500,einheit:"g"},{name:"Tomaten",menge:1,einheit:"Dose"},{name:"Olivenöl",menge:1,einheit:"Stück"}] },
  { id:2, name:"Thunfisch-Reis",  portionen:2, zutaten:[{name:"Reis",menge:200,einheit:"g"},{name:"Thunfisch",menge:2,einheit:"Dose"}] },
];

/* ─── I18N ────────────────────────────────────────────────────── */
const I18N = {
  de: {
    inventar:"Inventar", einkaufen:"Einkaufen", mahlzeiten:"Mahlzeiten", stauraum:"Stauraum", statistik:"Statistik", planung:"Planung",
    add:"+ Hinzufügen", save:"Speichern", cancel:"Abbrechen", edit:"Bearbeiten", delete:"Löschen",
    search:"Suchen...", noItems:"Keine Artikel gefunden.", loading:"Wird geladen…",
    name:"Name", menge:"Menge", einheit:"Einheit", kategorie:"Kategorie", notiz:"Notiz (optional)",
    ablaufdatum:"Ablaufdatum", mindestbestand:"Mindestbestand", gewicht:"Gewicht (g/Stück)", tagesbedarf:"Tagesbedarf/Person",
    exportBackup:"Export & Backup", exportCSV:"Als CSV exportieren", exportTXT:"Packliste (.txt)",
    exportEinkauf:"Einkaufsliste (.txt)", saveBackup:"Backup speichern", loadBackup:"Backup wiederherstellen",
    deleteAll:"Alle Daten löschen", deleteConfirm:"Wirklich alle Daten löschen?",
    settings:"Einstellungen", theme:"Design", lang:"Sprache", notifications:"Benachrichtigungen",
    notifEnable:"Benachrichtigungen aktivieren", notifEnabled:"Aktiviert ✓", notifInfo:"Warnmeldung bei Ablaufdatum",
    recipes:"Rezepte", addRecipe:"Rezept hinzufügen", cookNow:"Jetzt kochen",
    portions:"Portionen", ingredients:"Zutaten", addIngredient:"+ Zutat hinzufügen",
    cookConfirm:"Zutaten vom Inventar abziehen?", notEnough:"Nicht genug Zutaten vorhanden",
    consumed:"Verbraucht", history:"Verbrauchshistorie", noHistory:"Noch nichts verbraucht.",
    statsTitle:"Auswertung", totalWeight:"Gesamtgewicht", byCategory:"Nach Kategorie", topItems:"Top Artikel",
    crewShare:"Crew teilen", qrInfo:"Einkaufsliste als QR-Code für die Crew",
    photo:"Foto", addPhoto:"Foto hinzufügen", removePhoto:"Foto entfernen",
    tage:"Tage", personen:"Personen", needed:"Bedarf", available:"Vorhanden",
    bought:"Gekauft ✓", lowStock:"Unter Mindestbestand", expiringSoon:"Bald ablaufend", expired:"Abgelaufen",
    allCategories:"Alle", deviceStorage:"Gerät", extendedFields:"Erweiterte Felder",
    goodTrip:"Gute Reise", version:"Version",
  },
  en: {
    inventar:"Inventory", einkaufen:"Shopping", mahlzeiten:"Meals", stauraum:"Storage", statistik:"Statistics", planung:"Planning",
    add:"+ Add", save:"Save", cancel:"Cancel", edit:"Edit", delete:"Delete",
    search:"Search...", noItems:"No items found.", loading:"Loading…",
    name:"Name", menge:"Quantity", einheit:"Unit", kategorie:"Category", notiz:"Note (optional)",
    ablaufdatum:"Expiry date", mindestbestand:"Min. stock", gewicht:"Weight (g/unit)", tagesbedarf:"Daily need/person",
    exportBackup:"Export & Backup", exportCSV:"Export as CSV", exportTXT:"Packing list (.txt)",
    exportEinkauf:"Shopping list (.txt)", saveBackup:"Save backup", loadBackup:"Restore backup",
    deleteAll:"Delete all data", deleteConfirm:"Really delete all data?",
    settings:"Settings", theme:"Theme", lang:"Language", notifications:"Notifications",
    notifEnable:"Enable notifications", notifEnabled:"Enabled ✓", notifInfo:"Alert when items expire",
    recipes:"Recipes", addRecipe:"Add recipe", cookNow:"Cook now",
    portions:"Portions", ingredients:"Ingredients", addIngredient:"+ Add ingredient",
    cookConfirm:"Deduct ingredients from inventory?", notEnough:"Not enough ingredients",
    consumed:"Consumed", history:"Consumption history", noHistory:"Nothing consumed yet.",
    statsTitle:"Statistics", totalWeight:"Total weight", byCategory:"By category", topItems:"Top items",
    crewShare:"Share with crew", qrInfo:"Shopping list as QR code for the crew",
    photo:"Photo", addPhoto:"Add photo", removePhoto:"Remove photo",
    tage:"Days", personen:"Persons", needed:"Needed", available:"Available",
    bought:"Bought ✓", lowStock:"Low stock", expiringSoon:"Expiring soon", expired:"Expired",
    allCategories:"All", deviceStorage:"Device", extendedFields:"Extended fields",
    goodTrip:"Bon Voyage", version:"Version",
  },
  es: {
    inventar:"Inventario", einkaufen:"Compras", mahlzeiten:"Comidas", stauraum:"Almacén", statistik:"Estadísticas", planung:"Planificación",
    add:"+ Añadir", save:"Guardar", cancel:"Cancelar", edit:"Editar", delete:"Eliminar",
    search:"Buscar...", noItems:"No se encontraron artículos.", loading:"Cargando…",
    name:"Nombre", menge:"Cantidad", einheit:"Unidad", kategorie:"Categoría", notiz:"Nota (opcional)",
    ablaufdatum:"Fecha de caducidad", mindestbestand:"Stock mínimo", gewicht:"Peso (g/ud)", tagesbedarf:"Necesidad diaria/persona",
    exportBackup:"Exportar & Copia", exportCSV:"Exportar como CSV", exportTXT:"Lista de carga (.txt)",
    exportEinkauf:"Lista de compras (.txt)", saveBackup:"Guardar copia", loadBackup:"Restaurar copia",
    deleteAll:"Borrar todos los datos", deleteConfirm:"¿Borrar todos los datos?",
    settings:"Ajustes", theme:"Tema", lang:"Idioma", notifications:"Notificaciones",
    notifEnable:"Activar notificaciones", notifEnabled:"Activado ✓", notifInfo:"Alerta de caducidad",
    recipes:"Recetas", addRecipe:"Añadir receta", cookNow:"Cocinar ahora",
    portions:"Porciones", ingredients:"Ingredientes", addIngredient:"+ Añadir ingrediente",
    cookConfirm:"¿Descontar ingredientes del inventario?", notEnough:"No hay suficientes ingredientes",
    consumed:"Consumido", history:"Historial de consumo", noHistory:"Nada consumido aún.",
    statsTitle:"Estadísticas", totalWeight:"Peso total", byCategory:"Por categoría", topItems:"Top artículos",
    crewShare:"Compartir tripulación", qrInfo:"Lista de compras como código QR",
    photo:"Foto", addPhoto:"Añadir foto", removePhoto:"Quitar foto",
    tage:"Días", personen:"Personas", needed:"Necesario", available:"Disponible",
    bought:"Comprado ✓", lowStock:"Stock bajo", expiringSoon:"Caduca pronto", expired:"Caducado",
    allCategories:"Todo", deviceStorage:"Dispositivo", extendedFields:"Campos adicionales",
    goodTrip:"Buen viaje", version:"Versión",
  },
};

/* ─── THEMES ──────────────────────────────────────────────────── */
const THEMES = {
  dark: {
    bg0:"#08111f", bg1:"#0d2040", bg2:"#0f2d55", card:"rgba(255,255,255,0.04)",
    gold:"#c9a84c", goldL:"#f0c96e", text:"#e8dcc8", muted:"#7a9ab0",
    border:"rgba(201,168,76,0.18)", borderHi:"rgba(201,168,76,0.45)",
    green:"#3d9e52", red:"#c94c4c", orange:"#d4832a",
    inputBg:"rgba(255,255,255,0.07)", navBg:"rgba(8,17,31,0.97)",
    gradient:"linear-gradient(150deg,#08111f 0%,#0d2040 50%,#0f2d55 100%)",
    sidebarBorder:"rgba(201,168,76,0.18)", modalBg:"linear-gradient(160deg,#0d2040,#103358)",
  },
  light: {
    bg0:"#eef4fb", bg1:"#dce8f5", bg2:"#ccdaec", card:"rgba(255,255,255,0.7)",
    gold:"#8b6914", goldL:"#a07820", text:"#0a1828", muted:"#4a6888",
    border:"rgba(139,105,20,0.22)", borderHi:"rgba(139,105,20,0.45)",
    green:"#2d7a3f", red:"#b03030", orange:"#b86020",
    inputBg:"rgba(255,255,255,0.6)", navBg:"rgba(220,232,245,0.97)",
    gradient:"linear-gradient(150deg,#eef4fb 0%,#dce8f5 50%,#ccdaec 100%)",
    sidebarBorder:"rgba(139,105,20,0.18)", modalBg:"linear-gradient(160deg,#dce8f5,#ccdaec)",
  },
};

/* ─── LOCALSTORAGE ────────────────────────────────────────────── */
const LS = { ITEMS:"p4_items", REISE:"p4_reise", NEXTID:"p4_nextid", TAGE:"p4_tage", PERSONEN:"p4_personen",
             RECIPES:"p4_recipes", RECIPEID:"p4_recipeid", HISTORY:"p4_history",
             PHOTOS:"p4_photos", THEME:"p4_theme", LANG:"p4_lang", FISCHE:"p4_fische" };
const lsLoad = (k,fb)=>{ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):fb; }catch{ return fb; } };
const lsSave = (k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

/* ─── HOOKS ───────────────────────────────────────────────────── */
function useBreakpoint(){ const[m,set]=useState(window.innerWidth<768); useEffect(()=>{ const h=()=>set(window.innerWidth<768); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]); return m; }

/* ─── CATEGORY / ICON HELPERS ─────────────────────────────────── */
const KAT_KW = {
  getraenke:["wasser","saft","bier","wein","cola","limo","tee","kaffee","drink","sprudel","juice","milch"],
  konserven:["dose","konserv","thunfisch","sardine","tomaten","erbsen","mais","bohnen","linsen","suppe"],
  trocken:["nudel","pasta","reis","mehl","zucker","müsli","haferflocken","zwieback","couscous"],
  snacks:["schokolade","chips","riegel","keks","nuss","mandel","snack","cracker","popcorn"],
  gewuerze:["salz","pfeffer","öl","olivenöl","essig","gewürz","sauce","senf","ketchup","curry","honig"],
  kuehlung:["käse","joghurt","butter","wurst","schinken","ei","speck","quark","sahne","lachs"],
};
const guessKat = n=>{ const l=n.toLowerCase(); for(const[k,ws]of Object.entries(KAT_KW)){ if(ws.some(w=>l.includes(w))) return k; } return "sonstiges"; };
const LITER_WORDS  = ["wasser","saft","juice","milch","bier","wein","limonade","cola","tee","kaffee","brühe","bouillon","öl","olivenöl","essig","sirup","schnaps","rum","vodka","gin","whisky"];
const DOSE_WORDS   = ["thunfisch","sardine","tomaten","mais","bohnen","erbsen","linsen","suppe","ravioli"];
const KG_WORDS     = ["mehl","reis","zucker","nudel","pasta","couscous","haferflocken","linsen","salz"];
const G_WORDS      = ["käse","butter","hackfleisch","lachs","speck","wurst"];
function guessEinheit(name) {
  const n = name.toLowerCase();
  if (LITER_WORDS.some(w=>n.includes(w))) return "Liter";
  if (DOSE_WORDS.some(w=>n.includes(w)))  return "Dose";
  if (KG_WORDS.some(w=>n.includes(w)))    return "kg";
  if (G_WORDS.some(w=>n.includes(w)))     return "g";
  return "Stück";
}
// Auto-weight per unit (in grams)
function guessGewicht(name, einheit) {
  const n = name.toLowerCase();
  if (einheit === "Liter") return 1000;          // 1 Liter = 1 kg
  if (einheit === "kg")    return 1000;          // 1 kg = 1000 g
  if (einheit === "g")     return 1;             // already in grams
  if (einheit === "Dose") {
    if (n.includes("thunfisch")||n.includes("tuna")) return 185;
    if (n.includes("tomaten")||n.includes("passata")) return 400;
    if (n.includes("mais")||n.includes("erbsen")||n.includes("bohnen")) return 340;
    return 400; // average can
  }
  if (einheit === "Flasche") {
    if (LITER_WORDS.some(w=>n.includes(w))) return 1000; // 1L bottle
    return 500;
  }
  if (einheit === "Packung") return 500;
  return 0;
}
const PI = [
  {w:["bier","lager","pils","weizen","ale","ipa"],e:"🍺"},{w:["wein","rotwein","weisswein","rosé","sekt","prosecco"],e:"🍷"},
  {w:["wasser","mineralwasser","sprudel"],e:"💧"},{w:["cola","pepsi","fanta","sprite","limonade"],e:"🥤"},
  {w:["saft","juice","orangensaft","apfelsaft"],e:"🧃"},{w:["kaffee","coffee","espresso","cappuccino"],e:"☕"},
  {w:["tee","tea","grüntee","kamille"],e:"🍵"},{w:["milch","hafermilch","mandelmilch"],e:"🥛"},
  {w:["rum","whisky","vodka","gin","schnaps","tequila"],e:"🥃"},{w:["thunfisch","tuna"],e:"🐟"},
  {w:["sardine","sardellen","makrele","hering"],e:"🐠"},{w:["lachs","salmon"],e:"🐟"},
  {w:["tomaten","tomatensauce","passata"],e:"🍅"},{w:["bohnen","kidney"],e:"🫘"},
  {w:["kichererbsen","linsen","erbsen"],e:"🫛"},{w:["mais","corn"],e:"🌽"},
  {w:["suppe","eintopf","bouillon","brühe"],e:"🍲"},{w:["nudel","pasta","spaghetti","penne","fusilli"],e:"🍝"},
  {w:["reis","risotto","basmati"],e:"🍚"},{w:["müsli","granola","cornflakes","haferflocken"],e:"🥣"},
  {w:["brot","toast","knäckebrot","zwieback"],e:"🍞"},{w:["couscous","bulgur","quinoa"],e:"🌾"},
  {w:["mehl","backpulver"],e:"🌾"},{w:["schokolade","schoki","kakao","nutella"],e:"🍫"},
  {w:["chips","crisps"],e:"🍟"},{w:["riegel","müsliriegel","proteinriegel"],e:"🍫"},
  {w:["keks","cookie","waffel"],e:"🍪"},{w:["nuss","erdnuss","mandel","cashew","walnuss"],e:"🥜"},
  {w:["popcorn"],e:"🍿"},{w:["gummibär","haribo","bonbon","weingummi"],e:"🍬"},
  {w:["cracker","salzstange","brezel"],e:"🥨"},{w:["salz","meersalz"],e:"🧂"},
  {w:["pfeffer","chili","paprikapulver","cayenne","tabasco"],e:"🌶️"},{w:["curry","kurkuma","oregano","basilikum","thymian","rosmarin"],e:"🌿"},
  {w:["olivenöl","sonnenblumenöl","rapsöl","öl"],e:"🫙"},{w:["essig","balsamico"],e:"🫙"},
  {w:["senf","mayo","mayonnaise"],e:"🫙"},{w:["ketchup","bbq"],e:"🍅"},
  {w:["sojasauce","teriyaki"],e:"🫙"},{w:["honig","sirup","ahornsirup"],e:"🍯"},
  {w:["zucker","puderzucker"],e:"🍬"},{w:["knoblauch","garlic"],e:"🧄"},{w:["zwiebel"],e:"🧅"},
  {w:["ingwer","vanille","zimt"],e:"🌿"},{w:["käse","gouda","emmental","parmesan","brie","mozzarella"],e:"🧀"},
  {w:["butter","margarine"],e:"🧈"},{w:["joghurt","quark","skyr"],e:"🥛"},{w:["ei","eier"],e:"🥚"},
  {w:["wurst","salami","pepperoni","bratwurst"],e:"🌭"},{w:["schinken","speck","bacon"],e:"🥩"},
  {w:["hühnchen","hähnchen","chicken"],e:"🍗"},{w:["rind","beef","steak","hackfleisch"],e:"🥩"},
  {w:["fisch","forelle","zander"],e:"🐟"},{w:["sahne","crème fraîche"],e:"🥛"},
  {w:["apfel"],e:"🍎"},{w:["banane"],e:"🍌"},{w:["orange","mandarine"],e:"🍊"},{w:["zitrone","limette"],e:"🍋"},
  {w:["tomate","gurke","karotte","salat"],e:"🥗"},{w:["kartoffel"],e:"🥔"},
  {w:["gas","gaskartusche"],e:"🔥"},{w:["seife","shampoo","duschgel"],e:"🧴"},
  {w:["tablette","medizin","ibuprofen","aspirin"],e:"💊"},{w:["pflaster","verband"],e:"🩹"},
  {w:["toilettenpapier","klopapier"],e:"🧻"},{w:["kerze","teelicht"],e:"🕯️"},{w:["batterie"],e:"🔋"},
];
const productIcon = (name,katId)=>{ const n=name.toLowerCase(); for(const{w,e}of PI){ if(w.some(x=>n.includes(x))) return e; } return KATEGORIEN.find(k=>k.id===katId)?.emoji||"📦"; };
const katOf = id => KATEGORIEN.find(k=>k.id===id)||KATEGORIEN[KATEGORIEN.length-1];

/* ─── PARSERS ─────────────────────────────────────────────────── */
const parseQuick = text => {
  const parts=text.trim().split(/\s+/); let name="",menge=1,einheit="Stück";
  const us=new Set(EINHEITEN.map(e=>e.toLowerCase()));
  if(parts.length>=3&&!isNaN(parts[parts.length-2])&&us.has(parts[parts.length-1].toLowerCase())){
    menge=parseFloat(parts[parts.length-2]); einheit=EINHEITEN.find(e=>e.toLowerCase()===parts[parts.length-1].toLowerCase())||"Stück"; name=parts.slice(0,-2).join(" ");
  } else if(parts.length>=2&&!isNaN(parts[parts.length-1])){ menge=parseFloat(parts[parts.length-1]); name=parts.slice(0,-1).join(" ");
  } else if(parts.length>=2&&us.has(parts[parts.length-1].toLowerCase())){ einheit=EINHEITEN.find(e=>e.toLowerCase()===parts[parts.length-1].toLowerCase())||"Stück"; name=parts.slice(0,-1).join(" ");
  } else name=parts.join(" ");
  const finalName=name||text.trim(); const finalEinheit=einheit==="Stück"?guessEinheit(finalName):einheit; const autoGewicht=guessGewicht(finalName,finalEinheit);
  return { name:finalName, menge, einheit:finalEinheit, kategorie:guessKat(finalName), notiz:"", ablaufdatum:"", mindestbestand:0, gewicht:autoGewicht, tagesbedarf:0, einkaufen:false };
};
const lookupBarcode = async code => {
  const res=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_de,categories_tags`);
  const data=await res.json(); if(data.status!==1||!data.product) return null;
  const p=data.product; const rawName=p.product_name_de||p.product_name||"";
  const cats=(p.categories_tags||[]).join(" ").toLowerCase();
  let kat="sonstiges";
  if(cats.includes("beverages")||cats.includes("waters")||cats.includes("juices")) kat="getraenke";
  else if(cats.includes("canned")||cats.includes("conserves")) kat="konserven";
  else if(cats.includes("pasta")||cats.includes("cereals")||cats.includes("rice")) kat="trocken";
  else if(cats.includes("snacks")||cats.includes("chocolates")||cats.includes("biscuits")) kat="snacks";
  else if(cats.includes("condiments")||cats.includes("spices")||cats.includes("oils")) kat="gewuerze";
  else if(cats.includes("dairy")||cats.includes("cheeses")||cats.includes("meats")) kat="kuehlung";
  else kat=guessKat(rawName);
  const bEinheit=guessEinheit(rawName); return { name:rawName, kategorie:kat, menge:1, einheit:bEinheit, notiz:"", ablaufdatum:"", mindestbestand:0, gewicht:guessGewicht(rawName,bEinheit), tagesbedarf:0, einkaufen:false, lagerort:"", preis:0, kaufort:"" };
};

/* ─── HELPERS ─────────────────────────────────────────────────── */
const dl = (content,name,mime)=>{ const b=new Blob([content],{type:mime}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u); };
const todayStr = ()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const daysUntil = s=>{ if(!s) return null; const diff=new Date(s)-new Date(); return Math.ceil(diff/(86400000)); };
const fmtDate = s=>{ if(!s) return ""; const[y,m,d]=s.split("-"); return `${d}.${m}.${y}`; };
const slug = s=>s.replace(/\s+/g,"_");
const emptyForm = ()=>({ name:"",kategorie:"sonstiges",menge:1,einheit:"Stück",notiz:"",ablaufdatum:"",mindestbestand:0,gewicht:0,tagesbedarf:0,einkaufen:false,lagerort:"",preis:0,kaufort:"" });
const emptyRecipe = ()=>({ name:"", portionen:4, zutaten:[{name:"",menge:1,einheit:"Stück"}] });

/* ─── CONTEXT ─────────────────────────────────────────────────── */
const AppCtx = createContext(null);
const useApp  = () => useContext(AppCtx);

/* ═══════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════════ */
export default function App() {
  const mobile = useBreakpoint();

  /* ─ State ─ */
  const [items,       setItems]       = useState(()=>lsLoad(LS.ITEMS,STARTER));
  const [recipes,     setRecipes]     = useState(()=>lsLoad(LS.RECIPES,STARTER_RECIPES));
  const [history,     setHistory]     = useState(()=>lsLoad(LS.HISTORY,[]));
  const [photos,      setPhotos]      = useState(()=>lsLoad(LS.PHOTOS,{}));
  const [fische,      setFische]      = useState(()=>lsLoad(LS.FISCHE,[]));
  const [reiseName,   setReiseName]   = useState(()=>lsLoad(LS.REISE,"Mittelmeer Tour 2025"));
  const [reiseTage,   setReiseTage]   = useState(()=>lsLoad(LS.TAGE,7));
  const [reisePersonen,setReisePersonen]=useState(()=>lsLoad(LS.PERSONEN,2));
  const [nextId,      setNextId]      = useState(()=>lsLoad(LS.NEXTID,20));
  const [nextRecipeId,setNextRecipeId]= useState(()=>lsLoad(LS.RECIPEID,10));
  const [theme,       setTheme]       = useState(()=>lsLoad(LS.THEME,"dark"));
  const [lang,        setLang]        = useState(()=>lsLoad(LS.LANG,"de"));
  const [view,        setView]        = useState("inventar");
  const [aktKat,      setAktKat]      = useState("all");
  const [suche,       setSuche]       = useState("");

  /* ─ Modals ─ */
  const [showForm,     setShowForm]    = useState(false);
  const [showExport,   setShowExport]  = useState(false);
  const [showScanner,  setShowScanner] = useState(false);
  const [showSettings, setShowSettings]= useState(false);
  const [showRecipe,   setShowRecipe]  = useState(false);
  const [showQR,       setShowQR]      = useState(false);
  const [showFischlog, setShowFischlog] = useState(false);
  const [editItem,     setEditItem]    = useState(null);
  const [editRecipe,   setEditRecipe]  = useState(null);
  const [form,         setForm]        = useState(emptyForm());
  const [recipeForm,   setRecipeForm]  = useState(emptyRecipe());
  const [formExtra,    setFormExtra]   = useState(false);
  const [editReise,    setEditReise]   = useState(false);
  const [toast,        setToast]       = useState(null);
  const [notifPerm,    setNotifPerm]   = useState(()=>typeof Notification!=="undefined"?Notification.permission:"default");
  const fileRef = useRef(null);
  const photoRefs = useRef({});

  /* ─ Persist ─ */
  useEffect(()=>lsSave(LS.ITEMS,items),[items]);
  useEffect(()=>lsSave(LS.RECIPES,recipes),[recipes]);
  useEffect(()=>lsSave(LS.HISTORY,history.slice(-100)),[history]);
  useEffect(()=>lsSave(LS.PHOTOS,photos),[photos]);
  useEffect(()=>lsSave(LS.FISCHE,fische),[fische]);
  useEffect(()=>lsSave(LS.REISE,reiseName),[reiseName]);
  useEffect(()=>lsSave(LS.TAGE,reiseTage),[reiseTage]);
  useEffect(()=>lsSave(LS.PERSONEN,reisePersonen),[reisePersonen]);
  useEffect(()=>lsSave(LS.NEXTID,nextId),[nextId]);
  useEffect(()=>lsSave(LS.RECIPEID,nextRecipeId),[nextRecipeId]);
  useEffect(()=>lsSave(LS.THEME,theme),[theme]);
  useEffect(()=>lsSave(LS.LANG,lang),[lang]);

  /* ─ Check notifications on load ─ */
  useEffect(()=>{
    if(notifPerm==="granted"){
      const expired=items.filter(i=>{ const d=daysUntil(i.ablaufdatum); return d!==null&&d<=2&&d>=0; });
      if(expired.length>0) new Notification("⚠️ Proviant App",{body:`${expired.length} Artikel laufen bald ab: ${expired.map(i=>i.name).join(", ")}`});
    }
  },[]);

  /* ─ Theme + Translation ─ */
  const C = THEMES[theme];
  const t = key => I18N[lang]?.[key] || I18N.de[key] || key;

  /* ─ Computed ─ */
  const gefiltert = useMemo(()=>items.filter(i=>{
    const kOk=aktKat==="all"||i.kategorie===aktKat;
    const sOk=i.name.toLowerCase().includes(suche.toLowerCase())||i.notiz.toLowerCase().includes(suche.toLowerCase());
    return kOk&&sOk;
  }),[items,aktKat,suche]);

  const warnings = useMemo(()=>({
    expiringSoon:items.filter(i=>{ const d=daysUntil(i.ablaufdatum); return d!==null&&d<=7&&d>=0; }),
    expired:     items.filter(i=>{ const d=daysUntil(i.ablaufdatum); return d!==null&&d<0; }),
    lowStock:    items.filter(i=>i.mindestbestand>0&&i.menge<i.mindestbestand),
  }),[items]);

  const einkaufsliste = useMemo(()=>items.filter(i=>i.einkaufen||(i.mindestbestand>0&&i.menge<i.mindestbestand)),[items]);
  const stats = useMemo(()=>({ gesamt:items.length, kats:[...new Set(items.map(i=>i.kategorie))].length, totalGewicht:items.reduce((s,i)=>s+(i.gewicht||0)*i.menge,0) }),[items]);

  /* ─ Toast ─ */
  const toast_ = useCallback((msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); },[]);

  /* ─ CRUD Items ─ */
  const openAdd  = useCallback(()=>{ setEditItem(null); setForm(emptyForm()); setFormExtra(false); setShowForm(true); },[]);
  const openEdit = useCallback(item=>{ setEditItem(item); setForm({...item}); setFormExtra(!!(item.ablaufdatum||item.mindestbestand||item.gewicht||item.tagesbedarf)); setShowForm(true); },[]);
  const saveForm = useCallback(()=>{
    if(!form.name.trim()) return;
    if(editItem) setItems(prev=>prev.map(i=>i.id===editItem.id?{...i,...form}:i));
    else{ setItems(prev=>[...prev,{id:nextId,...form}]); setNextId(n=>n+1); }
    setShowForm(false);
  },[form,editItem,nextId]);
  const del = useCallback(id=>{ setItems(prev=>prev.filter(i=>i.id!==id)); setPhotos(prev=>{ const p={...prev}; delete p[id]; return p; }); },[]);
  const duplicateItem   = useCallback(id=>{ const item=items.find(i=>i.id===id); if(!item) return; setItems(prev=>[...prev,{...item,id:nextId,name:item.name+" (Kopie)"}]); setNextId(n=>n+1); toast_("Artikel dupliziert ✓"); },[items,nextId,toast_]);
  const toggleEinkaufen = useCallback(id=>setItems(prev=>prev.map(i=>i.id===id?{...i,einkaufen:!i.einkaufen}:i)),[]);
  const markGekauft     = useCallback(id=>setItems(prev=>prev.map(i=>i.id===id?{...i,einkaufen:false,menge:Math.max(i.menge,i.mindestbestand||i.menge)}:i)),[]);

  /* ─ Consume ─ */
  const consumeItem = useCallback((id,amount)=>{
    setItems(prev=>{
      const updated=prev.map(i=>{ if(i.id!==id) return i; return {...i,menge:Math.max(0,Number((i.menge-amount).toFixed(2)))}; });
      // Read item from prev (not stale closure) for history log
      const item=prev.find(i=>i.id===id);
      if(item) setHistory(h=>[...h,{id:Date.now(),itemId:id,itemName:item.name,amount,einheit:item.einheit,ts:new Date().toISOString()}]);
      return updated;
    });
  },[]);
  const addMenge = useCallback((id,amount)=>setItems(prev=>prev.map(i=>i.id===id?{...i,menge:Math.max(0,Number((i.menge+amount).toFixed(2)))}:i)),[]);

  /* ─ Photos ─ */
  const handlePhotoUpload = useCallback((id,e)=>{
    const f=e.target.files[0]; if(!f) return;
    const img=new Image();
    const objectUrl=URL.createObjectURL(f);
    img.onload=()=>{
      URL.revokeObjectURL(objectUrl);
      // Resize to max 400px to keep localStorage small
      const MAX=400;
      const scale=Math.min(1,MAX/Math.max(img.width,img.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.round(img.width*scale);
      canvas.height=Math.round(img.height*scale);
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      const compressed=canvas.toDataURL("image/jpeg",0.75);
      // Warn if still large (>200KB)
      if(compressed.length>200000) toast_("⚠️ Foto sehr gross – evtl. Speicher voll","info");
      setPhotos(prev=>({...prev,[id]:compressed}));
      toast_(t("photo")+" ✓");
    };
    img.src=objectUrl;
    e.target.value="";
  },[t]);
  const removePhoto = useCallback(id=>setPhotos(prev=>{ const p={...prev}; delete p[id]; return p; }),[]);

  /* ─ Fischfang ─ */
  const logFisch = useCallback((name,gewichtG)=>{
    const kg=(gewichtG/1000).toFixed(2);
    const existing=items.find(i=>i.name.toLowerCase().includes("fisch")||i.name.toLowerCase().includes("lachs")||i.name.toLowerCase().includes(name.toLowerCase()));
    if(existing){ setItems(prev=>prev.map(i=>i.id===existing.id?{...i,menge:Number((i.menge+Number(kg)).toFixed(2))}:i)); }
    else{ setItems(prev=>[...prev,{id:nextId,name,kategorie:"kuehlung",menge:Number(kg),einheit:"kg",notiz:"Frisch gefangen 🎣",ablaufdatum:"",mindestbestand:0,gewicht:1000,tagesbedarf:0,einkaufen:false,lagerort:"kuehlbox",preis:0,kaufort:""}]); setNextId(n=>n+1); }
    setFische(prev=>[...prev,{id:Date.now(),name,gewicht:gewichtG,ts:new Date().toISOString()}]);
    toast_(`🎣 ${name} (${gewichtG}g) geloggt!`);
  },[items,nextId,toast_]);

  /* ─ PDF Print ─ */
  const printPDF = ()=>{
    const rows=items.map(i=>{
      const kat=katOf(i.kategorie);
      const lort=LAGERORTE.find(l=>l.id===i.lagerort)||LAGERORTE[0];
      return `<tr><td>${productIcon(i.name,i.kategorie)} ${i.name}</td><td>${kat.label}</td><td>${i.menge} ${i.einheit}</td><td>${lort.emoji} ${lort.label}</td><td>${i.preis>0?"€"+i.preis.toFixed(2):""}</td><td>${i.kaufort||""}</td><td style="text-align:center">☐</td></tr>`;
    }).join("");
    const total=items.reduce((s,i)=>s+(i.preis||0)*i.menge,0);
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proviant – ${reiseName}</title><style>
      body{font-family:Georgia,serif;padding:24px;color:#1a1a2e;}
      h1{color:#8b6914;border-bottom:2px solid #c9a84c;padding-bottom:8px;}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;}
      th{background:#0d2040;color:#f0c96e;padding:8px 10px;text-align:left;}
      td{padding:7px 10px;border-bottom:1px solid #ddd;}
      tr:nth-child(even){background:#f5f8ff;}
      .footer{margin-top:20px;font-size:12px;color:#666;border-top:1px solid #ccc;padding-top:10px;}
      @media print{button{display:none}}
    </style></head><body>
      <h1>⚓ ${reiseName}</h1>
      <p>📅 ${new Date().toLocaleDateString("de-DE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · ${reiseTage} Tage · ${reisePersonen} Personen · ${items.length} Artikel</p>
      <table><thead><tr><th>Artikel</th><th>Kategorie</th><th>Menge</th><th>Stauraum</th><th>Preis</th><th>Kaufort</th><th>✓</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="footer">Gesamtkosten: €${total.toFixed(2)} · Gesamtgewicht: ${(items.reduce((s,i)=>s+(i.gewicht||0)*i.menge,0)/1000).toFixed(1)} kg · Erstellt mit Segelboot-Proviant v${VERSION}</div>
      <script>window.print();<\/script>
    </body></html>`;
    const w=window.open("","_blank"); w.document.write(html); w.document.close();
  };

  /* ─ Quick-Add ─ */
  const handleQuickAdd = useCallback(text=>{ if(!text.trim()) return; const p=parseQuick(text); setItems(prev=>[...prev,{id:nextId,...p}]); setNextId(n=>n+1); toast_(`✓ "${p.name}" ${t("add").replace("+ ","")}`); },[nextId,t]);

  /* ─ Barcode ─ */
  const handleBarcodeResult = useCallback(async code=>{ setShowScanner(false); toast_(t("loading"),"info"); try{ const p=await lookupBarcode(code); if(!p||!p.name){ toast_("Produkt nicht gefunden","err"); openAdd(); return; } setEditItem(null); setForm(p); setFormExtra(false); setShowForm(true); toast_(`✓ "${p.name}"!`); }catch{ toast_("Netzwerkfehler","err"); openAdd(); } },[t,openAdd]);

  /* ─ Recipes ─ */
  const openAddRecipe  = ()=>{ setEditRecipe(null); setRecipeForm(emptyRecipe()); setShowRecipe(true); };
  const openEditRecipe = r=>{ setEditRecipe(r); setRecipeForm({...r,zutaten:[...r.zutaten.map(z=>({...z}))]}); setShowRecipe(true); };
  const saveRecipe = ()=>{
    if(!recipeForm.name.trim()) return;
    if(editRecipe) setRecipes(prev=>prev.map(r=>r.id===editRecipe.id?{...r,...recipeForm}:r));
    else{ setRecipes(prev=>[...prev,{id:nextRecipeId,...recipeForm}]); setNextRecipeId(n=>n+1); }
    setShowRecipe(false);
  };
  const delRecipe = id=>setRecipes(prev=>prev.filter(r=>r.id!==id));
  const cookRecipe = recipe=>{ if(!window.confirm(t("cookConfirm"))) return; recipe.zutaten.forEach(z=>{ const item=items.find(i=>i.name.toLowerCase().includes(z.name.toLowerCase())); if(item) consumeItem(item.id,z.menge); }); toast_(`🍳 ${recipe.name} gekocht!`); };
  const canCook = recipe=>recipe.zutaten.every(z=>{ const item=items.find(i=>i.name.toLowerCase().includes(z.name.toLowerCase())); return item&&item.menge>=z.menge; });

  /* ─ Notifications ─ */
  const enableNotifications = async()=>{ const perm=await Notification.requestPermission(); setNotifPerm(perm); if(perm==="granted") toast_(t("notifEnabled")); };

  /* ─ Exports ─ */
  const expCSV   = ()=>{ const h="Name;Kategorie;Menge;Einheit;Notiz;Ablaufdatum;Mindest;Gewicht"; const rows=items.map(i=>`${i.name};${katOf(i.kategorie).label};${i.menge};${i.einheit};${i.notiz};${i.ablaufdatum};${i.mindestbestand};${i.gewicht}`); dl("\uFEFF"+[h,...rows].join("\n"),`Proviant_${slug(reiseName)}_${todayStr()}.csv`,"text/csv;charset=utf-8"); toast_(t("exportCSV")+" ✓"); setShowExport(false); };
  const expTXT   = ()=>{ const L=[`PROVIANT: ${reiseName}`,`${new Date().toLocaleDateString("de-DE")}`,"─".repeat(36),""]; KATEGORIEN.filter(k=>k.id!=="all").forEach(kat=>{ const g=items.filter(i=>i.kategorie===kat.id); if(!g.length) return; L.push(`${kat.emoji} ${kat.label.toUpperCase()}`); g.forEach(i=>L.push(`  [ ] ${i.name} – ${i.menge} ${i.einheit}`)); L.push(""); }); dl(L.join("\n"),`Packliste_${slug(reiseName)}_${todayStr()}.txt`,"text/plain;charset=utf-8"); toast_(t("exportTXT")+" ✓"); setShowExport(false); };
  const expEinkauf=()=>{ const L=[`EINKAUFSLISTE: ${reiseName}`,"─".repeat(36),"",...einkaufsliste.map(i=>`  [ ] ${i.name}${i.mindestbestand>0?` (mind. ${i.mindestbestand} ${i.einheit})`:""}`)]; dl(L.join("\n"),`Einkauf_${slug(reiseName)}_${todayStr()}.txt`,"text/plain;charset=utf-8"); toast_(t("exportEinkauf")+" ✓"); setShowExport(false); };
  const expJSON  = ()=>{ dl(JSON.stringify({version:5,exportedAt:new Date().toISOString(),reiseName,reiseTage,reisePersonen,items,recipes,fische},null,2),`Backup_${slug(reiseName)}_${todayStr()}.json`,"application/json"); toast_(t("saveBackup")+" ✓"); setShowExport(false); };
  const impJSON  = e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ try{ const d=JSON.parse(ev.target.result); if(!d.items||!Array.isArray(d.items)) throw 0; const en=d.items.map(i=>({notiz:"",ablaufdatum:"",mindestbestand:0,gewicht:0,tagesbedarf:0,einkaufen:false,lagerort:"",preis:0,kaufort:"",...i})); setItems(en); if(d.reiseName) setReiseName(d.reiseName); if(d.reiseTage) setReiseTage(d.reiseTage); if(d.reisePersonen) setReisePersonen(d.reisePersonen); if(d.recipes){ setRecipes(d.recipes); const nrid=Math.max(...d.recipes.map(r=>r.id),0)+1; setNextRecipeId(nrid); } if(d.fische) setFische(d.fische); const nid=Math.max(...en.map(i=>i.id),0)+1; setNextId(nid); toast_(`${en.length} Artikel + ${d.recipes?.length||0} Rezepte geladen ✓`); }catch{ toast_("Ungültige Datei","err"); } }; r.readAsText(f); e.target.value=""; setShowExport(false); };

  /* ─ Context Value ─ */
  const ctx = {
    C,t,theme,setTheme,lang,setLang,mobile,
    items,setItems,recipes,setRecipes,history,photos,einkaufsliste,gefiltert,warnings,stats,
    reiseName,setReiseName,editReise,setEditReise,
    reiseTage,setReiseTage,reisePersonen,setReisePersonen,
    view,setView,aktKat,setAktKat,suche,setSuche,
    form,setForm,recipeForm,setRecipeForm,formExtra,setFormExtra,
    editItem,editRecipe,nextId,setNextId,
    openAdd,openEdit,saveForm,del,duplicateItem,toggleEinkaufen,markGekauft,consumeItem,addMenge,
    openAddRecipe,openEditRecipe,saveRecipe,delRecipe,cookRecipe,canCook,
    handlePhotoUpload,removePhoto,photoRefs,
    handleQuickAdd,handleBarcodeResult,
    toast_,
    setShowForm,setShowExport,setShowScanner,setShowSettings,setShowRecipe,setShowQR,setShowFischlog,
    notifPerm,enableNotifications,
    fische,logFisch,printPDF,expCSV,expTXT,expEinkauf,expJSON,
    fileRef,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div style={{minHeight:"100vh",background:C.gradient,fontFamily:"Georgia,'Times New Roman',serif",color:C.text,display:"flex",flexDirection:"column"}}>
        <style>{`
          *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
          input,select,button,textarea{font-family:Georgia,serif;}
          ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:transparent;}
          ::-webkit-scrollbar-thumb{background:rgba(128,128,128,.25);border-radius:3px;}
          input::placeholder{color:rgba(128,128,128,.4);}
          @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
          @keyframes scanline{0%{top:8%}100%{top:86%}}
        `}</style>
        <div style={{height:3,background:`linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,flexShrink:0}}/>

        {mobile ? <MobileLayout/> : <DesktopLayout/>}

        {/* TOAST */}
        {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?`rgba(180,40,40,.95)`:toast.type==="info"?`rgba(13,37,85,.95)`:`rgba(20,80,40,.95)`,border:`1px solid ${toast.type==="err"?C.red:toast.type==="info"?C.gold:C.green}`,color:toast.type==="err"?"#faa":toast.type==="info"?C.goldL:"#8de",borderRadius:10,padding:"10px 22px",fontSize:14,zIndex:9999,boxShadow:"0 8px 32px rgba(0,0,0,.5)",whiteSpace:"nowrap",animation:"toastIn .25s ease"}}>{toast.msg}</div>}

        {showScanner&&<BarcodeScanner/>}
        {showForm&&<ArticleFormModal/>}
        {showExport&&<ExportModal/>}
        {showSettings&&<SettingsModal/>}
        {showRecipe&&<RecipeFormModal/>}
        {showQR&&<QRModal/>}
        {showFischlog&&<FischlogModal/>}
      </div>
    </AppCtx.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE VIEW
══════════════════════════════════════════════════════════════════ */
function ActiveView() {
  const { view } = useApp();
  if(view==="inventar")  return <InventarView/>;
  if(view==="einkaufen") return <EinkaufView/>;
  if(view==="mahlzeiten")return <MahlzeitenView/>;
  if(view==="stauraum")  return <StauraumView/>;
  if(view==="statistik") return <StatistikView/>;
  if(view==="planung")   return <PlanungView/>;
  return null;
}
const VIEW_EMOJI = { inventar:"📦", einkaufen:"🛒", mahlzeiten:"🍽️", stauraum:"🗂️", statistik:"📊", planung:"🗓️" };

/* ═══════════════════════════════════════════════════════════════
   INVENTAR VIEW
══════════════════════════════════════════════════════════════════ */
function InventarView() {
  const { C,t,items,gefiltert,warnings,aktKat,setAktKat,suche,setSuche,openAdd,openEdit,del,duplicateItem,toggleEinkaufen,consumeItem,addMenge,handleQuickAdd,setShowScanner,setShowFischlog,printPDF,photos,handlePhotoUpload,removePhoto,photoRefs } = useApp();
  return (
    <>
      <WarningBar/>
      <QuickAddBar/>
      {/* Search */}
      <div style={{position:"relative",marginBottom:10}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.5}}>🔍</span>
        <input placeholder={t("search")} value={suche} onChange={e=>setSuche(e.target.value)}
          style={{width:"100%",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px 10px 38px",color:C.text,fontSize:14,outline:"none"}}/>
      </div>
      {/* Fischfang + Print buttons */}
      <div style={{display:"flex",gap:7,marginBottom:10}}>
        <button onClick={()=>setShowFischlog(true)} style={{flex:1,background:`rgba(61,158,82,.1)`,border:`1px solid rgba(61,158,82,.3)`,borderRadius:10,padding:"8px",color:C.green,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🎣 Fischfang loggen</button>
        <button onClick={printPDF} style={{flex:1,background:`rgba(201,168,76,.08)`,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px",color:C.gold,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🖨️ PDF drucken</button>
      </div>
      {/* Category tabs */}
      <div style={{overflowX:"auto",display:"flex",gap:5,padding:"2px 0 10px",scrollbarWidth:"none"}}>
        {KATEGORIEN.map(kat=>{
          const act=aktKat===kat.id;
          return <button key={kat.id} onClick={()=>setAktKat(kat.id)} style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",background:act?`linear-gradient(135deg,${C.gold},${C.goldL})`:`${C.inputBg}`,color:act?C.bg0||"#fff":C.text,fontSize:13,fontFamily:"Georgia,serif",fontWeight:act?"bold":"normal"}}>
            {kat.emoji} {kat.label}{kat.id!=="all"&&<span style={{opacity:.6,fontSize:11}}>({items.filter(i=>i.kategorie===kat.id).length})</span>}
          </button>;
        })}
      </div>
      {/* Items */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {gefiltert.length===0&&<div style={{textAlign:"center",padding:"40px 0",opacity:.4,fontStyle:"italic"}}>{t("noItems")}<br/><span style={{fontSize:28}}>🌊</span></div>}
        {gefiltert.map(item=>{
          const kat=katOf(item.kategorie);
          const icon=productIcon(item.name,item.kategorie);
          const daysLeft=daysUntil(item.ablaufdatum);
          const lowStock=item.mindestbestand>0&&item.menge<item.mindestbestand;
          const expiring=daysLeft!==null&&daysLeft<=7;
          const bColor=daysLeft!==null&&daysLeft<0?C.red:expiring?C.orange:lowStock?C.gold:C.border;
          return (
            <div key={item.id} style={{background:C.card,border:`1px solid ${bColor}`,borderRadius:12,padding:"10px 14px"}}>
              {/* Row 1: icon + name + menge badge */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{position:"relative",width:42,height:42,flexShrink:0}}>
                  {photos[item.id]
                    ? <img src={photos[item.id]} alt="" style={{width:42,height:42,borderRadius:8,objectFit:"cover",cursor:"pointer"}} onClick={()=>removePhoto(item.id)} title={t("removePhoto")}/>
                    : <span style={{fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",width:42,height:42,cursor:"pointer"}} onClick={()=>{ if(!photoRefs.current[item.id]) return; photoRefs.current[item.id].click(); }} title={t("addPhoto")}>{icon}</span>
                  }
                  <input ref={el=>photoRefs.current[item.id]=el} type="file" accept="image/*" capture="environment" onChange={e=>handlePhotoUpload(item.id,e)} style={{display:"none"}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"bold",fontSize:15,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                  <div style={{fontSize:12,marginTop:2,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",color:C.gold}}>
                    <span style={{fontWeight:"bold"}}>{item.menge} {item.einheit}</span>
                    {item.notiz&&<span style={{color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>· {item.notiz}</span>}
                  </div>
                  <div style={{fontSize:11,marginTop:2,display:"flex",gap:6,flexWrap:"wrap",color:C.muted}}>
                    {item.ablaufdatum&&<span style={{color:daysLeft<0?C.red:daysLeft<=7?C.orange:C.muted}}>📅 {fmtDate(item.ablaufdatum)}{daysLeft!==null&&daysLeft<=7&&` (${daysLeft<0?"!":daysLeft+"d"})`}</span>}
                    {lowStock&&<span style={{color:C.orange}}>⚠️ min.{item.mindestbestand}</span>}
                    {item.gewicht>0&&<span>⚖️ {item.gewicht}g</span>}
                  </div>
                </div>
              </div>
              {/* Row 2: action buttons */}
              <div style={{display:"flex",alignItems:"center",gap:6,borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <button onClick={()=>consumeItem(item.id,1)} style={{flex:1,background:`rgba(196,76,76,.12)`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"6px 0",color:C.red,cursor:"pointer",fontSize:18,fontWeight:"bold"}}>−</button>
                <span style={{fontSize:13,color:C.gold,fontWeight:"bold",minWidth:50,textAlign:"center"}}>{item.menge} {item.einheit}</span>
                <button onClick={()=>addMenge(item.id,1)} style={{flex:1,background:`rgba(61,158,82,.12)`,border:`1px solid ${C.green}33`,borderRadius:8,padding:"6px 0",color:C.green,cursor:"pointer",fontSize:18,fontWeight:"bold"}}>+</button>
                <div style={{width:1,height:24,background:C.border}}/>
                {/* Lagerort badge */}
                {item.lagerort&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:`rgba(201,168,76,.12)`,border:`1px solid ${C.border}`,color:C.gold}}>{LAGERORTE.find(l=>l.id===item.lagerort)?.emoji} {LAGERORTE.find(l=>l.id===item.lagerort)?.label}</span>}
                {item.preis>0&&<span style={{fontSize:11,color:C.green}}>€{(item.preis*item.menge).toFixed(2)}</span>}
                <button onClick={()=>toggleEinkaufen(item.id)} style={{...iBtn(),color:item.einkaufen?C.gold:"rgba(128,128,128,.3)",fontSize:20,padding:"4px 8px"}}>🛒</button>
                <button onClick={()=>duplicateItem(item.id)} style={{...iBtn(),fontSize:18,padding:"4px 8px"}} title="Duplizieren">🔄</button>
                <button onClick={()=>openEdit(item)} style={{...iBtn(),fontSize:18,padding:"4px 8px"}}>✏️</button>
                <button onClick={()=>del(item.id)}   style={{...iBtn(),fontSize:18,padding:"4px 8px"}}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EINKAUF VIEW
══════════════════════════════════════════════════════════════════ */
function EinkaufView() {
  const { C,t,einkaufsliste,items,toggleEinkaufen,markGekauft,openEdit,setShowExport,setShowQR } = useApp();
  const manual = einkaufsliste.filter(i=>i.einkaufen);
  const auto   = einkaufsliste.filter(i=>!i.einkaufen&&i.mindestbestand>0&&i.menge<i.mindestbestand);
  return (
    <div>
      {einkaufsliste.length===0&&<div style={{textAlign:"center",padding:"50px 0",opacity:.4,fontStyle:"italic"}}>{t("noItems")}<br/><span style={{fontSize:30}}>🛒</span></div>}
      {auto.length>0&&(
        <div style={{marginBottom:18}}>
          <SLbl color={C.orange}>🔔 {t("lowStock")} ({auto.length})</SLbl>
          {auto.map(item=>{
            const icon=productIcon(item.name,item.kategorie);
            return <ShopItem key={item.id} item={item} icon={icon} sub={`${t("available")}: ${item.menge} | Min: ${item.mindestbestand} ${item.einheit}`} subColor={C.orange} onBought={()=>markGekauft(item.id)} onEdit={()=>openEdit(item)} C={C} t={t}/>;
          })}
        </div>
      )}
      {manual.length>0&&(
        <div style={{marginBottom:18}}>
          <SLbl color={C.muted}>📌 {t("einkaufen")} ({manual.length})</SLbl>
          {manual.map(item=>{
            const icon=productIcon(item.name,item.kategorie);
            return <ShopItem key={item.id} item={item} icon={icon} sub={`${item.menge} ${item.einheit}${item.notiz?" · "+item.notiz:""}`} subColor={C.muted} onBought={()=>markGekauft(item.id)} onRemove={()=>toggleEinkaufen(item.id)} onEdit={()=>openEdit(item)} C={C} t={t}/>;
          })}
        </div>
      )}
      {einkaufsliste.length>0&&(
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={()=>setShowExport(true)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:11,color:C.gold,cursor:"pointer",fontSize:13}}>⬇ {t("exportEinkauf")}</button>
          <button onClick={()=>setShowQR(true)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:11,color:C.gold,cursor:"pointer",fontSize:13}}>📱 {t("crewShare")}</button>
        </div>
      )}
    </div>
  );
}
function ShopItem({item,icon,sub,subColor,onBought,onRemove,onEdit,C,t}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
    <span style={{fontSize:22}}>{icon}</span>
    <div style={{flex:1}}><div style={{fontWeight:"bold",color:C.text}}>{item.name}</div><div style={{fontSize:12,color:subColor,marginTop:2}}>{sub}</div></div>
    <button onClick={onBought} style={{background:`rgba(61,158,82,.15)`,border:`1px solid ${C.green}44`,borderRadius:8,padding:"6px 11px",color:C.green,cursor:"pointer",fontSize:13}}>{t("bought")}</button>
    {onRemove&&<button onClick={onRemove} style={{background:`rgba(196,76,76,.1)`,border:`1px solid ${C.red}44`,borderRadius:8,padding:"6px 9px",color:C.red,cursor:"pointer",fontSize:13}}>✕</button>}
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   STAURAUM VIEW
══════════════════════════════════════════════════════════════════ */
function StauraumView() {
  const { C,t,items,openEdit,del,duplicateItem,consumeItem,addMenge,photos,removePhoto,photoRefs,handlePhotoUpload } = useApp();
  const [filter, setFilter] = useState("");

  const lagerorteWithItems = LAGERORTE.filter(l => {
    const group = l.id === "" 
      ? items.filter(i => !i.lagerort) 
      : items.filter(i => i.lagerort === l.id);
    return group.length > 0;
  });

  const totalKg   = items.reduce((s,i) => s + (i.gewicht||0)*i.menge, 0) / 1000;
  const totalKost = items.reduce((s,i) => s + (i.preis||0)*i.menge, 0);

  return (
    <div>
      {/* Summary bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        <StatCard label="Orte" value={lagerorteWithItems.length} emoji="📍" C={C}/>
        <StatCard label="Gewicht" value={`${totalKg.toFixed(1)} kg`} emoji="⚖️" C={C}/>
        <StatCard label="Wert" value={`€${totalKost.toFixed(2)}`} emoji="💰" C={C}/>
      </div>

      {/* Search filter */}
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.5}}>🔍</span>
        <input placeholder="Artikel suchen..." value={filter} onChange={e=>setFilter(e.target.value)}
          style={{width:"100%",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 12px 9px 36px",color:C.text,fontSize:14,outline:"none"}}/>
      </div>

      {/* Lagerort groups */}
      {lagerorteWithItems.map(lort => {
        const group = (lort.id === ""
          ? items.filter(i => !i.lagerort)
          : items.filter(i => i.lagerort === lort.id)
        ).filter(i => !filter || i.name.toLowerCase().includes(filter.toLowerCase()));

        if(group.length === 0) return null;

        const groupKg    = group.reduce((s,i) => s + (i.gewicht||0)*i.menge, 0) / 1000;
        const groupKost  = group.reduce((s,i) => s + (i.preis||0)*i.menge, 0);
        const maxGewicht = Math.max(...group.map(i=>(i.gewicht||0)*i.menge), 1);

        return (
          <div key={lort.id} style={{marginBottom:16}}>
            {/* Location header */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:`linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04))`,border:`1px solid ${C.borderHi}`,borderRadius:"12px 12px 0 0"}}>
              <span style={{fontSize:26}}>{lort.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:"bold",fontSize:15,color:C.gold}}>{lort.label}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>{group.length} Artikel · {groupKg.toFixed(2)} kg{groupKost>0?` · €${groupKost.toFixed(2)}`:""}</div>
              </div>
              {/* Weight bar */}
              <div style={{width:60}}>
                <div style={{height:6,background:`${C.border}`,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round((groupKg/totalKg)*100)}%`,background:`linear-gradient(90deg,${C.gold},${C.goldL})`,borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:C.muted,textAlign:"right",marginTop:2}}>{totalKg>0?Math.round((groupKg/totalKg)*100):0}%</div>
              </div>
            </div>

            {/* Items in this location */}
            <div style={{border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
              {group.map((item, idx) => {
                const icon = productIcon(item.name, item.kategorie);
                const itemKg = ((item.gewicht||0)*item.menge/1000);
                const pct = maxGewicht > 0 ? Math.round(((item.gewicht||0)*item.menge / maxGewicht)*100) : 0;
                const daysLeft = daysUntil(item.ablaufdatum);
                const lowStock = item.mindestbestand>0 && item.menge<item.mindestbestand;
                return (
                  <div key={item.id} style={{padding:"10px 14px",background:idx%2===0?C.card:`rgba(255,255,255,.02)`,borderTop:idx>0?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      {/* Photo/icon */}
                      <div style={{width:36,height:36,flexShrink:0,cursor:"pointer"}} onClick={()=>photoRefs.current[item.id]?.click()}>
                        {photos[item.id]
                          ? <img src={photos[item.id]} alt="" style={{width:36,height:36,borderRadius:7,objectFit:"cover"}} onClick={e=>{e.stopPropagation();removePhoto(item.id);}}/>
                          : <span style={{fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36}}>{icon}</span>
                        }
                        <input ref={el=>photoRefs.current[item.id]=el} type="file" accept="image/*" capture="environment" onChange={e=>handlePhotoUpload(item.id,e)} style={{display:"none"}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:"bold",fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2,alignItems:"center"}}>
                          <span style={{fontSize:12,color:C.gold,fontWeight:"bold"}}>{item.menge} {item.einheit}</span>
                          {item.preis>0&&<span style={{fontSize:11,color:C.green}}>€{(item.preis*item.menge).toFixed(2)}</span>}
                          {item.kaufort&&<span style={{fontSize:11,color:C.muted}}>📍{item.kaufort}</span>}
                          {daysLeft!==null&&daysLeft<=7&&<span style={{fontSize:11,color:daysLeft<0?C.red:C.orange}}>{daysLeft<0?"⛔Abgel.":"⚠️"+daysLeft+"d"}</span>}
                          {lowStock&&<span style={{fontSize:11,color:C.orange}}>🔔Wenig</span>}
                        </div>
                        {/* Weight bar */}
                        {item.gewicht>0&&(
                          <div style={{marginTop:4,display:"flex",alignItems:"center",gap:6}}>
                            <div style={{flex:1,height:3,background:`${C.border}`,borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${pct}%`,background:C.muted,borderRadius:2}}/>
                            </div>
                            <span style={{fontSize:10,color:C.muted,flexShrink:0}}>{itemKg.toFixed(2)}kg</span>
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      <div style={{display:"flex",gap:3,flexShrink:0}}>
                        <button onClick={()=>consumeItem(item.id,1)} style={{...cBtn(C),background:`rgba(196,76,76,.12)`,color:C.red,width:26,height:26,fontSize:14}}>−</button>
                        <button onClick={()=>addMenge(item.id,1)}    style={{...cBtn(C),background:`rgba(61,158,82,.12)`,color:C.green,width:26,height:26,fontSize:14}}>+</button>
                        <button onClick={()=>openEdit(item)} style={{...iBtn(),fontSize:16,padding:"3px 6px"}}>✏️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {lagerorteWithItems.length===0&&(
        <div style={{textAlign:"center",padding:"50px 0",opacity:.4,fontStyle:"italic"}}>
          Noch kein Stauraum zugewiesen.<br/><span style={{fontSize:28}}>📦</span><br/>
          <span style={{fontSize:12}}>Artikel bearbeiten → Stauraum wählen</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAHLZEITEN VIEW
══════════════════════════════════════════════════════════════════ */
function MahlzeitenView() {
  const { C,t,recipes,items,openAddRecipe,openEditRecipe,delRecipe,cookRecipe,canCook } = useApp();
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:13,color:C.muted}}>{recipes.length} {t("recipes")}</div>
        <button onClick={openAddRecipe} style={{background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderRadius:10,padding:"9px 16px",color:"#1a0a00",fontWeight:"bold",cursor:"pointer",fontSize:14}}>+ {t("addRecipe")}</button>
      </div>
      {recipes.length===0&&<div style={{textAlign:"center",padding:"40px 0",opacity:.4,fontStyle:"italic"}}>Noch keine Rezepte.<br/><span style={{fontSize:28}}>🍳</span></div>}
      {recipes.map(recipe=>{
        const ok=canCook(recipe);
        return (
          <div key={recipe.id} style={{background:C.card,border:`1px solid ${ok?"rgba(61,158,82,.4)":C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:26}}>🍽️</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:"bold",fontSize:16,color:C.text}}>{recipe.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{recipe.portionen} {t("portions")}</div>
              </div>
              <button onClick={()=>cookRecipe(recipe)} disabled={!ok} style={{background:ok?`rgba(61,158,82,.2)`:"rgba(128,128,128,.1)",border:`1px solid ${ok?C.green:C.border}`,borderRadius:9,padding:"7px 13px",color:ok?C.green:C.muted,cursor:ok?"pointer":"not-allowed",fontSize:13,fontWeight:"bold"}}>{ok?"🍳 "+t("cookNow"):"⚠️"}</button>
              <button onClick={()=>openEditRecipe(recipe)} style={iBtn()}>✏️</button>
              <button onClick={()=>delRecipe(recipe.id)} style={iBtn()}>🗑️</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {recipe.zutaten.map((z,i)=>{
                const found=items.find(it=>it.name.toLowerCase().includes(z.name.toLowerCase()));
                const enough=found&&found.menge>=z.menge;
                return <span key={i} style={{fontSize:12,padding:"3px 10px",borderRadius:15,border:`1px solid ${enough?"rgba(61,158,82,.4)":"rgba(196,76,76,.4)"}`,color:enough?C.green:C.red,background:enough?"rgba(61,158,82,.08)":"rgba(196,76,76,.08)"}}>{productIcon(z.name,"sonstiges")} {z.name} {z.menge}{z.einheit}</span>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATISTIK VIEW
══════════════════════════════════════════════════════════════════ */
function StatistikView() {
  const { C,t,items,history,stats,fische,reiseTage,reisePersonen } = useApp();
  const byKat = KATEGORIEN.filter(k=>k.id!=="all").map(k=>({...k,count:items.filter(i=>i.kategorie===k.id).length,weight:items.filter(i=>i.kategorie===k.id).reduce((s,i)=>s+(i.gewicht||0)*i.menge,0)/1000})).filter(k=>k.count>0);
  const maxCount = Math.max(...byKat.map(k=>k.count),1);
  const maxWeight = Math.max(...byKat.map(k=>k.weight),0.001);
  const topConsumed = [...history].reverse().slice(0,8);
  const consumeSummary = history.reduce((acc,h)=>{ acc[h.itemName]=(acc[h.itemName]||0)+h.amount; return acc; },{});
  const topItems = Object.entries(consumeSummary).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <div>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        <StatCard label={t("inventar")} value={stats.gesamt} emoji="📦" C={C}/>
        <StatCard label={t("totalWeight")} value={stats.totalGewicht>=1000?`${(stats.totalGewicht/1000).toFixed(1)}kg`:`${stats.totalGewicht}g`} emoji="⚖️" C={C}/>
        <StatCard label={t("consumed")} value={history.length} emoji="⛽" C={C}/>
      </div>

      {/* Items by category bar chart */}
      <ChartSection title={`📦 ${t("byCategory")}`} C={C}>
        {byKat.map(k=>(
          <BarRow key={k.id} label={`${k.emoji} ${k.label}`} value={k.count} max={maxCount} unit="Artikel" color={C.gold} C={C}/>
        ))}
      </ChartSection>

      {/* Weight by category */}
      <ChartSection title={`⚖️ ${t("totalWeight")} ${t("byCategory")}`} C={C}>
        {byKat.filter(k=>k.weight>0).sort((a,b)=>b.weight-a.weight).map(k=>(
          <BarRow key={k.id} label={`${k.emoji} ${k.label}`} value={k.weight} max={maxWeight} unit="kg" fmt={v=>v.toFixed(2)} color={C.green} C={C}/>
        ))}
      </ChartSection>

      {/* Top consumed */}
      {topItems.length>0&&(
        <ChartSection title={`⛽ ${t("topItems")}`} C={C}>
          {topItems.map(([name,amt],i)=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
              <span style={{fontSize:12,color:C.muted,width:16,textAlign:"right"}}>{i+1}</span>
              <span style={{fontSize:18}}>{productIcon(name,"sonstiges")}</span>
              <span style={{flex:1,fontSize:14,color:C.text}}>{name}</span>
              <span style={{fontSize:14,color:C.gold,fontWeight:"bold"}}>{Number(amt.toFixed(1))}×</span>
            </div>
          ))}
        </ChartSection>
      )}

      {/* Costs */}
      {items.some(i=>i.preis>0)&&(
        <ChartSection title="💰 Kosten" C={C}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
            <StatCard label="Gesamtkosten" value={`€${items.reduce((s,i)=>s+(i.preis||0)*i.menge,0).toFixed(2)}`} emoji="💰" C={C}/>
            <StatCard label="Ø pro Person" value={`€${(items.reduce((s,i)=>s+(i.preis||0)*i.menge,0)/reisePersonen).toFixed(2)}`} emoji="🧑" C={C}/>
            <StatCard label="Ø pro Tag" value={`€${(items.reduce((s,i)=>s+(i.preis||0)*i.menge,0)/reiseTage).toFixed(2)}`} emoji="📅" C={C}/>
          </div>
          {KATEGORIEN.filter(k=>k.id!=="all").map(kat=>{
            const g=items.filter(i=>i.kategorie===kat.id&&i.preis>0);
            if(!g.length) return null;
            const total=g.reduce((s,i)=>s+(i.preis||0)*i.menge,0);
            const maxKat=Math.max(...KATEGORIEN.filter(k=>k.id!=="all").map(k=>items.filter(i=>i.kategorie===k.id).reduce((s,i)=>s+(i.preis||0)*i.menge,0)));
            return <BarRow key={kat.id} label={`${kat.emoji} ${kat.label}`} value={total} max={maxKat||1} unit="€" fmt={v=>"€"+v.toFixed(2)} color={C.gold} C={C}/>;
          })}
          {/* Kauforte */}
          {items.some(i=>i.kaufort)&&(
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,letterSpacing:2,color:C.muted,marginBottom:8}}>📍 KAUFORTE</div>
              {[...new Set(items.filter(i=>i.kaufort).map(i=>i.kaufort))].map(ort=>{
                const orItems=items.filter(i=>i.kaufort===ort);
                const total=orItems.reduce((s,i)=>s+(i.preis||0)*i.menge,0);
                return <div key={ort} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                  <span>📍 {ort}</span><span style={{color:C.gold}}>€{total.toFixed(2)} · {orItems.length} Artikel</span>
                </div>;
              })}
            </div>
          )}
        </ChartSection>
      )}

      {/* Stauraum */}
      {items.some(i=>i.lagerort)&&(
        <ChartSection title="📦 Stauraum-Verteilung" C={C}>
          {LAGERORTE.filter(l=>l.id!=="").map(l=>{
            const g=items.filter(i=>i.lagerort===l.id);
            if(!g.length) return null;
            const kg=(g.reduce((s,i)=>s+(i.gewicht||0)*i.menge,0)/1000);
            return <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{width:28}}>{l.emoji}</span>
              <span style={{flex:1,fontSize:13,color:C.text}}>{l.label}</span>
              <span style={{fontSize:12,color:C.gold}}>{g.length} Artikel</span>
              <span style={{fontSize:12,color:C.muted}}>{kg.toFixed(2)} kg</span>
            </div>;
          })}
        </ChartSection>
      )}

      {/* Fischfang-Log */}
      {fische.length>0&&(
        <ChartSection title="🎣 Fischfang-Log" C={C}>
          {[...fische].reverse().slice(0,8).map(f=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:16}}>🐟</span>
              <span style={{flex:1,fontSize:13,color:C.text}}>{f.name}</span>
              <span style={{fontSize:13,color:C.gold,fontWeight:"bold"}}>{f.gewicht}g</span>
              <span style={{fontSize:11,color:C.muted}}>{new Date(f.ts).toLocaleDateString("de-DE")}</span>
            </div>
          ))}
          <div style={{marginTop:8,fontSize:12,color:C.muted}}>Gesamt: <strong style={{color:C.gold}}>{(fische.reduce((s,f)=>s+f.gewicht,0)/1000).toFixed(2)} kg</strong> Fisch gefangen</div>
        </ChartSection>
      )}

      {/* History */}
      <ChartSection title={`📋 ${t("history")}`} C={C}>
        {topConsumed.length===0&&<div style={{textAlign:"center",padding:"16px 0",opacity:.4,fontStyle:"italic",fontSize:13}}>{t("noHistory")}</div>}
        {topConsumed.map(h=>(
          <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:16}}>{productIcon(h.itemName,"sonstiges")}</span>
            <span style={{flex:1,fontSize:13,color:C.text}}>{h.itemName}</span>
            <span style={{fontSize:13,color:C.red}}>−{h.amount} {h.einheit}</span>
            <span style={{fontSize:11,color:C.muted}}>{new Date(h.ts).toLocaleDateString("de-DE")}</span>
          </div>
        ))}
      </ChartSection>
    </div>
  );
}
function StatCard({label,value,emoji,C}){ return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}><div style={{fontSize:22}}>{emoji}</div><div style={{fontSize:20,fontWeight:"bold",color:C.gold}}>{value}</div><div style={{fontSize:11,color:C.muted,marginTop:2,letterSpacing:1}}>{label}</div></div>; }
function ChartSection({title,children,C}){ return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:14}}><div style={{fontSize:13,color:C.gold,fontWeight:"bold",marginBottom:12}}>{title}</div>{children}</div>; }
function BarRow({label,value,max,unit,fmt,color,C}){ const pct=Math.max(4,Math.round((value/max)*100)); return <div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.text,marginBottom:3}}><span>{label}</span><span style={{color:color}}>{fmt?fmt(value):value} {unit}</span></div><div style={{height:8,background:`${C.border}`,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:4,transition:"width .4s"}}/></div></div>; }
function SLbl({color,children}){ return <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color,marginBottom:8}}>{children}</div>; }

/* ═══════════════════════════════════════════════════════════════
   PLANUNG VIEW
══════════════════════════════════════════════════════════════════ */
function PlanungView() {
  const { C,t,items,reiseTage,setReiseTage,reisePersonen,setReisePersonen } = useApp();
  const bedarfItems = items.filter(i=>i.tagesbedarf>0);
  const totalGewicht = items.reduce((s,i)=>s+(i.gewicht||0)*i.menge,0);

  return (
    <div>
      {/* Settings */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{fontSize:13,color:C.gold,fontWeight:"bold",marginBottom:14}}>⚓ {t("planung")}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div><FLabel>{t("tage")}</FLabel><NudgeRow value={reiseTage} onMinus={()=>setReiseTage(v=>Math.max(1,v-1))} onPlus={()=>setReiseTage(v=>v+1)} C={C}/></div>
          <div><FLabel>{t("personen")}</FLabel><NudgeRow value={reisePersonen} onMinus={()=>setReisePersonen(v=>Math.max(1,v-1))} onPlus={()=>setReisePersonen(v=>v+1)} C={C}/></div>
        </div>
        <div style={{marginTop:12,padding:"8px 12px",background:`rgba(201,168,76,.08)`,borderRadius:8,fontSize:12,color:C.muted}}>🧮 {reiseTage} {t("tage")} × {reisePersonen} {t("personen")} = <strong style={{color:C.goldL}}>{reiseTage*reisePersonen}</strong> Personentage</div>
      </div>

      {/* Weight */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{fontSize:13,color:C.gold,fontWeight:"bold",marginBottom:12}}>⚖️ {t("totalWeight")}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
          <WeightStat label={t("totalWeight")} value={totalGewicht>=1000?`${(totalGewicht/1000).toFixed(1)} kg`:`${totalGewicht} g`} hi C={C}/>
          <WeightStat label="Mit Gewicht" value={`${items.filter(i=>i.gewicht>0).length}/${items.length}`} C={C}/>
          <WeightStat label={`∅/${t("personen").slice(0,-2)}`} value={totalGewicht>0?`${((totalGewicht/1000)/reisePersonen).toFixed(1)} kg`:"–"} C={C}/>
        </div>
        {KATEGORIEN.filter(k=>k.id!=="all").map(kat=>{ const g=items.filter(i=>i.kategorie===kat.id&&i.gewicht>0); if(!g.length) return null; const kg=(g.reduce((s,i)=>s+i.gewicht*i.menge,0)/1000); const pct=totalGewicht>0?Math.round((kg*1000/totalGewicht)*100):0; return <div key={kat.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><span style={{width:24}}>{kat.emoji}</span><div style={{flex:1,height:6,background:`${C.border}`,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.gold},${C.goldL})`,borderRadius:3}}/></div><span style={{fontSize:11,color:C.muted,width:52,textAlign:"right"}}>{kg.toFixed(2)} kg</span><span style={{fontSize:11,color:C.muted,width:28,textAlign:"right"}}>{pct}%</span></div>; })}
      </div>

      {/* Bedarf */}
      {/* Notfall-Reserve */}
      <div style={{background:C.card,border:`1px solid rgba(196,76,76,.3)`,borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{fontSize:13,color:C.red,fontWeight:"bold",marginBottom:8}}>🆘 Notfall-Reserve (Havarie +3 Tage)</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Empfohlener Mindestvorrat für Notfälle auf See</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {items.filter(i=>i.tagesbedarf>0).map(item=>{
            const normalBedarf=item.tagesbedarf*reisePersonen*reiseTage;
            const notfallBedarf=item.tagesbedarf*reisePersonen*(reiseTage+3);
            const reichtNormal=item.menge>=normalBedarf;
            const reichtNotfall=item.menge>=notfallBedarf;
            return <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:reichtNotfall?"rgba(61,158,82,.08)":"rgba(196,76,76,.08)",border:`1px solid ${reichtNotfall?"rgba(61,158,82,.3)":"rgba(196,76,76,.3)"}`}}>
              <span style={{fontSize:18}}>{productIcon(item.name,item.kategorie)}</span>
              <span style={{flex:1,fontSize:13,color:C.text}}>{item.name}</span>
              <span style={{fontSize:12,color:C.muted}}>Vorhanden: <strong style={{color:C.text}}>{item.menge}</strong></span>
              <span style={{fontSize:12,color:C.muted}}>+3T Bedarf: <strong style={{color:reichtNotfall?C.green:C.red}}>{notfallBedarf.toFixed(1)}</strong> {item.einheit}</span>
              <span style={{fontSize:16}}>{reichtNotfall?"✅":"⚠️"}</span>
            </div>;
          })}
          {items.filter(i=>i.tagesbedarf>0).length===0&&<div style={{textAlign:"center",padding:"12px 0",opacity:.4,fontSize:13}}>Tagesbedarf bei Artikeln setzen</div>}
        </div>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px"}}>
        <div style={{fontSize:13,color:C.gold,fontWeight:"bold",marginBottom:4}}>👥 Bedarfsberechnung</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Tagesbedarf/Person im Artikel setzen (Erweiterte Felder).</div>
        {bedarfItems.length===0&&<div style={{textAlign:"center",padding:"16px 0",opacity:.4,fontStyle:"italic",fontSize:13}}>Kein Tagesbedarf gesetzt.</div>}
        {bedarfItems.map(item=>{
          const bedarf=item.tagesbedarf*reisePersonen*reiseTage;
          const reicht=item.menge>=bedarf;
          const pct=Math.min(100,Math.round((item.menge/bedarf)*100));
          return <div key={item.id} style={{marginBottom:10,padding:"10px 12px",background:`rgba(255,255,255,.03)`,borderRadius:8,border:`1px solid ${reicht?"rgba(61,158,82,.3)":"rgba(196,76,76,.3)"}`}}>
            <div style={{display:"flex",gap:8,marginBottom:5}}><span>{productIcon(item.name,item.kategorie)}</span><span style={{flex:1,fontWeight:"bold",color:C.text,fontSize:14}}>{item.name}</span><span style={{fontSize:12,color:reicht?C.green:C.red,fontWeight:"bold"}}>{reicht?"✓":"✗"}</span></div>
            <div style={{height:6,background:`${C.border}`,borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${pct}%`,background:reicht?C.green:C.red,borderRadius:3,transition:"width .4s"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted}}><span>{t("available")}: <strong style={{color:C.text}}>{item.menge} {item.einheit}</strong></span><span>{t("needed")}: <strong style={{color:C.text}}>{bedarf.toFixed(1)}</strong></span><span style={{color:reicht?C.green:C.red}}>{pct}%</span></div>
          </div>;
        })}
      </div>
    </div>
  );
}
function NudgeRow({value,onMinus,onPlus,C}){ return <div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={onMinus} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,width:32,height:32,color:C.text,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><span style={{fontSize:22,fontWeight:"bold",color:C.goldL,minWidth:36,textAlign:"center"}}>{value}</span><button onClick={onPlus} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,width:32,height:32,color:C.text,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div>; }
function WeightStat({label,value,hi,C}){ return <div style={{textAlign:"center",padding:"8px 6px",background:`rgba(255,255,255,.04)`,borderRadius:8,border:`1px solid ${C.border}`}}><div style={{fontSize:15,fontWeight:"bold",color:hi?C.gold:C.text}}>{value}</div><div style={{fontSize:10,color:C.muted,marginTop:2,letterSpacing:1}}>{label}</div></div>; }

/* ═══════════════════════════════════════════════════════════════
   QUICK-ADD BAR
══════════════════════════════════════════════════════════════════ */
function QuickAddBar() {
  const { C,t,handleQuickAdd,setShowScanner } = useApp();
  const [text,setText] = useState("");
  const [hint,setHint] = useState(false);
  const submit = ()=>{ if(!text.trim()) return; handleQuickAdd(text); setText(""); setHint(false); };
  const parsed = text.trim()?parseQuick(text):null;
  const kat    = parsed?KATEGORIEN.find(k=>k.id===parsed.kategorie):null;
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        <button onClick={()=>setShowScanner(true)} style={{background:`rgba(201,168,76,.1)`,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 12px",color:C.gold,cursor:"pointer",fontSize:19,flexShrink:0}}>📷</button>
        <div style={{flex:1,position:"relative"}}>
          <input value={text} onChange={e=>{setText(e.target.value);setHint(true);}} onKeyDown={e=>e.key==="Enter"&&submit()} onFocus={()=>setHint(true)} onBlur={()=>setTimeout(()=>setHint(false),150)}
            placeholder='⚡ "Wasser 12 Liter" oder "Bier 6 Dose" + Enter'
            style={{width:"100%",background:C.inputBg,border:`1px solid rgba(201,168,76,.35)`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:14,outline:"none"}}/>
          {hint&&parsed&&parsed.name&&(
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.bg1||C.bg0,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",zIndex:10,display:"flex",alignItems:"center",gap:8,fontSize:13}}>
              <span>{kat?.emoji}</span><span style={{color:C.text,fontWeight:"bold"}}>{parsed.name}</span><span style={{color:C.gold}}>{parsed.menge} {parsed.einheit}</span><span style={{color:C.muted,marginLeft:"auto"}}>{kat?.label}</span>
            </div>
          )}
        </div>
        <button onClick={submit} style={{background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderRadius:10,padding:"10px 15px",color:"#1a0a00",fontWeight:"bold",cursor:"pointer",fontSize:18,flexShrink:0}}>+</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WARNING BAR
══════════════════════════════════════════════════════════════════ */
function WarningBar() {
  const { warnings,t,C } = useApp();
  const total = warnings.expired.length+warnings.expiringSoon.length+warnings.lowStock.length;
  if(!total) return null;
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
      {warnings.expired.length>0&&<WChip color={C.red} emoji="⛔" label={`${warnings.expired.length} ${t("expired")}`} items={warnings.expired.map(i=>`${i.name}`).join(", ")} C={C}/>}
      {warnings.expiringSoon.length>0&&<WChip color={C.orange} emoji="⚠️" label={`${warnings.expiringSoon.length} ${t("expiringSoon")}`} items={warnings.expiringSoon.map(i=>`${i.name} (${daysUntil(i.ablaufdatum)}d)`).join(", ")} C={C}/>}
      {warnings.lowStock.length>0&&<WChip color={C.gold} emoji="🔔" label={`${warnings.lowStock.length} ${t("lowStock")}`} items={warnings.lowStock.map(i=>`${i.name}`).join(", ")} C={C}/>}
    </div>
  );
}
function WChip({color,emoji,label,items,C}){
  const[open,set]=useState(false);
  return <div style={{flex:1,minWidth:160}}>
    <button onClick={()=>set(x=>!x)} style={{width:"100%",background:`rgba(128,128,128,.08)`,border:`1px solid ${color}44`,borderRadius:8,padding:"6px 11px",color,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontSize:12,textAlign:"left"}}>
      <span>{emoji}</span><span style={{flex:1,fontWeight:"bold"}}>{label}</span><span style={{opacity:.6}}>{open?"▲":"▼"}</span>
    </button>
    {open&&<div style={{background:C.card,border:`1px solid ${color}22`,borderRadius:"0 0 8px 8px",padding:"7px 11px",fontSize:11,color:C.muted,lineHeight:1.7}}>{items}</div>}
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP LAYOUT
══════════════════════════════════════════════════════════════════ */
function DesktopLayout() {
  const { C,t,stats,warnings,einkaufsliste,reiseName,setReiseName,editReise,setEditReise,view,setView,aktKat,setAktKat,items,openAdd,setShowExport,setShowSettings } = useApp();
  const warnCount = warnings.expired.length+warnings.expiringSoon.length+warnings.lowStock.length;
  return (
    <div style={{display:"flex",flex:1,maxWidth:1200,width:"100%",margin:"0 auto",padding:"0 24px 40px",gap:0}}>
      {/* SIDEBAR */}
      <aside style={{width:220,flexShrink:0,paddingTop:24,paddingRight:18,borderRight:`1px solid ${C.sidebarBorder}`,display:"flex",flexDirection:"column"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:3}}>⚓</div>
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:C.gold}}>Proviant</div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>v{VERSION}</div>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"11px 13px",marginBottom:16}}>
          <MStat label={t("inventar")} value={stats.gesamt} C={C}/>
          <MStat label={t("einkaufen")} value={einkaufsliste.length} hi={einkaufsliste.length>0} C={C}/>
          <MStat label="Warnungen" value={warnCount} warn={warnCount>0} C={C}/>
        </div>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:7}}>Navigation</div>
        <nav style={{display:"flex",flexDirection:"column",gap:3,marginBottom:16}}>
          {VIEWS.map(v=>{
            const act=view===v;
            const badge=v==="einkaufen"&&einkaufsliste.length>0?einkaufsliste.length:v==="inventar"&&warnCount>0?warnCount:0;
            return <button key={v} onClick={()=>setView(v)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,border:"none",cursor:"pointer",textAlign:"left",background:act?`linear-gradient(135deg,${C.gold},${C.goldL})`:"transparent",color:act?(C.bg0||"#0a1828"):C.text,fontFamily:"Georgia,serif",fontSize:13,transition:"background .15s"}}>
              <span>{VIEW_EMOJI[v]}</span><span style={{flex:1}}>{t(v)}</span>
              {badge>0&&<span style={{background:act?"rgba(0,0,0,.2)":C.red,color:"#fff",borderRadius:9,padding:"1px 6px",fontSize:11,fontWeight:"bold"}}>{badge}</span>}
            </button>;
          })}
        </nav>
        {view==="inventar"&&(
          <>
            <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:7}}>Kategorien</div>
            <nav style={{display:"flex",flexDirection:"column",gap:2,flex:1,overflowY:"auto"}}>
              {KATEGORIEN.map(kat=>{ const act=aktKat===kat.id; const cnt=kat.id==="all"?items.length:items.filter(i=>i.kategorie===kat.id).length; return <button key={kat.id} onClick={()=>setAktKat(kat.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 11px",borderRadius:8,border:"none",cursor:"pointer",background:act?`rgba(201,168,76,.15)`:"transparent",color:act?C.goldL:C.text,fontFamily:"Georgia,serif",fontSize:12}}><span>{kat.emoji}</span><span style={{flex:1}}>{kat.label}</span><span style={{fontSize:11,opacity:.5}}>{cnt}</span></button>; })}
            </nav>
          </>
        )}
        <div style={{marginTop:"auto",paddingTop:12,display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={()=>setShowSettings(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 0",color:C.muted,cursor:"pointer",fontSize:13}}>⚙️ {t("settings")}</button>
          <button onClick={()=>setShowExport(true)}   style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 0",color:C.gold,cursor:"pointer",fontSize:13}}>⬇ {t("exportBackup")}</button>
        </div>
      </aside>
      {/* MAIN */}
      <main style={{flex:1,paddingTop:24,paddingLeft:24,overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18,gap:14}}>
          <div>
            {editReise?<input value={reiseName} onChange={e=>setReiseName(e.target.value)} onBlur={()=>setEditReise(false)} onKeyDown={e=>e.key==="Enter"&&setEditReise(false)} autoFocus style={{background:C.inputBg,border:`1px solid ${C.gold}`,color:C.text,borderRadius:6,padding:"4px 12px",fontSize:22,outline:"none"}}/>
              :<h1 onClick={()=>setEditReise(true)} style={{margin:0,fontSize:24,fontStyle:"italic",color:C.text,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:9}}>{reiseName}<span style={{fontSize:13,color:C.gold}}>✏️</span></h1>}
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>{new Date().toLocaleDateString("de-DE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          </div>
          {view==="inventar"&&<button onClick={openAdd} style={{background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderRadius:11,padding:"10px 18px",color:"#1a0a00",fontWeight:"bold",fontSize:14,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>+ {t("add").replace("+ ","")}</button>}
        </div>
        <ActiveView/>
        <div style={{textAlign:"center",marginTop:36,opacity:.15}}><span style={{fontSize:18}}>🧭</span><div style={{fontSize:10,letterSpacing:4,marginTop:3,textTransform:"uppercase"}}>{t("goodTrip")}</div></div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE LAYOUT
══════════════════════════════════════════════════════════════════ */
function MobileNav() {
  const { C,t,view,setView,einkaufsliste,warnings,openAdd,setShowSettings,setShowFischlog,printPDF } = useApp();
  const [showMore, setShowMore] = useState(false);
  const warnCount = warnings.expired.length+warnings.expiringSoon.length+warnings.lowStock.length;

  // Primary 5 tabs shown always
  const PRIMARY = ["inventar","einkaufen","stauraum","mahlzeiten","planung"];
  // Secondary tabs in "mehr" drawer
  const SECONDARY = ["statistik"];

  const NavBtn = ({v, label, emoji, badge, warn}) => {
    const act = view===v;
    return (
      <button onClick={()=>{setView(v);setShowMore(false);}} style={{flex:1,background:"transparent",border:"none",borderTop:act?`2px solid ${C.gold}`:"2px solid transparent",padding:"7px 2px 10px",color:act?C.gold:C.muted,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative",minWidth:0}}>
        <span style={{fontSize:20}}>{emoji}</span>
        <span style={{fontSize:8,letterSpacing:.3,textAlign:"center",lineHeight:1.1,maxWidth:44,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
        {(badge>0||warn)&&<span style={{position:"absolute",top:4,right:"50%",transform:"translateX(10px)",background:C.red,color:"#fff",borderRadius:8,padding:"0 4px",minWidth:14,textAlign:"center",fontSize:9,fontWeight:"bold"}}>{badge||"!"}</span>}
      </button>
    );
  };

  return (
    <>
      {/* More drawer */}
      {showMore&&(
        <div style={{position:"fixed",bottom:64,left:0,right:0,background:C.navBg,borderTop:`1px solid ${C.border}`,zIndex:49,padding:"8px 0",animation:"slideUp .2s ease"}}>
          <div style={{display:"flex",justifyContent:"space-around",padding:"4px 0"}}>
            {SECONDARY.map(v=>(
              <button key={v} onClick={()=>{setView(v);setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 20px",background:view===v?`rgba(201,168,76,.12)`:"transparent",border:"none",color:view===v?C.gold:C.text,cursor:"pointer",borderRadius:10}}>
                <span style={{fontSize:24}}>{VIEW_EMOJI[v]}</span>
                <span style={{fontSize:11}}>{t(v)}</span>
              </button>
            ))}
            <button onClick={()=>{setShowFischlog(true);setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 20px",background:"transparent",border:"none",color:C.green,cursor:"pointer",borderRadius:10}}>
              <span style={{fontSize:24}}>🎣</span>
              <span style={{fontSize:11}}>Fischfang</span>
            </button>
            <button onClick={()=>{printPDF();setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 20px",background:"transparent",border:"none",color:C.gold,cursor:"pointer",borderRadius:10}}>
              <span style={{fontSize:24}}>🖨️</span>
              <span style={{fontSize:11}}>PDF</span>
            </button>
            <button onClick={()=>{setShowSettings(true);setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 20px",background:"transparent",border:"none",color:C.muted,cursor:"pointer",borderRadius:10}}>
              <span style={{fontSize:24}}>⚙️</span>
              <span style={{fontSize:11}}>{t("settings")}</span>
            </button>
          </div>
        </div>
      )}
      {/* Main nav bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.navBg,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"stretch",zIndex:50}}>
        <NavBtn v="inventar"  label="Inventar"  emoji="📦" badge={warnCount>0?warnCount:0}/>
        <NavBtn v="einkaufen" label="Einkaufen" emoji="🛒" badge={einkaufsliste.length}/>
        <NavBtn v="stauraum"  label="Stauraum"  emoji="🗂️"/>
        <NavBtn v="mahlzeiten"label="Mahlzeiten"emoji="🍽️"/>
        <NavBtn v="planung"   label="Planung"   emoji="🗓️"/>
        {/* Add / More button */}
        {view==="inventar"
          ? <button onClick={openAdd} style={{flex:1,background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderTop:"2px solid transparent",padding:"7px 2px 10px",color:"#1a0a00",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontWeight:"bold"}}>
              <span style={{fontSize:22}}>＋</span>
              <span style={{fontSize:8}}>Hinzufügen</span>
            </button>
          : <button onClick={()=>setShowMore(x=>!x)} style={{flex:1,background:showMore?`rgba(201,168,76,.12)`:"transparent",border:"none",borderTop:showMore?`2px solid ${C.gold}`:"2px solid transparent",padding:"7px 2px 10px",color:showMore?C.gold:C.muted,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:20}}>⋯</span>
              <span style={{fontSize:8}}>Mehr</span>
            </button>
        }
      </div>
    </>
  );
}

function MobileLayout() {
  const { C,t,stats,warnings,einkaufsliste,reiseName,setReiseName,editReise,setEditReise,view,setView,openAdd,setShowExport,setShowSettings } = useApp();
  const warnCount = warnings.expired.length+warnings.expiringSoon.length+warnings.lowStock.length;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",paddingBottom:70}}>
      {/* Header */}
      <div style={{padding:"14px 14px 0",textAlign:"center"}}>
        <div style={{fontSize:30,marginBottom:2}}>⚓</div>
        <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:C.gold}}>Proviant</div>
        <div style={{fontSize:10,color:C.muted,marginBottom:3}}>v{VERSION}</div>
        {editReise?<input value={reiseName} onChange={e=>setReiseName(e.target.value)} onBlur={()=>setEditReise(false)} onKeyDown={e=>e.key==="Enter"&&setEditReise(false)} autoFocus style={{background:C.inputBg,border:`1px solid ${C.gold}`,color:C.text,borderRadius:8,padding:"5px 12px",fontSize:16,outline:"none",width:"90%",textAlign:"center"}}/>
          :<h2 onClick={()=>setEditReise(true)} style={{margin:0,fontSize:17,fontStyle:"italic",color:C.text,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7}}>{reiseName}<span style={{fontSize:11,color:C.gold}}>✏️</span></h2>}
        <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:9,marginBottom:11,padding:"7px 0",borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
          <MStatH label={t("inventar")} value={stats.gesamt} C={C}/>
          <div style={{width:1,background:C.border}}/>
          <MStatH label={t("einkaufen")} value={einkaufsliste.length} warn={einkaufsliste.length>0} C={C}/>
          <div style={{width:1,background:C.border}}/>
          <MStatH label="⚠️" value={warnCount} warn={warnCount>0} C={C}/>
        </div>
      </div>
      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"0 11px"}}><ActiveView/></div>
      {/* Bottom nav - 5 main + more drawer */}
      <MobileNav/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════════════════ */
function ArticleFormModal() {
  const { C,t,form,setForm,editItem,saveForm,setShowForm,formExtra,setFormExtra } = useApp();
  return (
    <BottomSheet onClose={()=>setShowForm(false)}>
      <h3 style={{margin:"0 0 14px",fontSize:17,color:C.gold,fontStyle:"italic"}}>{editItem?"✏️ "+t("edit"):"⊕ "+t("add")}</h3>
      <FLabel>{t("name")}</FLabel><FInput value={form.name} onChange={v=>{ const newEinheit=form.einheit==="Stück"?guessEinheit(v):form.einheit; setForm({...form,name:v,einheit:newEinheit,gewicht:form.gewicht===0?guessGewicht(v,newEinheit):form.gewicht}); }} placeholder="z.B. Olivenöl" C={C}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><FLabel>{t("menge")}</FLabel><FInput type="number" value={form.menge} onChange={v=>setForm({...form,menge:parseFloat(v)||0})} C={C}/></div>
        <div><FLabel>{t("einheit")}</FLabel><FSelect value={form.einheit} onChange={v=>setForm({...form,einheit:v,gewicht:form.gewicht===0||form.gewicht===guessGewicht(form.name,form.einheit)?guessGewicht(form.name,v):form.gewicht})} options={EINHEITEN} C={C}/></div>
      </div>
      <FLabel>{t("kategorie")}</FLabel>
      <FSelect value={form.kategorie} onChange={v=>setForm({...form,kategorie:v,einheit:v==="getraenke"&&form.einheit==="Stück"?"Liter":form.einheit})} options={KATEGORIEN.filter(k=>k.id!=="all").map(k=>({value:k.id,label:`${k.emoji} ${k.label}`}))} isObj C={C}/>
      <FLabel>{t("notiz")}</FLabel><FInput value={form.notiz} onChange={v=>setForm({...form,notiz:v})} placeholder="z.B. Marke..." C={C}/>
      <FLabel>📦 Stauraum</FLabel>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
        {LAGERORTE.map(l=><button key={l.id} onClick={()=>setForm({...form,lagerort:l.id})} style={{padding:"6px 11px",borderRadius:20,border:`1px solid ${form.lagerort===l.id?C.gold:C.border}`,background:form.lagerort===l.id?`rgba(201,168,76,.15)`:"transparent",color:form.lagerort===l.id?C.gold:C.muted,cursor:"pointer",fontSize:13}}>{l.emoji} {l.label}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><FLabel>💰 Preis (€/Einheit)</FLabel><FInput type="number" value={form.preis} onChange={v=>setForm({...form,preis:parseFloat(v)||0})} placeholder="z.B. 1.50" C={C}/></div>
        <div><FLabel>📍 Kaufort (Hafen)</FLabel><FInput value={form.kaufort} onChange={v=>setForm({...form,kaufort:v})} placeholder="z.B. Palma" C={C}/></div>
      </div>
      <button onClick={()=>setFormExtra(x=>!x)} style={{marginTop:13,width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",color:C.gold,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        {formExtra?"▲":"▼"} {t("extendedFields")}
      </button>
      {formExtra&&<div style={{marginTop:4,padding:"12px",background:`rgba(255,255,255,.03)`,borderRadius:10,border:`1px solid ${C.border}`}}>

        {/* Ablaufdatum + Mindestbestand */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <FLabel>📅 {t("ablaufdatum")}</FLabel>
            <FInput type="date" value={form.ablaufdatum} onChange={v=>setForm({...form,ablaufdatum:v})} C={C}/>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>Warnmeldung vor Ablauf</div>
          </div>
          <div>
            <FLabel>🔔 {t("mindestbestand")}</FLabel>
            <FInput type="number" value={form.mindestbestand} onChange={v=>setForm({...form,mindestbestand:parseFloat(v)||0})} C={C}/>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>Alarm wenn Menge darunter</div>
          </div>
        </div>

        {/* Gewicht + Tagesbedarf */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          <div>
            <FLabel>⚖️ Gewicht pro {form.einheit} in g {form.einheit==="Liter"?"(1L=1000g)":form.einheit==="kg"?"(1kg=1000g)":form.einheit==="Flasche"?"(0.5L=500g, 1L=1000g)":form.einheit==="Dose"?"(Thunfisch≈185g)":""}</FLabel>
            <FInput type="number" value={form.gewicht} onChange={v=>setForm({...form,gewicht:parseFloat(v)||0})} placeholder={guessGewicht(form.name,form.einheit)||"z.B. 500"} C={C}/>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>
              {form.einheit==="Liter"?"1 Liter = 1000g = 1kg":form.einheit==="kg"?"1 kg = 1000g":"In Gramm eingeben"}
            </div>
          </div>
          <div>
            <FLabel>🧑 Tagesbedarf pro Person</FLabel>
            {(form.einheit==="Packung"||form.einheit==="Stück"||form.einheit==="Beutel"||form.einheit==="Flasche"||form.einheit==="Dose")&&form.gewicht>0 ? (
              <TagesbedarfKonverter form={form} setForm={setForm} C={C}/>
            ) : (
              <>
                <FInput type="number" value={form.tagesbedarf} onChange={v=>setForm({...form,tagesbedarf:parseFloat(v)||0})} placeholder={form.kategorie==="getraenke"?"3":"z.B. 1"} C={C}/>
                <div style={{fontSize:10,color:C.muted,marginTop:3}}>
                  {form.kategorie==="getraenke"
                    ?"💡 Wasser: 3 Liter · Saft: 0.5 Liter pro Person"
                    :form.tagesbedarf>0
                      ?`→ ${form.tagesbedarf} ${form.einheit}/Person/Tag`
                      :"0 = nicht in Planung verwenden"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gesamtvorschau */}
        {(form.gewicht>0||form.tagesbedarf>0)&&(
          <div style={{marginTop:10,padding:"8px 10px",background:`rgba(201,168,76,.08)`,borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,color:C.muted,display:"flex",gap:14,flexWrap:"wrap"}}>
            {form.gewicht>0&&<span>⚖️ Gesamt: <strong style={{color:C.gold}}>{((form.gewicht*form.menge)/1000).toFixed(2)} kg</strong></span>}
            {form.tagesbedarf>0&&<span>📅 7T/2P = <strong style={{color:C.gold}}>{(form.tagesbedarf*7*2).toFixed(1)} {form.einheit}</strong></span>}
          </div>
        )}

        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:9}}>
          <input type="checkbox" id="ekf" checked={form.einkaufen} onChange={e=>setForm({...form,einkaufen:e.target.checked})} style={{width:17,height:17,accentColor:C.gold,cursor:"pointer"}}/>
          <label htmlFor="ekf" style={{fontSize:13,color:C.text,cursor:"pointer"}}>🛒 {t("einkaufen")}</label>
        </div>
      </div>}
      <div style={{display:"flex",gap:9,marginTop:16}}>
        <button onClick={()=>setShowForm(false)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,color:C.muted,cursor:"pointer",fontSize:14}}>{t("cancel")}</button>
        <button onClick={saveForm} style={{flex:2,background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderRadius:10,padding:12,color:"#1a0a00",fontWeight:"bold",cursor:"pointer",fontSize:14}}>{editItem?t("save"):t("add")}</button>
      </div>
    </BottomSheet>
  );
}

function TagesbedarfKonverter({ form, setForm, C }) {
  // Only reverse-calculate if result is plausible (< 100g/day per unit seems sane)
  const initGram = () => {
    if (form.tagesbedarf > 0 && form.gewicht > 0) {
      const calc = form.tagesbedarf * form.gewicht;
      // Only prefill if result is a realistic daily gram amount (<= 500g)
      return calc <= 500 ? String(calc) : "";
    }
    return "";
  };
  const [gramProTag, setGramProTag] = useState(initGram);

  const handleGramChange = (v) => {
    setGramProTag(v);
    const g = parseFloat(v);
    if (g > 0 && form.gewicht > 0) {
      setForm({ ...form, tagesbedarf: Math.round((g / form.gewicht) * 10000) / 10000 });
    } else if (!v || v === "0") {
      setForm({ ...form, tagesbedarf: 0 });
    }
  };

  const gPerTag = parseFloat(gramProTag) || 0;
  const perEinheit = form.gewicht > 0 ? gPerTag / form.gewicht : 0;

  return (
    <div>
      <div style={{position:"relative",marginBottom:6}}>
        <input
          type="number"
          value={gramProTag}
          onChange={e=>handleGramChange(e.target.value)}
          placeholder="z.B. 6"
          style={{width:"100%",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 70px 9px 11px",color:C.text,fontSize:14,outline:"none"}}
        />
        <span style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.muted,pointerEvents:"none"}}>g/Person/Tag</span>
      </div>
      {gPerTag > 0 && form.gewicht > 0 && (
        <div style={{fontSize:12,background:`rgba(201,168,76,.08)`,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",lineHeight:1.7}}>
          <div><strong style={{color:C.goldL}}>{gPerTag}g</strong> <span style={{color:C.muted}}>÷</span> <strong style={{color:C.goldL}}>{form.gewicht}g</strong> <span style={{color:C.muted}}>pro {form.einheit}</span></div>
          <div>= <strong style={{color:C.gold}}>{perEinheit.toFixed(4)} {form.einheit}</strong> <span style={{color:C.muted}}>pro Person pro Tag</span></div>
        </div>
      )}
      {form.gewicht === 0 && (
        <div style={{fontSize:11,color:C.orange,marginTop:3}}>⚠️ Zuerst Gewicht pro {form.einheit} oben eingeben</div>
      )}
    </div>
  );
}

function RecipeFormModal() {
  const { C,t,recipeForm,setRecipeForm,editRecipe,saveRecipe,setShowRecipe } = useApp();
  const addZ=()=>setRecipeForm(r=>({...r,zutaten:[...r.zutaten,{name:"",menge:1,einheit:"Stück"}]}));
  const updZ=(i,k,v)=>setRecipeForm(r=>({...r,zutaten:r.zutaten.map((z,j)=>j===i?{...z,[k]:v}:z)}));
  const delZ=i=>setRecipeForm(r=>({...r,zutaten:r.zutaten.filter((_,j)=>j!==i)}));
  return (
    <BottomSheet onClose={()=>setShowRecipe(false)}>
      <h3 style={{margin:"0 0 14px",fontSize:17,color:C.gold,fontStyle:"italic"}}>{editRecipe?"✏️ "+t("edit"):"🍽️ "+t("addRecipe")}</h3>
      <FLabel>{t("name")}</FLabel><FInput value={recipeForm.name} onChange={v=>setRecipeForm({...recipeForm,name:v})} placeholder="z.B. Pasta Bolognese" C={C}/>
      <FLabel>{t("portions")}</FLabel><FInput type="number" value={recipeForm.portionen} onChange={v=>setRecipeForm({...recipeForm,portionen:parseInt(v)||1})} C={C}/>
      <FLabel>{t("ingredients")}</FLabel>
      {recipeForm.zutaten.map((z,i)=>(
        <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 32px",gap:6,marginBottom:6}}>
          <FInput value={z.name} onChange={v=>updZ(i,"name",v)} placeholder="Zutat" C={C}/>
          <FInput type="number" value={z.menge} onChange={v=>updZ(i,"menge",parseFloat(v)||0)} C={C}/>
          <FSelect value={z.einheit} onChange={v=>updZ(i,"einheit",v)} options={EINHEITEN} C={C}/>
          <button onClick={()=>delZ(i)} style={{background:"rgba(196,76,76,.1)",border:`1px solid ${C.red}44`,borderRadius:7,color:C.red,cursor:"pointer",fontSize:14}}>✕</button>
        </div>
      ))}
      <button onClick={addZ} style={{width:"100%",background:C.card,border:`1px dashed ${C.border}`,borderRadius:8,padding:"8px",color:C.muted,cursor:"pointer",fontSize:13,marginTop:4}}>{t("addIngredient")}</button>
      <div style={{display:"flex",gap:9,marginTop:16}}>
        <button onClick={()=>setShowRecipe(false)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,color:C.muted,cursor:"pointer",fontSize:14}}>{t("cancel")}</button>
        <button onClick={saveRecipe} style={{flex:2,background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderRadius:10,padding:12,color:"#1a0a00",fontWeight:"bold",cursor:"pointer",fontSize:14}}>{t("save")}</button>
      </div>
    </BottomSheet>
  );
}

function ExportModal() {
  const { C,t,einkaufsliste,items,reiseName,setShowExport,expCSV,expTXT,expEinkauf,expJSON,impJSON,fileRef,setItems,setReiseName,setReiseTage,setReisePersonen,setNextId,setRecipes,toast_,printPDF } = useApp();
  return (
    <BottomSheet onClose={()=>setShowExport(false)}>
      <h3 style={{margin:"0 0 4px",fontSize:17,color:C.gold,fontStyle:"italic"}}>⬇ {t("exportBackup")}</h3>
      <p style={{margin:"0 0 14px",fontSize:12,color:C.muted}}>{items.length} Artikel · {reiseName}</p>
      <SectionLabel C={C}>Export</SectionLabel>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
        <EBtn emoji="📊" label={t("exportCSV")} desc="Excel/Numbers kompatibel" onClick={expCSV} C={C}/>
        <EBtn emoji="📋" label={t("exportTXT")} desc="Druckbare Checkliste" onClick={expTXT} C={C}/>
        <EBtn emoji="🛒" label={t("exportEinkauf")} desc={`${einkaufsliste.length} Artikel`} onClick={expEinkauf} C={C}/>
      </div>
      <div style={{height:1,background:C.border,marginBottom:12}}/>
      <SectionLabel C={C}>Backup</SectionLabel>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
        <EBtn emoji="💾" label={t("saveBackup")} desc="JSON inkl. Rezepte" onClick={expJSON} gold C={C}/>
        <EBtn emoji="📂" label={t("loadBackup")} desc="JSON-Datei importieren" onClick={()=>fileRef.current?.click()} gold C={C}/>
      </div>
      <input ref={fileRef} type="file" accept=".json" onChange={impJSON} style={{display:"none"}}/>
      <div style={{height:1,background:C.border,marginBottom:12}}/>
      <div style={{height:1,background:C.border,marginBottom:12}}/>
      <SectionLabel C={C}>🖨️ Drucken</SectionLabel>
      <EBtn emoji="🖨️" label="PDF Packliste drucken" desc="Öffnet Druckdialog im Browser" onClick={()=>{printPDF();setShowExport(false);}} C={C}/>
      <div style={{height:1,background:C.border,marginBottom:12,marginTop:12}}/>
      <SectionLabel C={C}>{t("deviceStorage")}</SectionLabel>
      <EBtn emoji="🗑️" label={t("deleteAll")} desc="Lokalen Speicher leeren" onClick={()=>{ if(window.confirm(t("deleteConfirm"))){ Object.values(LS).forEach(k=>localStorage.removeItem(k)); setItems(STARTER); setReiseName("Mittelmeer Tour 2025"); setReiseTage(7); setReisePersonen(2); setNextId(20); setRecipes(STARTER_RECIPES); toast_(t("deleteAll")+" ✓","err"); setShowExport(false); } }} C={C}/>
      <button onClick={()=>setShowExport(false)} style={{marginTop:14,width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:11,color:C.muted,cursor:"pointer",fontSize:13}}>{t("cancel")}</button>
    </BottomSheet>
  );
}

function SettingsModal() {
  const { C,t,theme,setTheme,lang,setLang,notifPerm,enableNotifications,setShowSettings } = useApp();
  return (
    <BottomSheet onClose={()=>setShowSettings(false)}>
      <h3 style={{margin:"0 0 18px",fontSize:17,color:C.gold,fontStyle:"italic"}}>⚙️ {t("settings")}</h3>
      <SectionLabel C={C}>{t("theme")}</SectionLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {["dark","light"].map(th=><button key={th} onClick={()=>setTheme(th)} style={{padding:"10px",borderRadius:10,border:`2px solid ${theme===th?C.gold:C.border}`,background:theme===th?`rgba(201,168,76,.12)`:C.card,color:theme===th?C.gold:C.muted,cursor:"pointer",fontSize:14}}>{th==="dark"?"🌙 Dark":"☀️ Light"}</button>)}
      </div>
      <SectionLabel C={C}>{t("lang")}</SectionLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[["de","🇩🇪 DE"],["en","🇬🇧 EN"],["es","🇪🇸 ES"]].map(([l,label])=><button key={l} onClick={()=>setLang(l)} style={{padding:"10px",borderRadius:10,border:`2px solid ${lang===l?C.gold:C.border}`,background:lang===l?`rgba(201,168,76,.12)`:C.card,color:lang===l?C.gold:C.muted,cursor:"pointer",fontSize:14}}>{label}</button>)}
      </div>
      <SectionLabel C={C}>{t("notifications")}</SectionLabel>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:10}}>{t("notifInfo")}</div>
        <button onClick={notifPerm==="granted"?null:enableNotifications} style={{width:"100%",background:notifPerm==="granted"?`rgba(61,158,82,.15)`:`rgba(201,168,76,.12)`,border:`1px solid ${notifPerm==="granted"?C.green:C.gold}`,borderRadius:9,padding:"10px",color:notifPerm==="granted"?C.green:C.gold,cursor:notifPerm==="granted"?"default":"pointer",fontSize:14}}>
          {notifPerm==="granted"?t("notifEnabled"):t("notifEnable")}
        </button>
      </div>
      <button onClick={()=>setShowSettings(false)} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:11,color:C.muted,cursor:"pointer",fontSize:13}}>{t("cancel")}</button>
    </BottomSheet>
  );
}

function FischlogModal() {
  const { C,t,logFisch,setShowFischlog,fische } = useApp();
  const [name,setName]   = useState("Fisch");
  const [gewicht,setGewicht] = useState("");
  const FISCHARTEN = ["Fisch","Dorade","Wolfsbarsch","Thunfisch","Bonito","Makrele","Barrakuda","Mahi-Mahi"];
  const submit = () => {
    const g = parseFloat(gewicht);
    if(!g||g<=0) return;
    logFisch(name, g);
    setGewicht("");
    setShowFischlog(false);
  };
  return (
    <BottomSheet onClose={()=>setShowFischlog(false)}>
      <h3 style={{margin:"0 0 14px",fontSize:17,color:C.green,fontStyle:"italic"}}>🎣 Fischfang loggen</h3>
      <FLabel>Fischart</FLabel>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
        {FISCHARTEN.map(f=><button key={f} onClick={()=>setName(f)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${name===f?C.green:C.border}`,background:name===f?`rgba(61,158,82,.15)`:"transparent",color:name===f?C.green:C.muted,cursor:"pointer",fontSize:13}}>🐟 {f}</button>)}
      </div>
      <FLabel>Eigener Name</FLabel>
      <FInput value={name} onChange={setName} placeholder="z.B. Dorade" C={C}/>
      <FLabel>Gewicht (g)</FLabel>
      <div style={{position:"relative"}}>
        <FInput type="number" value={gewicht} onChange={setGewicht} placeholder="z.B. 850" C={C}/>
        {parseFloat(gewicht)>0&&<div style={{marginTop:4,fontSize:12,color:C.muted}}>= <strong style={{color:C.green}}>{(parseFloat(gewicht)/1000).toFixed(3)} kg</strong> · wird in Kühlbox Inventar gebucht</div>}
      </div>
      {fische.length>0&&(
        <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.muted,marginBottom:8}}>BISHERIGE FÄNGE</div>
          {[...fische].reverse().slice(0,5).map(f=>(
            <div key={f.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",color:C.text}}>
              <span>🐟 {f.name}</span><span style={{color:C.gold}}>{f.gewicht}g</span><span style={{color:C.muted,fontSize:11}}>{new Date(f.ts).toLocaleDateString("de-DE")}</span>
            </div>
          ))}
          <div style={{marginTop:8,fontSize:12,color:C.muted}}>Gesamt: <strong style={{color:C.green}}>{(fische.reduce((s,f)=>s+f.gewicht,0)/1000).toFixed(2)} kg</strong></div>
        </div>
      )}
      <div style={{display:"flex",gap:9,marginTop:16}}>
        <button onClick={()=>setShowFischlog(false)} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,color:C.muted,cursor:"pointer",fontSize:14}}>{t("cancel")}</button>
        <button onClick={submit} disabled={!gewicht||parseFloat(gewicht)<=0} style={{flex:2,background:parseFloat(gewicht)>0?`linear-gradient(135deg,${C.green},#5cb87a)`:"rgba(128,128,128,.2)",border:"none",borderRadius:10,padding:12,color:parseFloat(gewicht)>0?"#fff":C.muted,fontWeight:"bold",cursor:parseFloat(gewicht)>0?"pointer":"default",fontSize:14}}>🎣 Fisch ins Inventar</button>
      </div>
    </BottomSheet>
  );
}

function QRModal() {
  const { C,t,einkaufsliste,reiseName,setShowQR } = useApp();
  const text = einkaufsliste.map(i=>`${i.name} (${i.menge||i.mindestbestand} ${i.einheit})`).join("\n");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${reiseName}\n\n${text}`)}`;
  return (
    <BottomSheet onClose={()=>setShowQR(false)}>
      <h3 style={{margin:"0 0 4px",fontSize:17,color:C.gold,fontStyle:"italic"}}>📱 {t("crewShare")}</h3>
      <p style={{margin:"0 0 16px",fontSize:12,color:C.muted}}>{t("qrInfo")}</p>
      <div style={{textAlign:"center",marginBottom:16}}>
        <img src={qrUrl} alt="QR Code" style={{width:220,height:220,borderRadius:12,border:`2px solid ${C.border}`}}/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:12,maxHeight:120,overflowY:"auto"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:6,letterSpacing:1}}>{t("einkaufen").toUpperCase()}</div>
        {einkaufsliste.map((i,idx)=><div key={idx} style={{fontSize:13,color:C.text,padding:"2px 0"}}>{productIcon(i.name,i.kategorie)} {i.name} — {i.menge||i.mindestbestand} {i.einheit}</div>)}
      </div>
      <button onClick={()=>{ navigator.clipboard?.writeText(text).then(()=>{}); }} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",color:C.gold,cursor:"pointer",fontSize:13,marginBottom:8}}>📋 Text kopieren</button>
      <button onClick={()=>setShowQR(false)} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:11,color:C.muted,cursor:"pointer",fontSize:13}}>{t("cancel")}</button>
    </BottomSheet>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BARCODE SCANNER
══════════════════════════════════════════════════════════════════ */
function BarcodeScanner() {
  const { C,t,mobile,handleBarcodeResult,setShowScanner } = useApp();
  const videoRef=useRef(null); const streamRef=useRef(null); const rafRef=useRef(null);
  const [status,setStatus]=useState("init"); const [manual,setManual]=useState("");
  const stop=useCallback(()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current); if(streamRef.current) streamRef.current.getTracks().forEach(tr=>tr.stop()); },[]);
  useEffect(()=>{
    let cancelled=false;
    async function start(){
      if(!("BarcodeDetector" in window)){ setStatus("unsupported"); return; }
      try{
        const det=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","qr_code"]});
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
        if(cancelled){ stream.getTracks().forEach(tr=>tr.stop()); return; }
        streamRef.current=stream;
        if(videoRef.current){ videoRef.current.srcObject=stream; await videoRef.current.play(); }
        setStatus("scanning");
        async function scan(){ if(cancelled||!videoRef.current||videoRef.current.readyState<2){ rafRef.current=requestAnimationFrame(scan); return; } try{ const bc=await det.detect(videoRef.current); if(bc.length>0&&!cancelled){ cancelled=true; stop(); handleBarcodeResult(bc[0].rawValue); return; } }catch{} rafRef.current=requestAnimationFrame(scan); }
        scan();
      }catch{ if(!cancelled) setStatus("error"); }
    }
    start(); return()=>{ cancelled=true; stop(); };
  },[handleBarcodeResult,stop]);
  const submit=()=>{ if(manual.trim().length>3){ stop(); handleBarcodeResult(manual.trim()); } };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(2,8,18,.96)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)"}}>
        <div><div style={{fontSize:14,fontWeight:"bold",color:C.gold}}>📷 Scanner</div><div style={{fontSize:11,color:C.muted}}>Barcode richten…</div></div>
        <button onClick={()=>{stop();setShowScanner(false);}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,padding:"7px 13px",color:"#fff",cursor:"pointer",fontSize:14}}>✕</button>
      </div>
      {status==="scanning"&&(
        <div style={{position:"relative",width:mobile?"100%":"520px",maxWidth:"100%",aspectRatio:"4/3",overflow:"hidden",borderRadius:mobile?0:14,border:`2px solid ${C.borderHi}`}}>
          <video ref={videoRef} playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          <div style={{position:"absolute",inset:0}}>
            {[["0%","0%"],["100%","0%"],["0%","100%"],["100%","100%"]].map(([l,tp],i)=>(
              <div key={i} style={{position:"absolute",left:l,top:tp,transform:`translate(${l==="0%"?0:"-100%"},${tp==="0%"?0:"-100%"})`,width:30,height:30,borderTop:tp==="0%"?`3px solid ${C.gold}`:"none",borderBottom:tp==="100%"?`3px solid ${C.gold}`:"none",borderLeft:l==="0%"?`3px solid ${C.gold}`:"none",borderRight:l==="100%"?`3px solid ${C.gold}`:"none"}}/>
            ))}
            <div style={{position:"absolute",left:"8%",right:"8%",height:2,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,animation:"scanline 2s ease-in-out infinite"}}/>
          </div>
        </div>
      )}
      {status==="init"&&<div style={{textAlign:"center",color:C.muted,padding:40}}><div style={{fontSize:44,animation:"pulse 1.5s infinite"}}>📷</div><div style={{marginTop:10}}>{t("loading")}</div></div>}
      {(status==="unsupported"||status==="error")&&<div style={{textAlign:"center",padding:28,maxWidth:320}}><div style={{fontSize:40,marginBottom:10}}>{status==="error"?"🔒":"⚠️"}</div><div style={{color:C.goldL,fontSize:14,marginBottom:8}}>{status==="error"?"Kein Kamera-Zugriff":"Browser nicht unterstützt"}</div><div style={{color:C.muted,fontSize:12}}>Barcode unten manuell eingeben:</div></div>}
      <div style={{marginTop:16,width:mobile?"100%":"520px",maxWidth:"100%",padding:"0 18px"}}>
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:6,letterSpacing:1}}>– oder Nummer eingeben –</div>
        <div style={{display:"flex",gap:7}}>
          <input value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="4006381333931" style={{flex:1,background:"rgba(255,255,255,.08)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:"#fff",fontSize:14,outline:"none"}}/>
          <button onClick={submit} style={{background:`linear-gradient(135deg,${C.gold},${C.goldL})`,border:"none",borderRadius:10,padding:"10px 16px",color:"#1a0a00",fontWeight:"bold",cursor:"pointer",fontSize:13}}>Suchen</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════════ */
function BottomSheet({children,onClose}){
  const { C,mobile } = useApp();
  return <div style={{position:"fixed",inset:0,background:"rgba(4,12,28,.88)",display:"flex",alignItems:mobile?"flex-end":"center",justifyContent:"center",zIndex:200,animation:"fadeIn .2s ease"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:C.modalBg,border:`1px solid ${C.borderHi}`,borderRadius:mobile?"20px 20px 0 0":"16px",padding:mobile?"22px 16px 28px":"24px",width:"100%",maxWidth:mobile?"100%":"460px",boxShadow:"0 -8px 60px rgba(0,0,0,.5)",animation:mobile?"slideUp .28s cubic-bezier(.32,1.2,.5,1)":"fadeIn .2s ease",maxHeight:mobile?"92vh":"88vh",overflowY:"auto"}}>
      {mobile&&<div style={{width:38,height:4,background:"rgba(255,255,255,.2)",borderRadius:2,margin:"0 auto 16px"}}/>}
      {children}
    </div>
  </div>;
}
function MStat({label,value,hi,warn,C}){ return <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid rgba(128,128,128,.08)`}}><span style={{fontSize:11,color:C.muted}}>{label}</span><span style={{fontSize:13,fontWeight:"bold",color:warn?C.red:hi?C.gold:C.text}}>{value}</span></div>; }
function MStatH({label,value,warn,C}){ return <div style={{textAlign:"center"}}><div style={{fontSize:17,fontWeight:"bold",color:warn?C.orange:C.gold}}>{value}</div><div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",opacity:.55,marginTop:1}}>{label}</div></div>; }
function SectionLabel({children,C}){ return <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:7}}>{children}</div>; }
function FLabel({children}){ return <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(128,128,128,.7)",marginBottom:4,marginTop:11}}>{children}</div>; }
function FInput({value,onChange,placeholder,type="text",C}){ return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 11px",color:C.text,fontSize:14,outline:"none"}}/>; }
function FSelect({value,onChange,options,isObj,C}){ return <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:C.bg1||C.bg0,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 11px",color:C.text,fontSize:13,outline:"none"}}>{options.map(o=>isObj?<option key={o.value} value={o.value}>{o.label}</option>:<option key={o} value={o}>{o}</option>)}</select>; }
function EBtn({emoji,label,desc,onClick,gold,C}){ return <button onClick={onClick} style={{background:gold?`rgba(201,168,76,.07)`:C.card,border:`1px solid ${gold?C.border:C.border}`,borderRadius:10,padding:"10px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:11,textAlign:"left",width:"100%"}}><span style={{fontSize:20}}>{emoji}</span><div><div style={{color:gold?C.goldL:C.text,fontSize:13,fontWeight:"bold"}}>{label}</div><div style={{color:C.muted,fontSize:11,marginTop:1}}>{desc}</div></div></button>; }
function iBtn(){ return {background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"5px 7px",borderRadius:7,opacity:.6}; }
function cBtn(C){ return {background:"rgba(128,128,128,.1)",border:`1px solid ${C.border}`,borderRadius:7,width:28,height:28,cursor:"pointer",fontWeight:"bold",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}; }
