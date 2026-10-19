// Styled Excel snapshot of the two dashboards. Values remain numeric cells.
const xlStyles={
  plain:0,title:1,subtitle:2,section:3,cardHead:4,label:5,money:6,number:7,
  input:8,highlight:9,tableHead:10,tableText:11,tableMoney:12,tableNumber:13,
  note:14,heroMoney:15,cardFill:16,tableAlt:17,tableAltMoney:18,tableAltNumber:19
};
class XlSheet{
  constructor(name){this.name=name;this.cells=new Map();this.merges=[];this.heights=new Map();this.maxRow=0;this.widths=Array(16).fill(13.5)}
  put(row,col,value,style=0){this.cells.set(`${row}:${col}`,{row,col,value,style});this.maxRow=Math.max(this.maxRow,row);return this}
  span(row,start,end,value,style=0){for(let col=start;col<=end;col++)this.put(row,col,col===start?value:null,style);if(end>start)this.merges.push(`${colName(start-1)}${row}:${colName(end-1)}${row}`);return this}
  paint(top,left,bottom,right,style){for(let row=top;row<=bottom;row++)for(let col=left;col<=right;col++)this.put(row,col,null,style);return this}
  height(row,value){this.heights.set(row,value);return this}
  section(row,label){this.span(row,1,16,label,xlStyles.section).height(row,25);return this}
  pair(row,left,right,label,value,{kind='money',input=false}={}){this.span(row,left,left+1,label,xlStyles.label);this.span(row,left+2,right,value,input?xlStyles.input:kind==='number'?xlStyles.number:xlStyles.money);this.height(row,28);return this}
}
const xValue=n=>n===null||n===undefined||Number.isNaN(n)?'—':n;
const xSum=(items,key)=>items.reduce((sum,item)=>sum+(item[key]??0),0);
const xAvg=(results,key)=>results.every(r=>r.totalBottles>0&&r[key]!==null)?results.reduce((sum,r)=>sum+r[key],0)/4:null;
function xCard(sheet,left,right,top,label,base,tax){
  sheet.paint(top,left,top+3,right,xlStyles.cardFill);
  sheet.span(top,left,right,label,xlStyles.cardHead).height(top,24);
  sheet.span(top+1,left,right,xValue(base),xlStyles.heroMoney).height(top+1,33);
  sheet.span(top+2,left,left+1,'WITHOUT GST',xlStyles.label);
  sheet.span(top+2,left+2,right,xValue(base),xlStyles.money);
  sheet.span(top+3,left,left+1,'WITH GST',xlStyles.label);
  sheet.span(top+3,left+2,right,xValue(base!==null&&tax!==null?base*tax:null),xlStyles.money);
}
function buildCostSheet(){
  const sheet=new XlSheet('Cost Price'),results=state.perfumes.map(calculate),sets=positive(state.giftSets),giftBox=giftBoxCost(),tax=gstFactor();
  const active=results.filter(r=>r.totalBottles>0),ready=active.length>0&&active.every(r=>r.total!==null)&&giftBox!==null;
  const giftUnit=sets>0&&ready?results.reduce((sum,r)=>sum+r.giftContribution,0)+giftBox/sets:null;
  const loose20=ready?results.reduce((sum,r)=>sum+r.n20*r.unit20,0):null;
  const loose50=ready?results.reduce((sum,r)=>sum+r.n50*r.unit50,0):null;
  const giftTotal=ready?sets>0?sets*giftUnit:0:null;
  const grand=ready?loose20+loose50+giftTotal:null;
  const shown=n=>n!==null&&state.gstMode==='with'&&tax!==null?n*tax:n;
  sheet.span(1,1,16,'GILTY  |  COST PRICE',xlStyles.title).height(1,40);
  sheet.span(2,1,16,'Four fragrances • all prices in INR • GST rate '+(positive(state.gstRate)??'—')+'% • card prices '+(state.gstMode==='with'?'with':'without')+' GST',xlStyles.subtitle).height(2,24);
  xCard(sheet,1,4,4,'COMBINED TOTAL COST',grand,tax);
  xCard(sheet,5,8,4,'LOOSE 20 ML TOTAL',loose20,tax);
  xCard(sheet,9,12,4,'50 ML TOTAL',loose50,tax);
  xCard(sheet,13,16,4,'GIFT SETS TOTAL',giftTotal,tax);
  sheet.section(9,'SHARED GIFT SET  |  ONE 20 ML BOTTLE OF EACH FRAGRANCE');
  sheet.paint(10,1,16,16,xlStyles.cardFill);
  const giftOil=giftUnit!==null?results.reduce((sum,r)=>sum+r.oilCost*0.02/r.litres,0):null;
  const giftEthanol=giftUnit!==null?results.reduce((sum,r)=>sum+r.ethanolCost*0.02/r.litres,0):null;
  sheet.pair(10,1,8,'Number of gift sets',xValue(sets),{kind:'number',input:true});
  sheet.pair(10,9,16,'Gift box included?',state.giftBoxing||'—',{kind:'number',input:true});
  sheet.pair(11,1,8,'Gift box per set',state.giftBoxing==='Yes'?xValue(positive(state.giftBoxPrice)):0,{input:true});
  sheet.pair(11,9,16,'Gift set cost per set',xValue(shown(giftUnit)));
  sheet.pair(12,1,8,'Oil used per set',xValue(shown(giftOil)));
  sheet.pair(12,9,16,'Ethanol used per set',xValue(shown(giftEthanol)));
  sheet.pair(13,1,8,'Four 20 ml bottles',giftUnit!==null?shown(results.reduce((sum,r)=>sum+r.rate20,0)):'—');
  sheet.pair(13,9,16,'Gift box per set',giftUnit!==null?shown(giftBox/sets):'—');
  sheet.span(15,1,8,'GIFT SETS TOTAL',xlStyles.cardHead);
  sheet.span(15,9,16,xValue(shown(giftTotal)),xlStyles.highlight).height(15,30);
  sheet.section(18,'FOUR PERFUMES  |  FORMULATION, ORDER, BOXING AND COST');
  const labels=[
    ['Oil concentration (%)',r=>positive(r.p.concentration),'number',true],
    ['Oil price / kg',r=>positive(r.p.oilPrice),'money',true],
    ['Oil density (kg/L)',r=>positive(r.p.density),'number',true],
    ['Loose 20 ml bottles',r=>r.n20,'number',true],
    ['50 ml bottles',r=>r.n50,'number',true],
    ['Gift-set 20 ml bottles',r=>r.sets,'number',false],
    ['Box loose bottles?',r=>r.p.boxing||'—','number',true],
    ['20 ml box / piece',r=>r.p.boxing==='Yes'?positive(r.p.box20):0,'money',true],
    ['50 ml box / piece',r=>r.p.boxing==='Yes'?positive(r.p.box50):0,'money',true],
    ['Oil used (kg)',r=>r.oilKg,'number',false],
    ['Oil bought (kg)',r=>r.oilBuyKg,'number',false],
    ['Oil left (ml)',r=>r.oilLeftMl,'number',false],
    ['Ethanol used (L)',r=>r.ethanolL,'number',false],
    ['Ethanol bought (L)',r=>r.ethanolBuyL,'number',false],
    ['Ethanol left (ml)',r=>r.ethanolLeftMl,'number',false],
    ['Oil used cost',r=>r.oilCost,'money',false],
    ['Ethanol used cost',r=>r.ethanolCost,'money',false],
    ['Used ingredients total',r=>r.ingredients,'money',false],
    ['Rounded purchase spend',r=>r.purchaseSpend,'money',false],
    ['Fixed bottle charges',r=>r.fixed,'money',false],
    ['Individual boxing',r=>r.boxing,'money',false],
    ['Loose 20 ml / unit',r=>shown(r.unit20),'money',false],
    ['50 ml / unit',r=>shown(r.unit50),'money',false],
    ['FRAGRANCE TOTAL',r=>shown(r.total),'money',false]
  ];
  results.forEach((r,i)=>{
    const left=i*4+1,right=left+3,data={...r,p:state.perfumes[i]};
    sheet.paint(19,left,43,right,xlStyles.cardFill);
    sheet.span(19,left,right,state.perfumes[i].name.trim()||`Perfume ${i+1}`,xlStyles.cardHead).height(19,28);
    labels.forEach(([label,get,kind,input],index)=>{
      const row=20+index,style=index===labels.length-1?xlStyles.highlight:input?xlStyles.input:kind==='number'?xlStyles.number:xlStyles.money;
      sheet.span(row,left,left+1,label,index===labels.length-1?xlStyles.cardHead:xlStyles.label);
      sheet.span(row,left+2,right,xValue(get(data)),style).height(row,23);
    });
  });
  sheet.section(46,'AVERAGE COST PER BOTTLE  |  INCLUDING SELECTED INDIVIDUAL BOXING');
  sheet.span(47,1,8,'20 ML BOTTLE',xlStyles.cardHead);sheet.span(47,9,16,'50 ML BOTTLE',xlStyles.cardHead);
  sheet.span(48,1,8,xValue(shown(xAvg(results,'unit20'))),xlStyles.heroMoney);
  sheet.span(48,9,16,xValue(shown(xAvg(results,'unit50'))),xlStyles.heroMoney).height(48,36);
  sheet.section(51,'EXTRA BOTTLES FROM LEFTOVER STOCK  |  50 ML FIRST, THEN 20 ML');
  const headers=[['Perfume',1,4],['50 ml bottles',5,7],['20 ml bottles',8,10],['Oil still left (ml)',11,13],['Ethanol still left (ml)',14,16]];
  headers.forEach(([label,a,b])=>sheet.span(52,a,b,label,xlStyles.tableHead));sheet.height(52,25);
  results.forEach((r,i)=>{const t=calculateTester(r,state.perfumes[i]),row=53+i,even=i%2===1;
    sheet.span(row,1,4,state.perfumes[i].name,even?xlStyles.tableAlt:xlStyles.tableText);
    [[t.capacity50,5,7],[t.capacity20,8,10],[t.remainingOilMl,11,13],[t.remainingEthanolMl,14,16]].forEach(([value,a,b])=>sheet.span(row,a,b,xValue(value),even?xlStyles.tableAltNumber:xlStyles.tableNumber));sheet.height(row,25);
  });
  sheet.section(59,'SHARED FIXED CHARGES  |  PER BOTTLE');
  sheet.span(60,1,8,'Charge',xlStyles.tableHead);sheet.span(60,9,12,'20 ml',xlStyles.tableHead);sheet.span(60,13,16,'50 ml',xlStyles.tableHead);
  state.rates.forEach((rate,i)=>{const row=61+i,even=i%2===1;sheet.span(row,1,8,rate.name,even?xlStyles.tableAlt:xlStyles.tableText);sheet.span(row,9,12,xValue(positive(rate.ml20)),even?xlStyles.tableAltMoney:xlStyles.tableMoney);sheet.span(row,13,16,xValue(positive(rate.ml50)),even?xlStyles.tableAltMoney:xlStyles.tableMoney);sheet.height(row,23)});
  sheet.span(67,1,8,'TOTAL PER BOTTLE',xlStyles.cardHead);sheet.span(67,9,12,results[0].rate20,xlStyles.highlight);sheet.span(67,13,16,results[0].rate50,xlStyles.highlight);
  sheet.span(69,1,16,'Snapshot of current website values. Further edits on the website are saved in that browser.',xlStyles.note);
  return sheet;
}
function buildSellingSheet(){
  const sheet=new XlSheet('Selling Price'),products=sellingProducts(),active=products.filter(p=>p.quantity>0),salesReady=active.length>0&&active.every(p=>Number.isFinite(p.net));
  const sum=key=>salesReady?active.reduce((total,p)=>total+p[key],0):null;
  const costResults=state.perfumes.map(calculate),costActive=costResults.filter(r=>r.totalBottles>0),box=giftBoxCost(),costReady=costActive.length>0&&costActive.every(r=>r.total!==null)&&box!==null;
  const totalCost=costReady?xSum(costActive,'total')+box:null,tax=gstFactor();
  sheet.span(1,1,16,'GILTY  |  SELLING PRICE',xlStyles.title).height(1,40);
  sheet.span(2,1,16,'One shared price for each loose bottle size • all prices in INR',xlStyles.subtitle).height(2,24);
  sheet.section(4,'TOTAL PRODUCTION COST  |  FROM COST PRICE');
  sheet.span(5,1,8,'WITHOUT GST',xlStyles.cardHead);sheet.span(5,9,16,'WITH GST',xlStyles.cardHead);
  sheet.span(6,1,8,xValue(totalCost),xlStyles.heroMoney);sheet.span(6,9,16,xValue(totalCost!==null&&tax!==null?totalCost*tax:null),xlStyles.heroMoney).height(6,36);
  const kpis=[['SALES INCLUDING GST',sum('sales')],['GST IN SALES',sum('gst')],['GROSS PROFIT',sum('gross')],['NET PROFIT',sum('net')]];
  kpis.forEach(([label,value],i)=>{const left=i*4+1;sheet.span(9,left,left+3,label,xlStyles.cardHead);sheet.span(10,left,left+3,xValue(value),xlStyles.heroMoney)});sheet.height(9,25).height(10,36);
  sheet.section(13,'SELLING EXPENSES AND PRICING ASSUMPTIONS');
  const settings=[
    ['GST rate (%)',positive(state.gstRate)],['Target net margin (%)',positive(sellingState.targetMargin)],
    ['20 ml delivery / bottle',positive(sellingState.delivery20)],['50 ml delivery / bottle',positive(sellingState.delivery50)],
    ['Gift-set delivery / set',positive(sellingState.deliveryGift)],['Marketing / unit',positive(sellingState.marketing)],
    ['Other expense / unit',positive(sellingState.other)],['Marketplace fee (%)',positive(sellingState.marketplaceFee)],
    ['Payment fee (%)',positive(sellingState.paymentFee)]
  ];
  settings.forEach(([label,value],i)=>{const row=14+Math.floor(i/2),left=i%2?9:1;sheet.pair(row,left,left+7,label,xValue(value),{kind:label.includes('%')?'number':'money',input:true})});
  sheet.section(21,'BOTTLE SELLING PRICE  |  FOUR-FRAGRANCE AVERAGE');
  const metrics=[
    ['Average production cost / bottle','cost'],['Loose bottles in order','quantity'],
    ['Suggested price incl. GST','suggested'],['Selling price incl. GST','price'],
    ['Sales before GST','revenue'],['GST in sales','gst'],
    ['Actual production cost','cogs'],['Selling expenses','expenses'],
    ['Gross profit','gross'],['Net profit','net'],['Net margin (%)','margin']
  ];
  products.slice(0,2).forEach((p,i)=>{const left=i?9:1,right=left+7;sheet.paint(22,left,34,right,xlStyles.cardFill);sheet.span(22,left,right,`${p.size} BOTTLES  |  ALL FOUR FRAGRANCES`,xlStyles.cardHead).height(22,28);
    metrics.forEach(([label,key],j)=>{const row=23+j,kind=key==='quantity'||key==='margin'?'number':'money',val=key==='margin'?p.margin:p[key];sheet.pair(row,left,right,label,xValue(val),{kind,input:key==='price'&&p.override!==null})})
  });
  const gift=products[2];sheet.section(37,'SHARED GIFT SET  |  ONE 20 ML BOTTLE OF EACH FRAGRANCE');
  sheet.paint(38,1,45,16,xlStyles.cardFill);
  [['Gift sets in order','quantity'],['Production cost / set','cost'],['Suggested price incl. GST','suggested'],['Selling price incl. GST','price'],['Sales before GST','revenue'],['GST in sales','gst'],['Production cost for order','cogs'],['Selling expenses for order','expenses'],['Gross profit for order','gross'],['Net profit for order','net'],['Net margin (%)','margin']].forEach(([label,key],i)=>{
    const row=38+Math.floor(i/2),left=i%2?9:1;sheet.pair(row,left,left+7,label,xValue(gift[key]),{kind:key==='quantity'||key==='margin'?'number':'money',input:key==='price'&&gift.override!==null});
  });
  sheet.section(48,'ORDER RESULTS  |  SAME VALUES AS THE SELLING CARDS');
  const tableHeaders=[['Product',1,4],['Qty',5,6],['Sales before GST',7,9],['Production cost',10,12],['Selling expenses',13,14],['Net profit',15,16]];
  tableHeaders.forEach(([label,a,b])=>sheet.span(49,a,b,label,xlStyles.tableHead));sheet.height(49,28);
  products.forEach((p,i)=>{const row=50+i,even=i%2===1;sheet.span(row,1,4,p.name,even?xlStyles.tableAlt:xlStyles.tableText);[[p.quantity,5,6,'number'],[p.revenue,7,9,'money'],[p.cogs,10,12,'money'],[p.expenses,13,14,'money'],[p.net,15,16,'money']].forEach(([value,a,b,kind])=>sheet.span(row,a,b,xValue(value),even?(kind==='number'?xlStyles.tableAltNumber:xlStyles.tableAltMoney):(kind==='number'?xlStyles.tableNumber:xlStyles.tableMoney)));sheet.height(row,28)});
  sheet.span(53,1,4,'TOTAL',xlStyles.cardHead);[[sum('revenue'),7,9],[sum('cogs'),10,12],[sum('expenses'),13,14],[sum('net'),15,16]].forEach(([value,a,b])=>sheet.span(53,a,b,xValue(value),xlStyles.highlight));sheet.span(53,5,6,salesReady?active.reduce((total,p)=>total+p.quantity,0):'—',xlStyles.number);
  sheet.span(55,1,16,'Gross profit = sales before GST less production cost. Net profit also deducts selling expenses.',xlStyles.note);
  return sheet;
}
function styledSheetXml(sheet){
  const rows=new Map();for(const cell of sheet.cells.values()){if(!rows.has(cell.row))rows.set(cell.row,[]);rows.get(cell.row).push(cell)}
  let body='';for(let row=1;row<=sheet.maxRow;row++){const cells=(rows.get(row)||[]).sort((a,b)=>a.col-b.col),height=sheet.heights.get(row);body+=`<row r="${row}"${height?` ht="${height}" customHeight="1"`:''}>`;
    for(const cell of cells){const ref=`${colName(cell.col-1)}${row}`,value=cell.value,style=` s="${cell.style}"`;if(value===null||value===undefined||value===''){body+=`<c r="${ref}"${style}/>`;continue}body+=typeof value==='number'&&Number.isFinite(value)?`<c r="${ref}"${style}><v>${value}</v></c>`:`<c r="${ref}"${style} t="inlineStr"><is><t>${xml(value)}</t></is></c>`}body+='</row>'}
  const cols=sheet.widths.map((width,i)=>`<col min="${i+1}" max="${i+1}" width="${width}" customWidth="1"/>`).join('');
  const merges=sheet.merges.length?`<mergeCells count="${sheet.merges.length}">${sheet.merges.map(ref=>`<mergeCell ref="${ref}"/>`).join('')}</mergeCells>`:'';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="21"/><cols>${cols}</cols><sheetData>${body}</sheetData>${merges}<pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
}
function styledWorkbookStyles(){
  const fonts=[
    '<font><sz val="10"/><name val="Aptos"/><color rgb="FF243C5B"/></font>',
    '<font><b/><sz val="19"/><name val="Aptos Display"/><color rgb="FFFFFFFF"/></font>',
    '<font><sz val="10"/><name val="Aptos"/><color rgb="FF718096"/></font>',
    '<font><b/><sz val="11"/><name val="Aptos"/><color rgb="FFFFFFFF"/></font>',
    '<font><b/><sz val="10"/><name val="Aptos"/><color rgb="FF243C5B"/></font>',
    '<font><sz val="10"/><name val="Aptos"/><color rgb="FF66758A"/></font>',
    '<font><b/><sz val="11"/><name val="Aptos"/><color rgb="FF1C503A"/></font>',
    '<font><b/><sz val="17"/><name val="Aptos Display"/><color rgb="FF1C503A"/></font>'
  ];
  const fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>',...['FF14223A','FFF3EEE6','FFFFFFFF','FFFFF8E8','FFEAF4EF','FFEFF3F7','FFF9FAFC'].map(color=>`<fill><patternFill patternType="solid"><fgColor rgb="${color}"/><bgColor indexed="64"/></patternFill></fill>`)];
  const formats='<numFmts count="3"><numFmt numFmtId="164" formatCode="&quot;₹&quot;#,##0.00"/><numFmt numFmtId="165" formatCode="#,##0.00"/><numFmt numFmtId="166" formatCode="#,##0"/></numFmts>';
  const specs=[
    [0,4,0,0,'left'],[1,2,0,0,'left'],[2,4,0,0,'left'],[3,2,0,0,'left'],
    [4,3,0,0,'left'],[5,4,0,0,'left'],[0,4,164,0,'right'],[0,4,165,0,'right'],
    [0,5,164,0,'right'],[6,6,164,0,'right'],[3,2,0,0,'left'],[0,4,0,0,'left'],
    [0,4,164,0,'right'],[0,4,165,0,'right'],[2,4,0,0,'left'],[7,3,164,0,'center'],
    [0,3,0,0,'left'],[0,8,0,0,'left'],[0,8,164,0,'right'],[0,8,165,0,'right']
  ];
  const xfs=specs.map(([font,fill,numFmt,border,horizontal])=>`<xf numFmtId="${numFmt}" fontId="${font}" fillId="${fill}" borderId="${border}" xfId="0" applyFont="1" applyFill="1" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="${horizontal}" vertical="center" wrapText="1"/></xf>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${formats}<fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="${fills.length}">${fills.join('')}</fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${specs.length}">${xfs}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}
function exportStyledWorkbook(){
  const cost=buildCostSheet(),selling=buildSellingSheet();
  const files=[
    ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
    ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Cost Price" sheetId="1" r:id="rId1"/><sheet name="Selling Price" sheetId="2" r:id="rId2"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml',styledWorkbookStyles()],['xl/worksheets/sheet1.xml',styledSheetXml(cost)],['xl/worksheets/sheet2.xml',styledSheetXml(selling)]
  ];
  const blob=zip(files),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Gilty-Perfume-Pricing-Dashboard.xlsx';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('download').addEventListener('click',exportStyledWorkbook);
