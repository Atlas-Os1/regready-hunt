const api = async (url, options = {}) => { const response = await fetch(url, { credentials: "same-origin", ...options }); let data = null; try { data = await response.json(); } catch {} return { response, data }; };
const message = document.querySelector("#trip-message");
const output = document.querySelector("#trips-output");
const esc = (value) => String(value ?? "").replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
function show(text, ok = false) { message.textContent = text; message.dataset.ok = ok ? "true" : "false"; }
async function loadTrips() {
  const result = await api("/api/trips");
  if (!result.response.ok) { output.innerHTML = `<div class="empty-state"><h3>Sign in from Readiness first</h3><p>Your saved trips appear here after your field-desk account is authenticated.</p><a class="secondary link-button" href="./">Open Readiness ↗</a></div>`; return; }
  const trips = result.data.trips || [];
  output.innerHTML = trips.length ? trips.map((trip) => `<a class="record-card" href="trip.html?id=${encodeURIComponent(trip.trip_id)}"><div><span class="record-kind">${esc(trip.species)} · ${esc(trip.state)}</span><h3>${esc(trip.title)}</h3><p>${esc(trip.region || "Region not set")} · ${esc(trip.start_date)} → ${esc(trip.end_date)}</p></div><span aria-hidden="true">↗</span></a>`).join("") : `<div class="empty-state"><h3>No trips yet</h3><p>Create the first plan for a complete travel-to-field checklist.</p></div>`;
}
document.querySelector("#trip-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const result = await api("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: form.querySelector("#trip-title").value, state: form.querySelector("#trip-state").value, region: form.querySelector("#trip-region").value, species: form.querySelector("#trip-species").value, startDate: form.querySelector("#trip-start").value, endDate: form.querySelector("#trip-end").value }) }); if (!result.response.ok) { show(result.data?.error || "Could not create trip."); return; } show("Trip created. Opening the field plan.", true); location.href = `trip.html?id=${encodeURIComponent(result.data.tripId)}`; });
loadTrips();
