const STORAGE_KEY='gilty-four-perfumes-v2';
const charges=[['Bottle',8,22],['Cap',6,18],['Push pump',11,11],['Coating',6,8],['Printing',2,2],['Filling charge',7,12]];
const defaults={ethanol:190,gstRate:18,gstMode:'without',giftSets:0,giftBoxing:'',giftBoxPrice:'',rates:charges.map(([name,a,b])=>({name,ml20:a,ml50:b})),perfumes:Array.from({length:4},(_,i)=>({name:`Perfume ${String(i+1).padStart(2,'0')}`,concentration:20,oilPrice:'',density:1,loose20:0,bottles50:0,boxing:'',box20:'',box50:''}))};
let state=loadState();
const $=id=>document.getElementById(id);
const number=value=>value===''||value===null||value===undefined?null:Number(value);
const positive=value=>{const n=number(value);return n!==null&&Number.isFinite(n)&&n>=0?n:null};
const money=n=>Number.isFinite(n)?new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n):'—';
const gstFactor=()=>{const rate=positive(state.gstRate);return rate!==null&&rate<=100?1+rate/100:null};
const displayPrice=n=>state.gstMode==='with'?money(n!==null&&gstFactor()!==null?n*gstFactor():null):money(n);
const qty=(n,unit)=>Number.isFinite(n)?`${n.toFixed(3)} ${unit}`:'—';
const mlQty=n=>Number.isFinite(n)?`${n.toFixed(2)} ml`:'—';
const oilMl=(oilKg,density)=>oilKg!==null&&density!==null&&density>0?oilKg/density*1000:null;
const roundUp=(n,step)=>n===null?null:Math.ceil(Math.max(0,n-1e-10)/step)*step;
const val=n=>n===null||n===undefined?'':String(n);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function loadState(){try{const current=localStorage.getItem(STORAGE_KEY),saved=JSON.parse(current||localStorage.getItem('gilty-four-perfumes-v1'))||window.GILTY_SEED?.cost;if(saved&&Array.isArray(saved.perfumes)&&saved.perfumes.length===4)return {...defaults,...saved,giftSets:current||!localStorage.getItem('gilty-four-perfumes-v1')?saved.giftSets:0,giftBoxing:current||!localStorage.getItem('gilty-four-perfumes-v1')?saved.giftBoxing:'',giftBoxPrice:current||!localStorage.getItem('gilty-four-perfumes-v1')?saved.giftBoxPrice:'',rates:Array.isArray(saved.rates)&&saved.rates.length===6?saved.rates:defaults.rates,perfumes:saved.perfumes.map((p,i)=>({...defaults.perfumes[i],...p}))}}catch{}return structuredClone(defaults)}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function field(index,key,label,suffix='',step='any',type='number'){const p=state.perfumes[index];return `<div class="field"><label for="p${index}-${key}">${label}</label><div class="with-unit"><input id="p${index}-${key}" data-perfume="${index}" data-key="${key}" type="${type}" ${type==='number'?`min="0" step="${step}" inputmode="decimal"`:''} value="${escapeHtml(val(p[key]))}" placeholder="—" />${suffix?`<span class="unit">${suffix}</span>`:''}</div></div>`}
function card(index){
  const p=state.perfumes[index],colors=['#b9966b','#6d829b','#a98d9d','#809b91'];
  return `<article class="perfume-card ${p.boxing==='Yes'?'boxing-yes':''}" style="--accent:${colors[index]}"><div class="card-top"></div><div class="card-body"><div class="perfume-name-label">PERFUME NAME</div><div class="card-title"><input id="p${index}-name" aria-label="Perfume ${index+1} name" data-perfume="${index}" data-key="name" value="${escapeHtml(p.name)}" placeholder="Enter perfume name"><span class="card-number">0${index+1}</span></div><div class="card-subtitle">One fragrance · gift sets shared across all four</div><div class="mini-heading">FORMULATION</div>${field(index,'concentration','Oil concentration','%','0.1')}${field(index,'oilPrice','Oil price / kg','₹','0.01')}${field(index,'density','Oil density','kg/L','0.001')}<div class="mini-heading">ORDER QUANTITY</div>${field(index,'loose20','Loose 20 ml bottles','','1')}${field(index,'bottles50','50 ml bottles','','1')}<div class="result-row"><span>20 ml bottles for gift sets</span><strong data-result="${index}-gift-bottles">0</strong></div><div class="mini-heading">INDIVIDUAL BOXING</div><div class="field"><label for="p${index}-boxing">Box loose bottles?</label><select id="p${index}-boxing" data-perfume="${index}" data-key="boxing"><option value="" ${p.boxing===''?'selected':''}>Choose</option><option value="No" ${p.boxing==='No'?'selected':''}>No</option><option value="Yes" ${p.boxing==='Yes'?'selected':''}>Yes</option></select></div><div class="field box-fields"><label>20 ml box / piece</label><div class="with-unit"><input aria-label="20 ml box price" data-perfume="${index}" data-key="box20" type="number" min="0" step="0.01" value="${escapeHtml(val(p.box20))}" placeholder="—"><span class="unit">₹</span></div></div><div class="field box-fields"><label>50 ml box / piece</label><div class="with-unit"><input aria-label="50 ml box price" data-perfume="${index}" data-key="box50" type="number" min="0" step="0.01" value="${escapeHtml(val(p.box50))}" placeholder="—"><span class="unit">₹</span></div></div><div class="card-divider"></div><div class="result-row"><span>Oil used / buy</span><strong data-result="${index}-oil">—</strong></div><div class="result-row leftover"><span>Oil left over</span><strong data-result="${index}-oil-left">—</strong></div><div class="result-row"><span>Ethanol used / buy</span><strong data-result="${index}-ethanol">—</strong></div><div class="result-row leftover"><span>Ethanol left over</span><strong data-result="${index}-ethanol-left">—</strong></div><div class="result-row material-cost"><span>Oil used cost</span><strong data-result="${index}-oil-cost">—</strong></div><div class="result-row material-cost"><span>Ethanol used cost</span><strong data-result="${index}-ethanol-cost">—</strong></div><div class="result-row"><span>Used ingredients total</span><strong data-result="${index}-ingredients">—</strong></div><div class="result-row"><span>Rounded purchase spend</span><strong data-result="${index}-purchase-spend">—</strong></div><div class="result-row"><span>Fixed bottle charges</span><strong data-result="${index}-fixed">—</strong></div><div class="result-row"><span>Individual boxing</span><strong data-result="${index}-boxing">—</strong></div><div class="result-row"><span>Loose 20 ml / 50 ml</span><strong data-result="${index}-units">—</strong></div><div class="result-row total"><span>FRAGRANCE TOTAL</span><strong data-result="${index}-total">—</strong></div><div class="card-alert" data-result="${index}-alert"></div></div></article>`;
}

