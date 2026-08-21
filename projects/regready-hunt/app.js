if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
const form=document.querySelector('#hunt-form');
const result=document.querySelector('#result');
const savedKey='regready:last-card';
const demoSource='https://www.fws.gov/program/hunting';
const checklist=[
  ['Official season and unit rules','Confirm the season, zone or unit, and species-specific dates in the official guide.'],
  ['License and tag status','Confirm your license, tag, permit, and residency requirements before departure.'],
  ['Weapon and method','Verify that the selected weapon and method are legal for this hunt.'],
  ['Reporting and transport','Check harvest reporting, tagging, carcass transport, and disease-testing instructions.']
];
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function cardData(){return {state:document.querySelector('#state').value,species:document.querySelector('#species').value,date:document.querySelector('#hunt-date').value,weapon:document.querySelector('#weapon').value,createdAt:new Date().toISOString()};}
function renderCard(data){
  result.hidden=false;
  result.innerHTML=`<h2>${esc(data.species)} in ${esc(data.state)}</h2><p class="meta">Planned for ${esc(data.date)} with ${esc(data.weapon)}.</p><ul class="checks">${checklist.map(([title,body])=>`<li class="check"><span class="check-mark" aria-hidden="true">✓</span><div><strong>${title}</strong><p>${body}</p></div></li>`).join('')}</ul><a class="source" href="${demoSource}" target="_blank" rel="noreferrer">Open official source hub</a><p><button class="save" id="save-card" type="button">Save this hunt card on this device</button></p><p id="saved" class="saved" hidden>Saved locally. Recheck the official source before the hunt.</p>`;
  document.querySelector('#save-card').addEventListener('click',()=>{localStorage.setItem(savedKey,JSON.stringify(data));document.querySelector('#saved').hidden=false;});
}
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;renderCard(cardData());});
const previous=localStorage.getItem(savedKey);
if(previous){try{const data=JSON.parse(previous);if(data.state&&data.species&&data.date&&data.weapon){for(const [id,key] of [['state','state'],['species','species'],['hunt-date','date'],['weapon','weapon']])document.querySelector('#'+id).value=data[key];}}catch(_){localStorage.removeItem(savedKey);}}
