const SELLING_KEY='gilty-selling-v2';
const sellingDefaults={targetMargin:25,delivery20:0,delivery50:0,deliveryGift:0,marketing:0,other:0,marketplaceFee:0,paymentFee:0,price20:'',price50:'',priceGift:''};
function loadSelling(){try{const current=localStorage.getItem(SELLING_KEY),saved=JSON.parse(current||localStorage.getItem('gilty-selling-v1'))||window.GILTY_SEED?.selling;if(saved)return {...sellingDefaults,...saved,price20:current||!localStorage.getItem('gilty-selling-v1')?saved.price20:'',price50:current||!localStorage.getItem('gilty-selling-v1')?saved.price50:''}}catch{}return structuredClone(sellingDefaults)}
let sellingState=loadSelling();
const saveSelling=()=>localStorage.setItem(SELLING_KEY,JSON.stringify(sellingState));
const sellingNumber=key=>positive(sellingState[key]);
const priceUp=n=>Math.ceil((n-1e-9)*100)/100;

function sellingCard(size){
  const id=String(size);
  return `<article class="selling-card aggregate-card"><header><div><span class="eyebrow">ALL FOUR FRAGRANCES</span><h3>${size} ml bottles</h3></div><span class="selling-card-icon">${size}</span></header><div class="selling-number"><span>Average cost across four / bottle</span><b data-sale="${id}-cost">—</b></div><div class="selling-number"><span>Loose bottles in order</span><b data-sale="${id}-qty">—</b></div><div class="selling-number suggested"><span>Suggested selling price incl. GST</span><b data-sale="${id}-suggested">—</b></div><label class="selling-price-label" for="sale-${id}">Selling price incl. GST <span>₹</span><input id="sale-${id}" data-selling-price="price${id}" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Calculated automatically"></label><div class="selling-auto"><span data-sale="${id}-mode">Automatic price</span><button type="button" data-reset-price="price${id}">Use suggested</button></div><div class="selling-breakdown"><div><span>Sales before GST</span><b data-sale="${id}-revenue">—</b></div><div><span>GST in sales</span><b data-sale="${id}-gst">—</b></div><div><span>Actual production cost for order</span><b data-sale="${id}-cogs">—</b></div><div><span>Selling expenses for order</span><b data-sale="${id}-expenses">—</b></div><div><span>Gross profit for order</span><b data-sale="${id}-gross">—</b></div><div class="selling-net"><span>Net profit for order</span><b data-sale="${id}-net">—</b></div><div><span>Net margin</span><b data-sale="${id}-margin">—</b></div></div></article>`;
}
function giftSellingShell(){
  return `<div class="selling-gift-head"><div><span class="eyebrow">03 / SHARED GIFT SET</span><h2>Four fragrances, one gift set</h2><p>One 20 ml bottle of each fragrance and one gift box when selected in Cost Price.</p></div><strong data-sale="gift-qty">—</strong></div><div class="selling-gift-grid"><div class="selling-gift-price"><div class="selling-number"><span>Production cost / set</span><b data-sale="gift-cost">—</b></div><div class="selling-number suggested"><span>Suggested selling price incl. GST</span><b data-sale="gift-suggested">—</b></div><label class="selling-price-label" for="sale-gift">Selling price incl. GST <span>₹</span><input id="sale-gift" data-selling-price="priceGift" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Calculated automatically"></label><div class="selling-auto"><span data-sale="gift-mode">Automatic price</span><button type="button" data-reset-price="priceGift">Use suggested</button></div></div><div class="selling-breakdown gift-breakdown-sales"><div><span>Sales before GST</span><b data-sale="gift-revenue">—</b></div><div><span>GST in sales</span><b data-sale="gift-gst">—</b></div><div><span>Production cost for order</span><b data-sale="gift-cogs">—</b></div><div><span>Selling expenses for order</span><b data-sale="gift-expenses">—</b></div><div><span>Gross profit for order</span><b data-sale="gift-gross">—</b></div><div class="selling-net"><span>Net profit for order</span><b data-sale="gift-net">—</b></div><div><span>Net margin</span><b data-sale="gift-margin">—</b></div></div></div>`;
}
function renderSellingShell(){
  for(const input of document.querySelectorAll('[data-selling-setting]'))input.value=val(sellingState[input.dataset.sellingSetting]);
  $('sell-gst-rate').value=val(state.gstRate);
  $('selling-grid').innerHTML=sellingCard(20)+sellingCard(50);
  $('selling-gift').innerHTML=giftSellingShell();
  renderSelling();
}