function renderShell(){$('perfume-grid').innerHTML=state.perfumes.map((_,i)=>card(i)).join('');$('ethanol-rate').value=val(state.ethanol);$('gift-sets').value=val(state.giftSets);$('gift-boxing').value=state.giftBoxing;$('gift-box-price').value=val(state.giftBoxPrice);$('gift-price-wrap').closest('.gift-panel').classList.toggle('has-gift-box',state.giftBoxing==='Yes');$('rates-body').innerHTML=state.rates.map((r,i)=>`<tr><td>${escapeHtml(r.name)}</td><td><input aria-label="${escapeHtml(r.name)} 20 ml" data-rate="${i}" data-size="ml20" type="number" min="0" step="0.01" value="${escapeHtml(val(r.ml20))}"></td><td><input aria-label="${escapeHtml(r.name)} 50 ml" data-rate="${i}" data-size="ml50" type="number" min="0" step="0.01" value="${escapeHtml(val(r.ml50))}"></td></tr>`).join('');$('gst-rate').value=val(state.gstRate);$('tester-grid').innerHTML=state.perfumes.map((p,i)=>`<article class="tester-card"><div class="tester-card-name" data-tester="${i}-name">${escapeHtml(p.name)}</div><div class="tester-capacity"><span>First: 50 ml bottles</span><strong data-tester="${i}-max50">—</strong></div><div class="tester-capacity"><span>Then: 20 ml bottles</span><strong data-tester="${i}-max20">—</strong></div><div class="tester-detail"><span>Oil still left</span><b data-tester="${i}-oil-left">—</b></div><div class="tester-detail"><span>Ethanol still left</span><b data-tester="${i}-ethanol-left">—</b></div></article>`).join('');renderResults()}
function calculate(p){
  const n20=positive(p.loose20),n50=positive(p.bottles50),sets=positive(state.giftSets);
  const conc=positive(p.concentration),oilPrice=positive(p.oilPrice),density=positive(p.density),ethanolRate=positive(state.ethanol);
  const rate20=state.rates.reduce((a,r)=>a+(positive(r.ml20)??0),0),rate50=state.rates.reduce((a,r)=>a+(positive(r.ml50)??0),0);
  const ratesReady=state.rates.every(r=>positive(r.ml20)!==null&&positive(r.ml50)!==null);
  const countsReady=[n20,n50,sets].every(Number.isFinite)&&[n20,n50,sets].every(Number.isInteger);
  const bottles20=countsReady?n20+sets:null,totalBottles=countsReady?bottles20+n50:null;
  const litres=countsReady?(bottles20*20+n50*50)/1000:null;
  const oilKg=litres!==null&&conc!==null&&conc<=100&&density!==null&&density>0?litres*conc/100*density:null;
  const ethanolL=litres!==null&&conc!==null&&conc<=100?litres*(1-conc/100):null;
  const oilBuyKg=roundUp(oilKg,0.5),ethanolBuyL=roundUp(ethanolL,1);
  const oilLeftKg=oilBuyKg===null?null:Math.max(0,oilBuyKg-oilKg),ethanolLeftL=ethanolBuyL===null?null:Math.max(0,ethanolBuyL-ethanolL);
  const oilLeftMl=oilMl(oilLeftKg,density),ethanolLeftMl=ethanolLeftL===null?null:ethanolLeftL*1000;
  const oilCost=oilKg!==null&&oilPrice!==null?oilKg*oilPrice:null;
  const ethanolCost=ethanolL!==null&&ethanolRate!==null?ethanolL*ethanolRate:null;
  const purchaseSpend=oilBuyKg!==null&&oilPrice!==null&&ethanolBuyL!==null&&ethanolRate!==null?oilBuyKg*oilPrice+ethanolBuyL*ethanolRate:null;
  const ingredients=oilCost!==null&&ethanolCost!==null?oilCost+ethanolCost:null;
  const fixed=countsReady&&ratesReady?bottles20*rate20+n50*rate50:null;
  const box20=positive(p.box20),box50=positive(p.box50);let boxing=null,missing='';
  if(countsReady&&n20+n50===0)boxing=0;
  else if(p.boxing==='No')boxing=0;
  else if(p.boxing==='Yes'&&countsReady){
    if(n20>0&&box20===null)missing='Enter the loose 20 ml box price';
    else if(n50>0&&box50===null)missing='Enter the 50 ml box price';
    else boxing=n20*(box20??0)+n50*(box50??0);
  }else missing='Choose Yes or No for loose-bottle boxing';
  if(oilPrice===null)missing='Enter oil price per kg';
  if(!ratesReady)missing='Complete the shared fixed charges';
  if(!countsReady)missing='Enter valid whole-number quantities';
  if(conc===null||conc>100)missing='Enter oil concentration from 0 to 100%';
  if(density===null||density<=0)missing='Enter a positive oil density';
  if(ethanolRate===null)missing='Enter ethanol price per litre';
  const total=ingredients!==null&&fixed!==null&&boxing!==null?ingredients+fixed+boxing:null;
  const ingredient20=ingredients!==null&&litres>0?ingredients*0.02/litres:oilPrice!==null&&conc!==null&&conc<=100&&density>0&&ethanolRate!==null?0.02*(conc/100*density*oilPrice+(1-conc/100)*ethanolRate):null;
  const ingredient50=ingredient20===null?null:ingredient20*2.5;
  const unit20=ingredient20!==null&&ratesReady&&(p.boxing==='No'||p.boxing==='Yes'&&box20!==null)?ingredient20+rate20+(p.boxing==='Yes'?box20:0):null;
  const unit50=ingredient50!==null&&ratesReady&&(p.boxing==='No'||p.boxing==='Yes'&&box50!==null)?ingredient50+rate50+(p.boxing==='Yes'?box50:0):null;
  const giftContribution=ingredient20!==null&&ratesReady?ingredient20+rate20:null;
  const base20=ingredient20!==null&&ratesReady?ingredient20+rate20:null,base50=ingredient50!==null&&ratesReady?ingredient50+rate50:null;
  return{n20,n50,sets,bottles20,totalBottles,litres,oilKg,ethanolL,oilBuyKg,ethanolBuyL,oilLeftKg,ethanolLeftL,oilLeftMl,ethanolLeftMl,oilCost,ethanolCost,purchaseSpend,ingredients,fixed,boxing,total,rate20,rate50,unit20,unit50,giftContribution,base20,base50,missing};
}
function calculateTester(r,p){
  const concentration=positive(p.concentration),density=positive(p.density);
  const valid=r.totalBottles>0&&r.oilLeftKg!==null&&r.ethanolLeftL!==null&&concentration!==null&&concentration<=100&&density!==null&&density>0;
  if(!valid)return {capacity50:null,capacity20:null,remainingOilMl:null,remainingEthanolMl:null};
  const maxBottles=(oilKg,ethanolL,sizeMl)=>{
    const oilEach=sizeMl/1000*concentration/100*density,ethanolEach=sizeMl/1000*(1-concentration/100);
    return Math.floor(Math.min(oilEach>0?(oilKg+1e-10)/oilEach:Infinity,ethanolEach>0?(ethanolL+1e-10)/ethanolEach:Infinity));
  };
  const capacity50=maxBottles(r.oilLeftKg,r.ethanolLeftL,50);
  const oilAfter50=Math.max(0,r.oilLeftKg-capacity50*0.05*concentration/100*density);
  const ethanolAfter50=Math.max(0,r.ethanolLeftL-capacity50*0.05*(1-concentration/100));
  const capacity20=maxBottles(oilAfter50,ethanolAfter50,20);
  const remainingOilKg=Math.max(0,oilAfter50-capacity20*0.02*concentration/100*density);
  const remainingEthanolL=Math.max(0,ethanolAfter50-capacity20*0.02*(1-concentration/100));
  return {capacity50,capacity20,remainingOilMl:oilMl(remainingOilKg,density),remainingEthanolMl:remainingEthanolL*1000};
}
function giftBoxCost(){
  const sets=positive(state.giftSets),price=positive(state.giftBoxPrice);
  if(sets===null||!Number.isInteger(sets))return null;
  if(sets===0||state.giftBoxing==='No')return 0;
  if(state.giftBoxing==='Yes'&&price!==null)return sets*price;
  return null;
}
function renderResults(){
  const all=state.perfumes.map(calculate),sets=positive(state.giftSets),giftBox=giftBoxCost();
  const testers=all.map((r,i)=>calculateTester(r,state.perfumes[i]));
  const tax=gstFactor();
  $('mode-without').classList.toggle('selected',state.gstMode==='without');
  $('mode-with').classList.toggle('selected',state.gstMode==='with');
  $('mode-without').setAttribute('aria-pressed',String(state.gstMode==='without'));
  $('mode-with').setAttribute('aria-pressed',String(state.gstMode==='with'));
  const setSummary=(id,base)=>{$(id).textContent=displayPrice(base);$(`${id}-ex`).textContent=money(base);$(`${id}-in`).textContent=money(base!==null&&tax!==null?base*tax:null)};
  all.forEach((r,i)=>{
    const put=(k,t)=>{document.querySelector(`[data-result="${i}-${k}"]`).textContent=t};
    put('gift-bottles',Number.isInteger(sets)?String(sets):'—');
    put('oil',`${qty(r.oilKg,'kg')} / ${qty(r.oilBuyKg,'kg')}`);put('oil-left',mlQty(r.oilLeftMl));
    put('ethanol',`${qty(r.ethanolL,'L')} / ${qty(r.ethanolBuyL,'L')}`);put('ethanol-left',mlQty(r.ethanolLeftMl));
    put('oil-cost',money(r.oilCost));put('ethanol-cost',money(r.ethanolCost));
    put('ingredients',money(r.ingredients));put('purchase-spend',money(r.purchaseSpend));put('fixed',money(r.fixed));put('boxing',money(r.boxing));
    put('units',[r.unit20,r.unit50].map(displayPrice).join(' / '));put('total',displayPrice(r.total));
    put('alert',r.totalBottles>0?r.missing:'');
    const t=testers[i],putTester=(key,value)=>{document.querySelector(`[data-tester="${i}-${key}"]`).textContent=value};
    putTester('name',state.perfumes[i].name.trim()||`Perfume ${i+1}`);
    putTester('max50',t.capacity50===null?'—':`${t.capacity50} bottles`);
    putTester('max20',t.capacity20===null?'—':`${t.capacity20} bottles`);
    putTester('oil-left',mlQty(t.remainingOilMl));putTester('ethanol-left',mlQty(t.remainingEthanolMl));
  });
  $('rate-20-total').textContent=money(all[0].rate20);$('rate-50-total').textContent=money(all[0].rate50);
  const active=all.filter(r=>r.totalBottles>0),ready=active.length>0&&active.every(r=>r.total!==null)&&giftBox!==null;
  const testerReady=testers.some(t=>t.capacity50!==null);
  $('tester-count-50').textContent=testerReady?`${testers.reduce((a,t)=>a+(t.capacity50??0),0)} × 50 ml`:'—';
  $('tester-count-20').textContent=testerReady?`${testers.reduce((a,t)=>a+(t.capacity20??0),0)} × 20 ml`:'—';
  setSummary('grand-cost',ready?active.reduce((a,r)=>a+r.total,0)+giftBox:null);
  const loose20=ready?all.reduce((a,r)=>a+r.n20*r.unit20,0):null;
  const loose50=ready?all.reduce((a,r)=>a+r.n50*r.unit50,0):null;
  setSummary('total-20',loose20);setSummary('total-50',loose50);
  const giftUnit=sets>0&&giftBox!==null&&all.every(r=>r.giftContribution!==null)?all.reduce((a,r)=>a+r.giftContribution,0)+giftBox/sets:null;
  const giftOil=giftUnit!==null?all.reduce((a,r)=>a+r.oilCost*0.02/r.litres,0):null;
  const giftEthanol=giftUnit!==null?all.reduce((a,r)=>a+r.ethanolCost*0.02/r.litres,0):null;
  $('gift-oil-cost').textContent=displayPrice(giftOil);$('gift-ethanol-cost').textContent=displayPrice(giftEthanol);
  $('gift-fixed-cost').textContent=giftUnit!==null?displayPrice(all.reduce((a,r)=>a+r.rate20,0)):'—';
  $('gift-box-unit').textContent=giftUnit!==null?displayPrice(giftBox/sets):'—';
  setSummary('total-gifts',ready?sets>0?sets*giftUnit:0:null);
  $('gift-unit-cost').textContent=displayPrice(giftUnit);
  $('average-20').textContent=all.every(r=>r.totalBottles>0&&r.base20!==null)?displayPrice(all.reduce((a,r)=>a+r.base20,0)/4):'—';
  $('average-50').textContent=all.every(r=>r.totalBottles>0&&r.base50!==null)?displayPrice(all.reduce((a,r)=>a+r.base50,0)/4):'—';
  $('gift-status').textContent=sets>0?(giftBox===null?'Choose gift boxing and enter its price if needed':giftUnit===null?'Complete all four perfume formulas':`${sets} set${sets===1?'':'s'} · ${money(giftBox)} total gift boxing`):'Set your gift-set quantity';
  $('status').textContent=ready?`${active.length} perfume${active.length===1?'':'s'} · ${state.gstMode==='with'?'with':'without'} GST`:(active.length?'Complete the highlighted inputs':'Add quantities to begin');
  if(typeof renderSelling==='function')renderSelling();
  return all;
}
document.addEventListener('input',e=>{const t=e.target;if(t.matches('[data-perfume]')){const i=Number(t.dataset.perfume),key=t.dataset.key;state.perfumes[i][key]=t.value;save();renderResults()}else if(t.matches('[data-rate]')){state.rates[Number(t.dataset.rate)][t.dataset.size]=t.value;save();renderResults()}else if(t.id==='ethanol-rate'){state.ethanol=t.value;save();renderResults()}else if(t.id==='gst-rate'){state.gstRate=t.value;save();renderResults()}else if(t.id==='gift-sets'){state.giftSets=t.value;save();renderResults()}else if(t.id==='gift-box-price'){state.giftBoxPrice=t.value;save();renderResults()}});
document.addEventListener('change',e=>{const t=e.target;if(t.matches('[data-key="boxing"]')){state.perfumes[Number(t.dataset.perfume)].boxing=t.value;t.closest('.perfume-card').classList.toggle('boxing-yes',t.value==='Yes');save();renderResults()}else if(t.id==='gift-boxing'){state.giftBoxing=t.value;t.closest('.gift-panel').classList.toggle('has-gift-box',t.value==='Yes');save();renderResults()}});
document.addEventListener('click',e=>{if(e.target.id==='mode-without'||e.target.id==='mode-with'){state.gstMode=e.target.id==='mode-with'?'with':'without';save();renderResults()}});

