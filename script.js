console.log('OpenRouter key is:', window.OPENROUTER_API_KEY);

const yearSelect  = document.getElementById('yearSelect');
const makeSelect  = document.getElementById('makeSelect');
const modelSelect = document.getElementById('modelSelect');
const result      = document.getElementById('result');

// Function populate uses a forEach to populate each select for each step instead of individually
function populate(select, items, placeholder) {
  select.innerHTML = '';
  select.appendChild(new Option(placeholder, ''));
  items.forEach(item => select.appendChild(new Option(item, item)));
  select.disabled = false;
}

// manually giving list of years using date and going over 1990.
function initYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1990; y--) {
    years.push(y);
  }
  populate(yearSelect, years, 'Select a year');
}

// Fetch ALL makes, API from CAD government so LOTS of makes, unfortunately API does not have GetAllMakesByYear
// /vehicles/GetAllMakes?format=json
async function fetchAllMakes() {
  makeSelect.disabled = true;
  makeSelect.innerHTML = '<option>Loading makes</option>';
  try {
    const resp = await fetch(
      'https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json'
    );
    const json = await resp.json();
    const makes = json.Results.map(r => r.Make_Name);
    populate(makeSelect, makes, 'Select a make');
  } catch {
    makeSelect.innerHTML = '<option>Error loading makes</option>';
  }
}

// when user selects year, just clear the model & result (no longer wait for year to fetch makes)
// keeps the make list intact
yearSelect.addEventListener('change', () => {
  modelSelect.disabled = true;
  modelSelect.innerHTML = '<option>Select a make first</option>';
  result.textContent = '';
});

// after make is selected then we fetch models by make only
// /vehicles/GetModelsForMake/{make}?format=json
makeSelect.addEventListener('change', async () => {
  const make = makeSelect.value;
  if (!make) return;
  modelSelect.disabled = true;
  modelSelect.innerHTML = '<option>Loading models…</option>';
  result.textContent = '';

  try {
    const resp = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`);
    const json   = await resp.json();
    const models = json.Results.map(r => r.Model_Name);
    populate(modelSelect, models, 'Select a model');
  } catch {
    modelSelect.innerHTML = '<option>Error loading models</option>';
  }
});

/*I had to use another api (this time deepseek AI) to generate an specific description  focused on quarter-mile performance
Honestly I could not get a description of a car and had to thought of a way of getting it and I thought on using this API since I had in the past already
Function takes year, make and model from the past to now generate a description*/
async function fetchQuarterMileDescription(year, make, model) {
  const prompt = 
     `Write a concise, engaging description of the ${year} ${make} ${model}’s quarter-mile performance—focus on its acceleration time and what that says +
     about the car, referring to it if its good or bad at a quarter mile compared to its main competitors, go ahead and mention some. If not still mention the good points of the car. Do it all in 2 or 3 paragraphs`;
  console.log('DeepSeek prompt:', prompt);
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
        //hidden key
      'Authorization': `Bearer ${window.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1-0528:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  //had to add all console logs because I was not getting a response (max toxens too low so I just removed it and added it in the prompt)
  if (!resp.ok) throw new Error(`DeepSeek error: ${resp.statusText}`);
  console.log('DeepSeek HTTP status:', resp.status);
  const data = await resp.json();
  console.log('DeepSeek response JSON:', data);
  console.log('DeepSeek extracted text:', text);
  return data.choices?.[0]?.message?.content.trim() ?? '';

}


// Show the result of the car, had to async for it to wait on deepseek's response
modelSelect.addEventListener('change', async () => {
  const year  = yearSelect.value;
  const make  = makeSelect.value;
  const model = modelSelect.value;
  result.textContent = model
    ? `You picked: ${year} ${make} ${model}`
    : '';

const loading = document.createElement('p');
  loading.textContent = 'Generating quarter mile description';
  result.appendChild(loading);

  try {
    const desc = await fetchQuarterMileDescription(year, make, model);
    loading.remove();
    const p = document.createElement('p');
    p.style.cssText = 'margin-top:1rem; font-style:italic;';
    p.textContent = desc;
    result.appendChild(p);
  } catch (e) {
    console.error(e);
    loading.textContent = 'Could not generate description using deepseek';
  }
});

// run it
initYears();
fetchAllMakes();