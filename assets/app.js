
<script>
var DATA = {"nsw": {"house": 2532, "unit": 445}, "vic": {"house": 2248, "unit": 363}, "qld": {"house": 2529, "unit": 396}, "qld-north": {"house": 4482, "unit": 679}, "wa": {"house": 2181, "unit": 395}, "sa": {"house": 2108, "unit": 358}, "tas": {"house": 1998, "unit": 395}, "nt": {"house": 4157, "unit": 520}, "__national__": 2640, "__nationalUnit__": 432};
var STATE_BY_NAME = {"nsw": "New South Wales", "vic": "Victoria", "qld": "Queensland (excl. North QLD)", "qld-north": "North Queensland (Tropical North)", "wa": "Western Australia", "sa": "South Australia", "tas": "Tasmania", "nt": "Northern Territory"};

function postToState(pc){
  var n = parseInt(String(pc).replace(/\D/g,''),10);
  if(isNaN(n)) return null;
  for(var i=0;i<[[800, 999, "nt", "Darwin & Northern Territory"], [2600, 2618, "nsw", "Canberra & ACT"], [2900, 2920, "nsw", "Wollongong & NSW South Coast"], [2000, 2234, "nsw", "Sydney & Inner West NSW"], [2250, 2599, "nsw", "Central Coast, Newcastle & Hunter NSW"], [2620, 2899, "nsw", "Regional & Outback NSW"], [3000, 3200, "vic", "Melbourne & Inner City VIC"], [3211, 3999, "vic", "Geelong, Ballarat & Regional VIC"], [4000, 4199, "qld", "Brisbane & South East QLD"], [4200, 4559, "qld", "Gold Coast, Sunshine Coast & Central QLD"], [4560, 4799, "qld", "Wide Bay, Rockhampton & Mackay"], [4800, 4999, "qld-north", "Townsville, Cairns & Tropical North QLD"], [5000, 5999, "sa", "Adelaide & Regional SA"], [6000, 6999, "wa", "Perth & Regional WA"], [7000, 7999, "tas", "Hobart & Regional TAS"]].length;i++){
    var r=[[800, 999, "nt", "Darwin & Northern Territory"], [2600, 2618, "nsw", "Canberra & ACT"], [2900, 2920, "nsw", "Wollongong & NSW South Coast"], [2000, 2234, "nsw", "Sydney & Inner West NSW"], [2250, 2599, "nsw", "Central Coast, Newcastle & Hunter NSW"], [2620, 2899, "nsw", "Regional & Outback NSW"], [3000, 3200, "vic", "Melbourne & Inner City VIC"], [3211, 3999, "vic", "Geelong, Ballarat & Regional VIC"], [4000, 4199, "qld", "Brisbane & South East QLD"], [4200, 4559, "qld", "Gold Coast, Sunshine Coast & Central QLD"], [4560, 4799, "qld", "Wide Bay, Rockhampton & Mackay"], [4800, 4999, "qld-north", "Townsville, Cairns & Tropical North QLD"], [5000, 5999, "sa", "Adelaide & Regional SA"], [6000, 6999, "wa", "Perth & Regional WA"], [7000, 7999, "tas", "Hobart & Regional TAS"]][i];
    if(n>=r[0]&&n<=r[1]) return {key:r[2],label:r[3]};
  }
  return null;
}

function money(n){
  return '$'+Math.round(n).toLocaleString('en-AU');
}

function calc2(){
  var st=document.getElementById('state').value;
  var t=document.getElementById('ptype').value;
  var rent=parseFloat(document.getElementById('rent').value)||0;
  var exc=parseInt(document.getElementById('exc').value,10);
  var rl=document.getElementById('rentloss').value==='yes';

  var base=DATA[st][t];                     // state average annual premium
  var state_avg=base;
  var isBaseExcess = (exc===1000);

  var out=document.getElementById('out');
  if(!isBaseExcess){
    // Directional adjustment only: higher excess -> lower premium.
    // Insurers use their own tables; this is not a quote factor.
    // Directional only. Lower excess -> higher premium (the opposite of what
    // the first version did, which inverted the comparison).
    var factor;
    if(exc<1000){
      factor = 1 + ((1000-exc)/1000)*0.25;      // $500 excess -> ~1.13x
    } else if(exc>1000){
      factor = 1 - Math.min((exc-1000)/10000, 0.30);  // $5000 excess -> ~0.70x
    } else { factor = 1; }
    base = base*factor;
  }
  if(rl){ base *= 1.08; }                  // loss of rent cover adds ~8%

  var weekly = base/52;
  var monthly = base/12;
  var rentCover = rl ? (rent*52) : 0;

  var natAvg = (t==='house') ? DATA.__national__ : DATA.__nationalUnit__;
  var pctVsNat = ((state_avg/natAvg)-1)*100;

  out.innerHTML =
    '<div class="out">'+
    '<div class="note">Estimated annual premium</div>'+
    '<div class="big">'+money(base)+'</div>'+
    '<div style="margin-top:10px">≈ <b>'+money(weekly)+'</b> per week · '+
    '<b>'+money(monthly)+'</b> per month</div>'+
    '<hr style="border:none;border-top:1px solid #e3e8ed;margin:14px 0">'+
    '<div class="note">'+STATE_BY_NAME[st]+' · '+t+
    (t==='house'?' (freestanding)':' (strata)')+' · $'+exc+' excess'+
    (rl?' · includes loss of rent':'')+'</div>'+
    '<div class="note">'+(t==='house'?'House':'Unit')+
    ' premium in this region is '+pctVsNat.toFixed(0)+
    '% vs the national average of '+money(natAvg)+'.</div>'+
    (rentCover? '<div class="note">Annual rent at risk: '+money(rentCover)+' — this is '+
      'what loss-of-rent cover is protecting.</div>':'')+
    '<div class="note" style="margin-top:12px;color:#8a4b00"><b>Not a quote.</b> '+
    'Built from published state averages. Get real quotes for your address.</div>'+
    '</div>';
}

function quick(){
  var pc=document.getElementById('pc').value;
  var t=document.getElementById('type').value;
  var hit=postToState(pc);
  var out=document.getElementById('qo');
  if(!hit){
    out.innerHTML='<div class="out"><span class="note">We could not match that '+
      'postcode. Try a four-digit Australian postcode.</span></div>';
    return;
  }
  var base=DATA[hit.key][t];
  out.innerHTML='<div class="out"><div class="note">Estimated annual premium — '+
    esc_(hit.label)+'</div><div class="big">'+money(base)+'</div>'+
    '<div class="note">'+(t==='house'?'House / freestanding':'Unit / strata')+
    ' · $1,000 excess</div>'+
    '<div class="note" style="margin-top:10px"><a href="/calculator">Refine with the '+
    'full calculator &rarr;</a></div></div>';
}

function esc_(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

document.addEventListener('DOMContentLoaded',function(){
  var pc=document.getElementById('pc2');
  if(pc){ pc.addEventListener('blur',function(){
    var hit=postToState(pc.value);
    var el=document.getElementById('detected');
    if(hit){
      el.textContent='Detected: '+hit.label;
      document.getElementById('state').value=hit.key;
    } else { el.textContent=''; }
  });}
});
</script>
