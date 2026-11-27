/* BUY OR WAIT? — third-step purchased collection */
(() => {
  const cats = [
    ['Plushies','assets/inyong.PNG','catPlushies'],['Keychains','assets/kirig.PNG','catKeychains'],
    ['Stationery','assets/munku.PNG','catStationery'],['Accessories','assets/shipin.PNG','catAccessories'],
    ['Home decor','assets/jiaju.PNG','catHome'],['Other cute things','assets/qita.PNG','catOther']
  ];
  const words = {
    ko: {title:'내가 구매한 귀여운 소품들',intro:'내가 구매한 귀여운 물건들을 모아 봐요 ',count:'구매한 물건',sum:'총 구매 금액',unit:'개',back:'전체 카테고리',empty:'아직 구매한 물건이 없어요.',missing:'가격 미입력',rates:'환율을 불러오는 중…',failed:'환율을 확인할 수 없어 합계 금액을 표시하지 않아요.',note:'현재 환율 기준 추정 금액',view:'구경하기',currency:'KRW',step:'구매한 소품들',stepButton:'구매한 물건 보기 ↗'},
    zh: {title:'我买过的可爱小物件',intro:'这里收藏着我已经买过的可爱小物 ',count:'已购小物件',sum:'已购小物总金额',unit:'件',back:'全部分类',empty:'还没有购买的物品哦。',missing:'未填写价格',rates:'正在获取汇率…',failed:'汇率暂不可用，无法计算合计金额。',note:'按当前汇率估算',view:'查看物品',currency:'CNY',step:'已购小物件',stepButton:'查看已购小物 ↗'},
    en: {title:'Cute Things I Bought',intro:'All the cute things you have bought ',count:'Purchased items',sum:'Total spent',unit:'items',back:'All categories',empty:'No purchased items yet.',missing:'No price',rates:'Loading exchange rates…',failed:'Exchange rates unavailable; total is hidden.',note:'Estimated using current exchange rates',view:'View items',currency:'USD',step:'Things I Bought',stepButton:'VIEW PURCHASES ↗'}
  };
  let rates=null, failed=false, selected=null;
  const language=()=>typeof currentLang==='string'&&words[currentLang]?currentLang:'ko';
  const w=()=>words[language()];
  const bought=()=>typeof finds!=='undefined'&&Array.isArray(finds)?finds.filter(x=>x.status==='bought'||x.bought===true):[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=cat=>typeof t==='function'?t(cat[2]):cat[0];
  const catImage=cat=>`<img class="bow-category-art" src="${esc(cat[1])}" alt="" loading="lazy">`;
  const fmt=(n,c)=>new Intl.NumberFormat(language()==='ko'?'ko-KR':language()==='zh'?'zh-CN':'en-US',{style:'currency',currency:c,maximumFractionDigits:c==='KRW'?0:2}).format(n);
  function convert(x){
    const n=Number(x.price),from=String(x.currency||'KRW').toUpperCase(),to=w().currency;
    if(!Number.isFinite(n)||n<=0)return null;
    if(from===to)return n;
    if(!rates||!rates[from]||!rates[to])return null;
    return n/rates[from]*rates[to];
  }
  async function loadRates(){
    try{
      const r=await fetch('https://open.er-api.com/v6/latest/KRW');
      if(!r.ok)throw Error('exchange rate');
      const d=await r.json();
      if(d.result!=='success'||!d.rates?.KRW||!d.rates?.USD||!d.rates?.CNY)throw Error('exchange rate');
      rates=d.rates;failed=false;
    }catch(e){failed=true;console.warn('Currency conversion unavailable',e);}
    render();
  }
  function create(){
    if(document.getElementById('bowCollection'))return;
    const box=document.createElement('div');box.id='bowCollection';box.hidden=true;
    box.innerHTML='<div class="bow-collection-shade" data-close-collection></div><section class="bow-collection-window" role="dialog" aria-modal="true" aria-label="Purchased collection"><button type="button" class="bow-collection-x" data-close-collection>×</button><div id="bowCollectionBody"></div></section>';
    document.body.append(box);
    box.addEventListener('click',e=>{
      if(e.target.closest('[data-close-collection]'))close();
      const category=e.target.closest('[data-collection-cat]');
      if(category){selected=category.dataset.collectionCat;render();}
      if(e.target.closest('[data-collection-back]')){selected=null;render();}
    });
  }
  function open(){create();selected=null;document.getElementById('bowCollection').hidden=false;render();if(!rates)loadRates();}
  function close(){document.getElementById('bowCollection').hidden=true;}
  function render(){
    const body=document.getElementById('bowCollectionBody');
    if(!body||document.getElementById('bowCollection').hidden)return;
    const data=bought(),text=w(),priced=data.filter(x=>Number(x.price)>0);
    const values=priced.map(convert);
    const valid=values.every(v=>v!==null);
    const total=valid?fmt(values.reduce((a,b)=>a+b,0),text.currency):'—';
    const header=`<div class="bow-collection-heading"><span>BUY OR WAIT?</span><h2>${text.title}</h2><p>${text.intro}</p></div>`;
    if(selected===null){
      body.innerHTML=header+`<div class="bow-collection-summary"><div><small>${text.count}</small><strong>${data.length}</strong><small>${text.unit}</small></div><div><small>${text.sum}</small><strong>${total}</strong><small>${valid?text.note:failed?text.failed:text.rates}</small></div></div>`+
      `<div class="bow-collection-categories">${cats.map(cat=>`<button type="button" data-collection-cat="${esc(cat[0])}">${catImage(cat)}<strong>${esc(label(cat))}</strong><small>${data.filter(x=>x.category===cat[0]).length} ${text.unit}</small><small>${text.view} ↗</small></button>`).join('')}</div>`;
    }else{
      const cat=cats.find(x=>x[0]===selected),group=data.filter(x=>x.category===selected);
      body.innerHTML=`<button type="button" class="bow-collection-back" data-collection-back>← ${text.back}</button>`+header+`<h3>${cat?catImage(cat):''} ${esc(cat?label(cat):selected)} · ${group.length} ${text.unit}</h3>`+
      (group.length?`<div class="bow-collection-products">${group.map(x=>{
        const url=String(x.photo_url||'');
        const img=/^(https?:|blob:|data:image\/)/.test(url)?`<img src="${esc(url)}" alt="" loading="lazy">`:`${cat?catImage(cat):''}`;
        const value=convert(x),price=Number(x.price)>0?(value===null?'—':fmt(value,text.currency)):text.missing;
        return `<article><div class="bow-collection-photo">${img}</div><strong>${esc(x.name||x.item_name||'')}</strong><small>${esc(price)}</small></article>`;
      }).join('')}</div>`:`<p class="bow-collection-empty">${text.empty}</p>`);
    }
  }
  function updateStep(){
    const button=document.getElementById('stepDecide');if(!button)return;
    const card=button.closest('.step-card');
    const heading=card?.querySelector('h3'),number=card?.querySelector('.step-number');
    if(heading)heading.textContent=w().step;
    if(number)number.textContent=language()==='ko'?'03 / 구매한 소품들':language()==='zh'?'03 / 已购小物件':'03 / THINGS I BOUGHT';
    button.textContent=w().stepButton;
  }
  function start(){
    create();updateStep();
    document.addEventListener('click',e=>{
      if(e.target.closest('#stepDecide,#roomNav,#roomMobile,#roomButton')){
        e.preventDefault();e.stopImmediatePropagation();open();
      }
    },true);
    document.addEventListener('click',e=>{
      if(e.target.closest('.language-switch button'))setTimeout(()=>{updateStep();render();},0);
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('bowCollection').hidden)close();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