// Small, dependency-free XLSX writer. All exported numbers remain numeric Excel cells.
const utf8=s=>new TextEncoder().encode(s),xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const colName=n=>{let x=n+1,out='';while(x){x--;out=String.fromCharCode(65+x%26)+out;x=Math.floor(x/26)}return out};
function sheetXml(rows){let body='';rows.forEach((row,ri)=>{body+=`<row r="${ri+1}">`;row.forEach((value,ci)=>{if(value===null||value===undefined||value==='')return;const ref=`${colName(ci)}${ri+1}`,head=ri===0?' s="1"':'';body+=typeof value==='number'&&Number.isFinite(value)?`<c r="${ref}"${head}><v>${value}</v></c>`:`<c r="${ref}" t="inlineStr"${head}><is><t>${xml(value)}</t></is></c>`});body+='</row>'});return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="16"/><cols><col min="1" max="1" width="28" customWidth="1"/><col min="2" max="25" width="19" customWidth="1"/></cols><sheetData>${body}</sheetData></worksheet>`}
let crcTable;function crc32(bytes){if(!crcTable)crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function zip(files){
  const localParts=[],directoryParts=[];let offset=0,directorySize=0;
  for(const [name,contents] of files){
    const path=utf8(name),data=utf8(contents),crc=crc32(data);
    const local=new Uint8Array(30),lv=new DataView(local.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0,true);lv.setUint16(8,0,true);
    lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,path.length,true);
    localParts.push(local,path,data);
    const dir=new Uint8Array(46),dv=new DataView(dir.buffer);
    dv.setUint32(0,0x02014b50,true);dv.setUint16(4,20,true);dv.setUint16(6,20,true);
    dv.setUint32(16,crc,true);dv.setUint32(20,data.length,true);dv.setUint32(24,data.length,true);
    dv.setUint16(28,path.length,true);dv.setUint32(42,offset,true);
    directoryParts.push(dir,path);directorySize+=dir.length+path.length;
    offset+=local.length+path.length+data.length;
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);
  ev.setUint32(12,directorySize,true);ev.setUint32(16,offset,true);
  return new Blob([...localParts,...directoryParts,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function exportWorkbook(){
  const results=state.perfumes.map(calculate);
  const testers=results.map((r,i)=>calculateTester(r,state.perfumes[i]));
  const summary=[['GILTY — Four-fragrance gift set cost plan'],['Perfume','Loose 20 ml','Gift-set 20 ml','50 ml','Total bottles','Oil used (kg)','Oil buy (kg)','Oil leftover (ml)','Ethanol used (L)','Ethanol buy (L)','Ethanol leftover (ml)','Oil cost (₹)','Ethanol cost (₹)','Used oil + ethanol (₹)','Purchase spend (₹)','Fixed charges (₹)','Individual boxes (₹)','Fragrance total (₹)','Loose 20 ml / unit (₹)','50 ml / unit (₹)','Unboxed 20 ml / unit (₹)','Unboxed 50 ml / unit (₹)']];
  results.forEach((r,i)=>summary.push([state.perfumes[i].name,r.n20,r.sets,r.n50,r.totalBottles,r.oilKg,r.oilBuyKg,r.oilLeftMl,r.ethanolL,r.ethanolBuyL,r.ethanolLeftMl,r.oilCost,r.ethanolCost,r.ingredients,r.purchaseSpend,r.fixed,r.boxing,r.total,r.unit20,r.unit50,r.base20,r.base50]));
  const active=results.filter(r=>r.totalBottles>0),giftBox=giftBoxCost(),ready=active.length>0&&active.every(r=>r.total!==null)&&giftBox!==null;
  summary.push(['SHARED GIFT BOX',...Array(15).fill(null),giftBox,giftBox]);
  summary.push(['PRODUCTION + GIFT BOX',active.reduce((a,r)=>a+(r.n20??0),0),active.reduce((a,r)=>a+(r.sets??0),0),active.reduce((a,r)=>a+(r.n50??0),0),active.reduce((a,r)=>a+r.totalBottles,0),...['oilKg','oilBuyKg','oilLeftMl','ethanolL','ethanolBuyL','ethanolLeftMl'].map(k=>active.reduce((a,r)=>a+(r[k]??0),0)),ready?active.reduce((a,r)=>a+r.oilCost,0):null,ready?active.reduce((a,r)=>a+r.ethanolCost,0):null,ready?active.reduce((a,r)=>a+r.ingredients,0):null,ready?active.reduce((a,r)=>a+r.purchaseSpend,0):null,ready?active.reduce((a,r)=>a+r.fixed,0):null,ready?active.reduce((a,r)=>a+r.boxing,0)+giftBox:null,ready?active.reduce((a,r)=>a+r.total,0)+giftBox:null]);
  const sets=positive(state.giftSets),giftUnit=sets>0&&ready?results.reduce((a,r)=>a+r.giftContribution,0)+giftBox/sets:null;
  const category20=ready?results.reduce((a,r)=>a+r.n20*r.unit20,0):null;
  const category50=ready?results.reduce((a,r)=>a+r.n50*r.unit50,0):null;
  const categoryGift=ready?sets>0?sets*giftUnit:0:null;
  const grand=ready?category20+category50+categoryGift:null;
  const tax=gstFactor(),taxed=n=>n!==null&&tax!==null?n*tax:null;
  summary.push([],['CATEGORY','Without GST (₹)','With GST (₹)'],['Loose 20 ml total',category20,taxed(category20)],['50 ml total',category50,taxed(category50)],['Gift sets total',categoryGift,taxed(categoryGift)],['Grand total',grand,taxed(grand)],['Gift set cost per set',giftUnit,taxed(giftUnit)],['Average 20 ml unit, unboxed',results.every(r=>r.totalBottles>0&&r.base20!==null)?results.reduce((a,r)=>a+r.base20,0)/4:null],['Average 50 ml unit, unboxed',results.every(r=>r.totalBottles>0&&r.base50!==null)?results.reduce((a,r)=>a+r.base50,0)/4:null]);
  summary.push([],['EXTRA BOTTLES FROM LEFTOVERS'],['Perfume','50 ml bottles first','20 ml bottles after 50 ml','Oil still left (ml)','Ethanol still left (ml)']);
  testers.forEach((t,i)=>summary.push([state.perfumes[i].name,t.capacity50,t.capacity20,t.remainingOilMl,t.remainingEthanolMl]));
  const inputs=[['Perfume','Oil concentration (%)','Oil price / kg (₹)','Oil density (kg/L)','Loose 20 ml bottles','50 ml bottles','Box loose bottles?','20 ml box / piece (₹)','50 ml box / piece (₹)']];
  state.perfumes.forEach(p=>inputs.push([p.name,...['concentration','oilPrice','density','loose20','bottles50'].map(k=>positive(p[k])),p.boxing,...['box20','box50'].map(k=>positive(p[k]))]));
  inputs.push([],['Shared gift sets',positive(state.giftSets)],['Gift box included?',state.giftBoxing],['Gift box price / set (₹)',positive(state.giftBoxPrice)],['Ethanol price / litre (₹)',positive(state.ethanol)],['GST rate (%)',positive(state.gstRate)],['Selected display',state.gstMode==='with'?'With GST':'Without GST']);
  const rates=[['Fixed charge','20 ml (₹)','50 ml (₹)'],...state.rates.map(r=>[r.name,positive(r.ml20),positive(r.ml50)])];
  const files=[
    ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
    ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Summary" sheetId="1" r:id="rId1"/><sheet name="Inputs" sheetId="2" r:id="rId2"/><sheet name="Fixed charges" sheetId="3" r:id="rId3"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml','<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF172A4A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>'],
    ['xl/worksheets/sheet1.xml',sheetXml(summary)],['xl/worksheets/sheet2.xml',sheetXml(inputs)],['xl/worksheets/sheet3.xml',sheetXml(rates)]
  ];
  if(typeof sellingWorkbookRows==='function'){
    files[0][1]=files[0][1].replace('</Types>','<Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
    files[2][1]=files[2][1].replace('</sheets>','<sheet name="Selling prices" sheetId="4" r:id="rId5"/></sheets>');
    files[3][1]=files[3][1].replace('</Relationships>','<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/></Relationships>');
    files.push(['xl/worksheets/sheet4.xml',sheetXml(sellingWorkbookRows())]);
  }
  const blob=zip(files),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Gilty-Four-Perfume-Calculator.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('download').addEventListener('click',exportWorkbook);renderShell();