function sellingProducts(){
  const results=state.perfumes.map(calculate),factor=gstFactor(),sets=positive(state.giftSets);
  const unitCost=(r,p,size)=>{
    const unit=size===20?r.unit20:r.unit50,count=size===20?r.n20:r.n50,base=size===20?r.base20:r.base50;
    return unit!==null?unit:count===0&&p.boxing===''?base:null;
  };
  const products=[20,50].map(size=>{
    const units=results.map((r,i)=>unitCost(r,state.perfumes[i],size));
    const quantities=results.map(r=>size===20?r.n20:r.n50);
    const quantity=quantities.every(Number.isInteger)?quantities.reduce((a,n)=>a+n,0):null;
    const cost=units.every(n=>n!==null)?units.reduce((a,n)=>a+n,0)/4:null;
    const cogs=quantities.every(Number.isInteger)&&units.every((n,i)=>quantities[i]===0||n!==null)?units.reduce((a,n,i)=>a+quantities[i]*(n??0),0):null;
    const pricingCost=cost!==null&&quantity>0&&cogs!==null?Math.max(cost,cogs/quantity):cost;
    return {id:String(size),name:`${size} ml · average of four fragrances`,size:`${size} ml`,quantity,cost,cogs,pricingCost,delivery:sellingNumber(size===20?'delivery20':'delivery50'),override:positive(sellingState[`price${size}`])};
  });
  const boxPrice=state.giftBoxing==='No'?0:state.giftBoxing==='Yes'?positive(state.giftBoxPrice):sets===0?0:null;
  const giftCost=results.every(r=>r.giftContribution!==null)&&boxPrice!==null?results.reduce((a,r)=>a+r.giftContribution,0)+boxPrice:null;
  products.push({id:'gift',name:'Four-fragrance gift set',size:'4 × 20 ml',quantity:sets,cost:giftCost,cogs:giftCost!==null&&sets!==null?giftCost*sets:null,pricingCost:giftCost,delivery:sellingNumber('deliveryGift'),override:positive(sellingState.priceGift)});
  const margin=sellingNumber('targetMargin'),marketing=sellingNumber('marketing'),other=sellingNumber('other'),marketplace=sellingNumber('marketplaceFee'),payment=sellingNumber('paymentFee');
  for(const product of products){
    const fixed=product.delivery!==null&&marketing!==null&&other!==null?product.delivery+marketing+other:null;
    const feeRate=marketplace!==null&&payment!==null&&marketplace+payment<=100?(marketplace+payment)/100:null;
    const denominator=margin!==null&&margin<100&&feeRate!==null&&factor!==null?1-margin/100-feeRate*factor:null;
    product.fixed=fixed;
    product.suggested=product.pricingCost!==null&&fixed!==null&&denominator>0?priceUp(factor*(product.pricingCost+fixed)/denominator):null;
    product.price=product.override!==null?product.override:product.suggested;
    product.automatic=product.override===null;
    if(product.price!==null&&factor!==null&&product.cogs!==null&&fixed!==null&&feeRate!==null&&Number.isInteger(product.quantity)){
      product.sales=product.price*product.quantity;
      product.revenue=product.sales/factor;
      product.gst=product.sales-product.revenue;
      product.gross=product.revenue-product.cogs;
      product.expenses=product.quantity*(fixed+product.price*feeRate);
      product.net=product.gross-product.expenses;
      product.margin=product.revenue>0?100*product.net/product.revenue:null;
    }
  }
  return products;
}
function renderSelling(){
  if(!$('selling-grid'))return;
  const costResults=state.perfumes.map(calculate),costActive=costResults.filter(r=>r.totalBottles>0),sharedBox=giftBoxCost(),taxFactor=gstFactor();
  const costReady=costActive.length>0&&costActive.every(r=>r.total!==null)&&sharedBox!==null;
  const totalCost=costReady?costActive.reduce((sum,r)=>sum+r.total,0)+sharedBox:null;
  $('sale-cost-ex').textContent=money(totalCost);
  $('sale-cost-in').textContent=money(totalCost!==null&&taxFactor!==null?totalCost*taxFactor:null);
  const products=sellingProducts();
  if(document.activeElement!==$('sell-gst-rate'))$('sell-gst-rate').value=val(state.gstRate);
  for(const product of products){
    const put=(key,value)=>{document.querySelector(`[data-sale="${product.id}-${key}"]`).textContent=value};
    put('qty',Number.isInteger(product.quantity)?`${product.quantity} ${product.quantity===1?'unit':'units'}`:'—');
    put('cost',money(product.cost));put('suggested',money(product.suggested));
    const input=$(`sale-${product.id}`);
    if(document.activeElement!==input)input.value=product.price===null?'':product.price;
    put('mode',product.automatic?'Automatic price · edit to override':'Custom price');
    for(const key of ['revenue','gst','cogs','expenses','gross','net'])put(key,money(product[key]));
    put('margin',Number.isFinite(product.margin)?`${product.margin.toFixed(1)}%`:'—');
  }
  const active=products.filter(p=>p.quantity>0),ready=active.length>0&&active.every(p=>Number.isFinite(p.net));
  const sum=key=>active.reduce((a,p)=>a+p[key],0);
  $('sale-gross-collected').textContent=ready?money(sum('sales')):'—';
  $('sale-tax').textContent=ready?money(sum('gst')):'—';
  $('sale-gross-profit').textContent=ready?money(sum('gross')):'—';
  $('sale-net-profit').textContent=ready?money(sum('net')):'—';
  const revenue=ready?sum('revenue'):null;
  $('sale-net-margin').textContent=ready&&revenue>0?`${(100*sum('net')/revenue).toFixed(1)}% net margin across ${active.length} product types`:active.length?'Complete the four fragrance costs and selling expenses':'Add quantities in Cost Price to see order profit';
}
function sellingWorkbookRows(){
  const products=sellingProducts(),active=products.filter(p=>p.quantity>0),ready=active.length>0&&active.every(p=>Number.isFinite(p.net));
  const rows=[['GILTY — Selling price and profit'],['GST rate (%)',positive(state.gstRate)],['Target net margin (%)',positive(sellingState.targetMargin)],['20 ml delivery (₹)',positive(sellingState.delivery20)],['50 ml delivery (₹)',positive(sellingState.delivery50)],['Gift-set delivery (₹)',positive(sellingState.deliveryGift)],['Marketing per unit (₹)',positive(sellingState.marketing)],['Other per unit (₹)',positive(sellingState.other)],['Marketplace fee (%)',positive(sellingState.marketplaceFee)],['Payment fee (%)',positive(sellingState.paymentFee)],[],['Product','Order quantity','Average production cost / unit (₹)','Suggested incl GST / unit (₹)','Selling price incl GST / unit (₹)','Total sales incl GST (₹)','Total sales before GST (₹)','GST in sales (₹)','Actual production cost for order (₹)','Selling expenses for order (₹)','Gross profit (₹)','Net profit (₹)','Net margin (%)']];
  products.forEach(p=>rows.push([p.name,p.quantity,p.cost,p.suggested,p.price,p.sales,p.revenue,p.gst,p.cogs,p.expenses,p.gross,p.net,p.margin]));
  const sum=key=>active.reduce((a,p)=>a+p[key],0);
  rows.push([],['TOTAL SALES INCLUDING GST',ready?sum('sales'):null],['GST IN SALES',ready?sum('gst'):null],['GROSS PROFIT',ready?sum('gross'):null],['NET PROFIT',ready?sum('net'):null],['NET MARGIN (%)',ready&&sum('revenue')>0?100*sum('net')/sum('revenue'):null]);
  return rows;
}
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.matches('[data-selling-setting]')){sellingState[t.dataset.sellingSetting]=t.value;saveSelling();renderSelling()}
  else if(t.matches('[data-selling-gst]')){state.gstRate=t.value;$('gst-rate').value=t.value;save();renderResults()}
  else if(t.matches('[data-selling-price]')){sellingState[t.dataset.sellingPrice]=t.value;saveSelling();renderSelling()}
});
document.addEventListener('focusout',e=>{if(e.target.matches('[data-selling-price]'))renderSelling()});
document.addEventListener('click',e=>{
  if(e.target.matches('[data-reset-price]')){sellingState[e.target.dataset.resetPrice]='';saveSelling();renderSelling();return}
  if(e.target.id!=='tab-cost'&&e.target.id!=='tab-selling')return;
  const selling=e.target.id==='tab-selling';
  $('cost-view').hidden=selling;$('selling-view').hidden=!selling;
  $('tab-cost').classList.toggle('active',!selling);$('tab-selling').classList.toggle('active',selling);
  $('tab-cost').setAttribute('aria-selected',String(!selling));$('tab-selling').setAttribute('aria-selected',String(selling));
  if(selling)renderSelling();
});
renderSellingShell();
