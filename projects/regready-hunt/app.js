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
  result.innerHTML=`<h2>${esc(data.species)} in ${esc(data.state)}</h2><p class="meta">Planned for ${esc(data.date)} with ${esc(data.weapon)}.</p><ul class="checks">${checklist.map(([title,body])=>`<li class="check"><span class="check-mark" aria-hidden="true">✓</span><div><strong>${title}</strong><p>${body}</p></div></li>`).join('')}</ul>${sourceEvidence(data.species)}<p><button class="save" id="save-card" type="button">Save this hunt card on this device</button></p><p><button class="save" id="save-plan" type="button">Save plan to my field desk</button></p><p id="saved" class="saved" hidden>Saved locally. Recheck the official source before the hunt.</p><p id="plan-saved" class="saved" hidden>Plan saved to your account.</p>`;
  document.querySelector('#save-card').addEventListener('click',()=>{localStorage.setItem(savedKey,JSON.stringify(data));document.querySelector('#saved').hidden=false;});
  document.querySelector('#save-plan').addEventListener('click',async()=>{const response=await fetch('/api/plans',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state:data.state,species:data.species,huntDate:data.date,weapon:data.weapon,notes:'Created from RegReady readiness card.'})});const message=document.querySelector('#plan-saved');message.textContent=response.ok?'Plan saved to your account.':'Sign in before saving a plan to your field desk.';message.hidden=false;if(response.ok)await loadAccount();});
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

async function api(url, options={}){const response=await fetch(url,{credentials:'same-origin',...options});let data=null;try{data=await response.json();}catch(_){}return {response,data};}
function setAccountMessage(message, good=false){const el=document.querySelector('#account-message');if(el){el.textContent=message;el.dataset.good=good?'true':'false';}}
function renderRecords(data){
  const area=document.querySelector('#saved-area');
  const licenses=document.querySelector('#license-list');
  const plans=document.querySelector('#plan-list');
  if(!area||!licenses||!plans)return;
  area.hidden=false;
  licenses.innerHTML=`<h4>License snapshots</h4>${(data.licenses||[]).length?data.licenses.map(item=>`<div class="record"><strong>${esc(item.license_name)}</strong><span>${esc(item.agency)}${item.species?' · '+esc(item.species):''}</span><small>${item.expires_on?'Expires '+esc(item.expires_on):'No expiry saved'}${item.license_number_masked?' · '+esc(item.license_number_masked):''}</small></div>`).join(''):'<p class="muted">No license snapshots saved yet.</p>'}`;
  plans.innerHTML=`<h4>Hunt plans</h4>${(data.plans||[]).length?data.plans.map(item=>`<div class="record"><strong>${esc(item.species)} in ${esc(item.state)}</strong><span>${esc(item.hunt_date)} · ${esc(item.weapon)}</span><small>${item.notes?esc(item.notes):'No notes saved'}</small></div>`).join(''):'<p class="muted">No account plans saved yet.</p>'}`;
}
async function loadAccount(){
  const session=await api('/api/account/session');
  const state=document.querySelector('#account-state');
  if(!session.response.ok){if(state)state.textContent='Not signed in';return null;}
  if(state)state.textContent=`Signed in as ${session.data.user.email}`;
  document.querySelector('#saved-area').hidden=false;
  const [licenses,plans]=await Promise.all([api('/api/licenses'),api('/api/plans')]);
  renderRecords({licenses:licenses.data?.licenses||[],plans:plans.data?.plans||[]});
  return session.data.user;
}
async function submitAccount(mode){
  const email=document.querySelector('#account-email').value;
  const password=document.querySelector('#account-password').value;
  const result=await api(`/api/account/${mode}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});
  if(!result.response.ok){setAccountMessage(result.data?.error||'Account request failed.');return;}
  setAccountMessage(mode==='signup'?'Account created.':'Signed in.',true);await loadAccount();
}
document.querySelector('#account-form')?.addEventListener('submit',event=>{event.preventDefault();if(event.currentTarget.reportValidity())submitAccount('signup');});
document.querySelector('#login-button')?.addEventListener('click',()=>submitAccount('login'));
document.querySelector('#logout-button')?.addEventListener('click',async()=>{await api('/api/account/logout',{method:'POST'});document.querySelector('#saved-area').hidden=true;document.querySelector('#account-state').textContent='Not signed in';setAccountMessage('Logged out.',true);});
document.querySelector('#show-license')?.addEventListener('click',()=>{document.querySelector('#license-form').hidden=false;});
let localLicenseScreenshot=false;
document.querySelector('#license-image')?.addEventListener('change',event=>{const file=event.target.files?.[0];const preview=document.querySelector('#license-preview');const image=document.querySelector('#license-preview-image');if(!file){localLicenseScreenshot=false;preview.hidden=true;return;}if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){event.target.value='';localLicenseScreenshot=false;preview.hidden=true;setAccountMessage('Choose a PNG, JPEG, or WebP image under 5 MB.');return;}localLicenseScreenshot=true;image.src=URL.createObjectURL(file);preview.hidden=false;setAccountMessage('Screenshot is previewed locally. Confirm only the fields you want to save.',true);});
document.querySelector('#license-form')?.addEventListener('submit',async event=>{event.preventDefault();const licenseForm=event.currentTarget;const result=await api('/api/licenses',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({agency:'ODWC',licenseName:document.querySelector('#license-name').value,species:document.querySelector('#license-species').value,licenseNumberMasked:document.querySelector('#license-number').value,expiresOn:document.querySelector('#license-expiry').value,captureMode:localLicenseScreenshot?'screenshot-reviewed-local':'manual-entry'})});if(!result.response.ok){setAccountMessage(result.data?.error||'Sign in before saving a license snapshot.');return;}setAccountMessage(localLicenseScreenshot?'Confirmed screenshot fields saved; raw image was not uploaded.':'License snapshot saved.',true);licenseForm.reset();licenseForm.hidden=true;localLicenseScreenshot=false;await loadAccount();});
loadAccount();
