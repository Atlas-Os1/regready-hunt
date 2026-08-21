if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
const form=document.querySelector('#hunt-form');
const result=document.querySelector('#result');
const savedKey='regready:last-card';
const speciesKey={'White-tailed deer':'deer','Elk':'elk','Antelope':'antelope','Black bear':'black bear','Mountain lion':'mountain lion'};
const checklist=[
  ['Official season and unit rules','Confirm the season, zone or unit, and species-specific dates in the official guide.'],
  ['License and tag status','Confirm your license, tag, permit, and residency requirements before departure.'],
  ['Weapon and method','Verify that the selected weapon and method are legal for this hunt.'],
  ['Reporting and transport','Check harvest reporting, tagging, carcass transport, and disease-testing instructions.']
];
let sourcePack=null;
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function cardData(){return {state:document.querySelector('#state').value,species:document.querySelector('#species').value,date:document.querySelector('#hunt-date').value,weapon:document.querySelector('#weapon').value,createdAt:new Date().toISOString()};}
function speciesRecord(label){return sourcePack?.sources?.find(source=>source.species===speciesKey[label]);}
function sourceEvidence(label){
  const record=speciesRecord(label);
  if(!record)return '<p class="evidence muted">No species-specific Oklahoma source record is loaded for this selection. Verify the official regulations hub before hunting.</p>';
  if(record.seasons.length===0)return `<p class="evidence"><strong>${esc(record.species)}:</strong> the captured ODWC page reports no hunting season in the current source snapshot. <a class="source" href="${record.finalUrl}" target="_blank" rel="noreferrer">Read the official page</a></p>`;
  const rows=record.seasons.map(season=>`<li class="season"><strong>${esc(season.title)}</strong><span>${esc(season.start||'Date not captured')} to ${esc(season.end||'Date not captured')}</span><small>${esc(season.sourceText.slice(0,260))}${season.sourceText.length>260?'...':''}</small></li>`).join('');
  return `<div class="evidence"><strong>Captured Oklahoma source evidence</strong><p class="muted">Snapshot retrieved ${esc(sourcePack.retrievedAt)}. This is a research capture, not legal advice.</p><ul class="seasons">${rows}</ul><a class="source" href="${record.finalUrl}" target="_blank" rel="noreferrer">Read the official ${esc(record.species)} page</a></div>`;
}
function renderCard(data){
  result.hidden=false;
  result.innerHTML=`<h2>${esc(data.species)} in ${esc(data.state)}</h2><p class="meta">Planned for ${esc(data.date)} with ${esc(data.weapon)}.</p><ul class="checks">${checklist.map(([title,body])=>`<li class="check"><span class="check-mark" aria-hidden="true">✓</span><div><strong>${title}</strong><p>${body}</p></div></li>`).join('')}</ul>${sourceEvidence(data.species)}<p><button class="save" id="save-card" type="button">Save this hunt card on this device</button></p><p id="saved" class="saved" hidden>Saved locally. Recheck the official source before the hunt.</p>`;
  document.querySelector('#save-card').addEventListener('click',()=>{localStorage.setItem(savedKey,JSON.stringify(data));document.querySelector('#saved').hidden=false;});
}
async function loadSourcePack(){
  for(const url of ['/api/rules/oklahoma','data/oklahoma/source-pack.json']){
    try{
      const response=await fetch(url);
      if(response.ok){
        const raw=await response.json();
        if(raw.pack&&raw.sources&&raw.rules){
          sourcePack={retrievedAt:raw.pack.retrieved_at,sources:raw.sources.map(source=>({...source,source_id:source.source_id,finalUrl:source.final_url,seasons:raw.rules.filter(rule=>rule.source_id===source.source_id).map(rule=>({title:rule.title,start:rule.start_date,end:rule.end_date,sourceText:rule.source_text}))}))};
        }else{sourcePack=raw;}
        const sourceCount=document.querySelector('#source-count');
        const ruleCount=document.querySelector('#rule-count');
        const status=document.querySelector('#source-status');
        if(sourceCount)sourceCount.textContent=String(sourcePack.sources?.length||0);
        if(ruleCount)ruleCount.textContent=String(sourcePack.sources?.reduce((total,source)=>total+(source.seasons?.length||0),0)||0);
        if(status)status.textContent='Source pack connected';
        break;
      }
    }catch(_){/* static local preview may not expose the API */}
  }
}
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;renderCard(cardData());});
const previous=localStorage.getItem(savedKey);
if(previous){try{const data=JSON.parse(previous);if(data.state&&data.species&&data.date&&data.weapon){for(const [id,key] of [['state','state'],['species','species'],['hunt-date','date'],['weapon','weapon']])document.querySelector('#'+id).value=data[key];}}catch(_){localStorage.removeItem(savedKey);}}
loadSourcePack();
