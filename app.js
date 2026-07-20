/*
  Offline Disability IAT, jsPsych 8.2.3
  Research implementation based on the documented Project Implicit seven-block design.
  This is not an official Harvard/Project Implicit distribution.
*/
'use strict';

const APP_VERSION = '3.2.0';
const LEFT_KEY = 'e';
const RIGHT_KEY = 'i';
const ERROR_PENALTY_MS = 600;

const GOOD_WORDS = ['Joy', 'Love', 'Peace', 'Wonderful', 'Pleasure', 'Glorious', 'Laughter', 'Happy'];
const BAD_WORDS = ['Agony', 'Terrible', 'Horrible', 'Nasty', 'Evil', 'Awful', 'Failure', 'Hurt'];

function svgData(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function baseSvg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" role="img"><rect width="240" height="180" fill="white"/><g fill="none" stroke="#111" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
}

// Pilot AI-generated vignette photographs. These are original synthetic images, not official Harvard/Project Implicit assets.
// Before fieldwork, conduct a recognition pilot and replace any ambiguous image.
const DISABLED_IMAGES = [
  { id: 'disabled_1', src: './iat32_disabled_1.jpg?v=32' },
  { id: 'disabled_2', src: './iat32_disabled_2.jpg?v=32' },
  { id: 'disabled_3', src: './iat32_disabled_3.jpg?v=32' },
  { id: 'disabled_4', src: './iat32_disabled_4.jpg?v=32' },
  { id: 'disabled_5', src: './iat32_disabled_5.jpg?v=32' },
  { id: 'disabled_6', src: './iat32_disabled_6.jpg?v=32' },
  { id: 'disabled_7', src: './iat32_disabled_7.jpg?v=32' },
  { id: 'disabled_8', src: './iat32_disabled_8.jpg?v=32' }
];
const ABLED_IMAGES = [
  { id: 'abled_1', src: './iat32_abled_1.jpg?v=32' },
  { id: 'abled_2', src: './iat32_abled_2.jpg?v=32' },
  { id: 'abled_3', src: './iat32_abled_3.jpg?v=32' },
  { id: 'abled_4', src: './iat32_abled_4.jpg?v=32' },
  { id: 'abled_5', src: './iat32_abled_5.jpg?v=32' },
  { id: 'abled_6', src: './iat32_abled_6.jpg?v=32' },
  { id: 'abled_7', src: './iat32_abled_7.jpg?v=32' },
  { id: 'abled_8', src: './iat32_abled_8.jpg?v=32' }
];

const setup = document.getElementById('setup');
const target = document.getElementById('jspsych-target');
const errorBox = document.getElementById('setup-error');

// Version 3.2 intentionally disables the old cache while the image display is being piloted.
(async function removeOldCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    const status = document.getElementById('offline-status');
    if (status) status.textContent = 'Cache disabled for this pilot build. Use an internet connection while testing.';
  } catch (e) {
    const status = document.getElementById('offline-status');
    if (status) status.textContent = 'Cache cleanup could not be completed; use a private browser window for testing.';
  }
})();

function cleanId(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9._-]/g, '');
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function balancedSequence(itemsA, itemsB, n) {
  const out = [];
  while (out.length < n) {
    const pool = shuffle([...itemsA, ...itemsB]);
    for (const item of pool) {
      if (out.length >= n) break;
      const previous = out[out.length - 1];
      if (previous && previous.id === item.id && pool.length > 1) continue;
      out.push(item);
    }
  }
  return out.slice(0, n);
}
function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function rowsToCsv(rows) {
  const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  return [keys.join(','), ...rows.map(r => keys.map(k => csvEscape(r[k])).join(','))].join('\n');
}
function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

class IATTrialPlugin {
  constructor(jsPsych) { this.jsPsych = jsPsych; }
  static info = {
    name: 'iat-custom',
    parameters: {
      stimulus: { type: jsPsychModule.ParameterType.OBJECT, default: undefined },
      left_labels: { type: jsPsychModule.ParameterType.HTML_STRING, default: '' },
      right_labels: { type: jsPsychModule.ParameterType.HTML_STRING, default: '' },
      correct_key: { type: jsPsychModule.ParameterType.KEY, default: undefined },
      response_mode: { type: jsPsychModule.ParameterType.STRING, default: 'keyboard' },
      block: { type: jsPsychModule.ParameterType.INT, default: 0 },
      condition: { type: jsPsychModule.ParameterType.STRING, default: '' },
      phase: { type: jsPsychModule.ParameterType.STRING, default: '' }
    }
  };
  trial(display, trial) {
    const start = performance.now();
    let firstResponseRt = null;
    let firstResponse = null;
    let error = false;
    let finished = false;

    const stimHtml = trial.stimulus.kind === 'image'
      ? `<img class="stimulus-photo" src="${trial.stimulus.value}" alt="Classification image" draggable="false">`
      : `<span>${trial.stimulus.value}</span>`;
    const touch = trial.response_mode === 'touch'
      ? `<button class="touch-zone left" data-key="${LEFT_KEY}">LEFT</button><button class="touch-zone right" data-key="${RIGHT_KEY}">RIGHT</button>`
      : `<span class="key-label">Press E</span><span class="key-label">Press I</span>`;
    display.innerHTML = `<section class="iat-screen">
      <div class="iat-header"><div class="iat-category left">${trial.left_labels}</div><div class="iat-category right">${trial.right_labels}</div></div>
      <div id="iat-error" class="iat-error" aria-live="assertive"></div>
      <div class="iat-stimulus">${stimHtml}</div>
      <div class="iat-footer">${touch}</div>
    </section>`;

    const accept = key => {
      if (finished || ![LEFT_KEY, RIGHT_KEY].includes(key)) return;
      const rt = Math.round(performance.now() - start);
      if (firstResponseRt === null) { firstResponseRt = rt; firstResponse = key; }
      if (key !== trial.correct_key) {
        error = true;
        document.getElementById('iat-error').textContent = '✕';
        return;
      }
      finished = true;
      cleanup();
      this.jsPsych.finishTrial({
        rt, first_response_rt: firstResponseRt, response: key, first_response: firstResponse,
        correct: !error, error, stimulus_id: trial.stimulus.id, stimulus_kind: trial.stimulus.kind,
        stimulus_category: trial.stimulus.category, block: trial.block, condition: trial.condition, phase: trial.phase,
        correct_key: trial.correct_key
      });
    };
    const keyHandler = e => { if (!e.repeat) accept(e.key.toLowerCase()); };
    const buttonHandler = e => accept(e.currentTarget.dataset.key);
    document.addEventListener('keydown', keyHandler);
    display.querySelectorAll('.touch-zone').forEach(b => b.addEventListener('pointerdown', buttonHandler));
    const cleanup = () => {
      document.removeEventListener('keydown', keyHandler);
      display.querySelectorAll('.touch-zone').forEach(b => b.removeEventListener('pointerdown', buttonHandler));
    };
  }
}

class ContinuePlugin {
  constructor(jsPsych) { this.jsPsych = jsPsych; }
  static info = {
    name: 'continue-custom',
    parameters: {
      content: { type: jsPsychModule.ParameterType.HTML_STRING, default: '' },
      response_mode: { type: jsPsychModule.ParameterType.STRING, default: 'keyboard' }
    }
  };
  trial(display, trial) {
    const prompt = trial.response_mode === 'touch'
      ? '<button id="continue-button" class="primary-button">Continue</button>'
      : '<p><strong>Press the SPACE BAR to continue.</strong></p>';
    display.innerHTML = `<section class="instruction-screen">${trial.content}${prompt}</section>`;
    let done = false;
    const finish = () => {
      if (done) return; done = true; cleanup(); this.jsPsych.finishTrial({ response_mode: trial.response_mode });
    };
    const key = e => { if (e.key === ' ') finish(); };
    const button = display.querySelector('#continue-button');
    document.addEventListener('keydown', key);
    if (button) button.addEventListener('click', finish);
    const cleanup = () => { document.removeEventListener('keydown', key); if (button) button.removeEventListener('click', finish); };
  }
}

function instructionTrial(title, leftLabels, rightLabels, mode, block) {
  const keyText = mode === 'keyboard'
    ? `Use the <strong>E</strong> key for items belonging on the left and the <strong>I</strong> key for items belonging on the right.`
    : `Tap the large <strong>LEFT</strong> or <strong>RIGHT</strong> button.`;
  return {
    type: ContinuePlugin,
    content: `<h2>${title}</h2>
      <p>${keyText}</p><p>Respond as quickly as you can while making as few mistakes as possible. A red X means the response was wrong; give the correct response to continue.</p>
      <div class="instruction-grid"><div class="instruction-box">LEFT<br>${leftLabels}</div><div class="instruction-box">RIGHT<br>${rightLabels}</div></div>`,
    response_mode: mode,
    data: { trial_role: 'instruction', block }
  };
}

function makeStimulusItems() {
  const disabled = DISABLED_IMAGES.map(x => ({ id: x.id, kind: 'image', value: x.src, category: 'disabled' }));
  const abled = ABLED_IMAGES.map(x => ({ id: x.id, kind: 'image', value: x.src, category: 'abled' }));
  const good = GOOD_WORDS.map(x => ({ id: `good_${x.toLowerCase()}`, kind: 'word', value: x, category: 'good' }));
  const bad = BAD_WORDS.map(x => ({ id: `bad_${x.toLowerCase()}`, kind: 'word', value: x, category: 'bad' }));
  return { disabled, abled, good, bad };
}

function labelsFor(mapping, combined = false) {
  const fmt = arr => arr.map(x => `<div>${x}</div>`).join('<div class="iat-or">or</div>');
  const left = [], right = [];
  if (combined || mapping.targetOnly) {
    (mapping.disabledSide === 'left' ? left : right).push('Disabled Persons');
    (mapping.disabledSide === 'left' ? right : left).push('Abled Persons');
  }
  if (combined || mapping.attributeOnly) {
    (mapping.goodSide === 'left' ? left : right).push('Good');
    (mapping.goodSide === 'left' ? right : left).push('Bad');
  }
  return { left: fmt(left), right: fmt(right) };
}

function trialFromStimulus(item, mapping, labels, meta, mode) {
  const side = item.category === 'disabled' ? mapping.disabledSide
    : item.category === 'abled' ? (mapping.disabledSide === 'left' ? 'right' : 'left')
    : item.category === 'good' ? mapping.goodSide
    : (mapping.goodSide === 'left' ? 'right' : 'left');
  return {
    type: IATTrialPlugin,
    stimulus: item,
    left_labels: labels.left,
    right_labels: labels.right,
    correct_key: side === 'left' ? LEFT_KEY : RIGHT_KEY,
    response_mode: mode,
    block: meta.block,
    condition: meta.condition,
    phase: meta.phase,
    data: { trial_role: 'iat' }
  };
}

function buildBlock(block, count, itemGroups, mapping, condition, phase, mode, title) {
  const combined = itemGroups.length === 4;
  const labels = labelsFor({ ...mapping, targetOnly: itemGroups.length === 2 && itemGroups[0][0].kind === 'image', attributeOnly: itemGroups.length === 2 && itemGroups[0][0].kind === 'word' }, combined);
  const items = combined
    ? balancedSequence([...itemGroups[0], ...itemGroups[1]], [...itemGroups[2], ...itemGroups[3]], count)
    : balancedSequence(itemGroups[0], itemGroups[1], count);
  return [
    instructionTrial(title, labels.left, labels.right, mode, block),
    ...items.map(item => trialFromStimulus(item, mapping, labels, { block, condition, phase }, mode))
  ];
}

function calculateD(rows) {
  const trials = rows.filter(r => r.trial_role === 'iat' && [3,4,6,7].includes(Number(r.block)) && Number(r.first_response_rt) <= 10000);
  const fastProp = trials.length ? trials.filter(r => Number(r.first_response_rt) < 300).length / trials.length : null;
  const invalidFast = fastProp !== null && fastProp > 0.10;

  const corrected = trials.map(r => ({ ...r, score_rt: Number(r.first_response_rt) }));
  for (const block of [3,4,6,7]) {
    const br = corrected.filter(r => Number(r.block) === block);
    const correct = br.filter(r => !r.error).map(r => r.score_rt);
    const meanCorrect = correct.length ? correct.reduce((a,b)=>a+b,0) / correct.length : null;
    br.forEach(r => { if (r.error && meanCorrect !== null) r.score_rt = meanCorrect + ERROR_PENALTY_MS; });
  }
  const mean = a => a.reduce((x,y)=>x+y,0) / a.length;
  const sd = a => {
    const m = mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));
  };
  const by = b => corrected.filter(r => Number(r.block) === b);
  const b3=by(3), b4=by(4), b6=by(6), b7=by(7);
  if ([b3,b4,b6,b7].some(x => x.length < 2)) return { d_score: null, fast_trial_proportion: fastProp, invalid_fast: invalidFast };
  const pooled36 = sd([...b3,...b6].map(r=>r.score_rt));
  const pooled47 = sd([...b4,...b7].map(r=>r.score_rt));
  const getMean = (arr, condition) => mean(arr.filter(r=>r.condition===condition).map(r=>r.score_rt));
  const practiceCompatible = [...b3,...b6].filter(r=>r.phase==='practice' && r.condition==='compatible');
  const practiceIncompatible = [...b3,...b6].filter(r=>r.phase==='practice' && r.condition==='incompatible');
  const testCompatible = [...b4,...b7].filter(r=>r.phase==='test' && r.condition==='compatible');
  const testIncompatible = [...b4,...b7].filter(r=>r.phase==='test' && r.condition==='incompatible');
  const dPractice = (mean(practiceIncompatible.map(r=>r.score_rt)) - mean(practiceCompatible.map(r=>r.score_rt))) / pooled36;
  const dTest = (mean(testIncompatible.map(r=>r.score_rt)) - mean(testCompatible.map(r=>r.score_rt))) / pooled47;
  return {
    d_score: (dPractice + dTest) / 2,
    d_practice: dPractice,
    d_test: dTest,
    fast_trial_proportion: fastProp,
    invalid_fast: invalidFast,
    scored_trials: corrected.length,
    error_rate: trials.length ? trials.filter(r=>r.error).length / trials.length : null
  };
}

function localBackup(session) {
  const key = `disability_iat_session_${session.metadata.session_uuid}`;
  localStorage.setItem(key, JSON.stringify(session));
  localStorage.setItem('disability_iat_last_session', key);
}

function showFinish(session) {
  const safeId = session.metadata.participant_id.replace(/[^A-Z0-9_-]/g, '_');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `DAIAT_${safeId}_${stamp}`;
  target.innerHTML = `<section class="finish-screen"><h1>Test complete</h1>
    <p>The session has been backed up inside this tablet. Save both files before leaving this record.</p>
    <div class="download-row"><button id="save-csv">Save CSV</button><button id="save-json">Save JSON backup</button></div>
    <p><strong>Participant ID:</strong> ${session.metadata.participant_id}<br><strong>Tablet:</strong> ${session.metadata.tablet_id}<br><strong>Session:</strong> ${session.metadata.session_uuid}</p>
    <p class="small">The D-score is stored in the summary row and JSON file. Positive scores indicate a faster Disabled+Bad / Abled+Good pairing than the reverse. Do not show individual results to respondents.</p>
    <p><a href="admin.html">Open device backup manager</a></p></section>`;
  document.getElementById('save-csv').onclick = () => {
    const summaryRow = { ...session.metadata, row_type: 'summary', ...session.summary };
    const trialRows = session.trials.map(r => ({ ...session.metadata, row_type: 'trial', ...r }));
    downloadText(`${base}.csv`, rowsToCsv([summaryRow, ...trialRows]), 'text/csv;charset=utf-8');
  };
  document.getElementById('save-json').onclick = () => downloadText(`${base}.json`, JSON.stringify(session, null, 2), 'application/json');
}

async function startExperiment(metadata) {
  setup.hidden = true;
  target.innerHTML = '';
  const jsPsych = initJsPsych({ display_element: 'jspsych-target' });
  const items = makeStimulusItems();
  const seed = hashString(metadata.participant_id);
  const goodSide = (seed & 1) ? 'left' : 'right';
  const compatibleFirst = (seed & 2) === 0;
  const disabledSideInitial = compatibleFirst
    ? (goodSide === 'left' ? 'right' : 'left')
    : goodSide;
  const initialCondition = compatibleFirst ? 'compatible' : 'incompatible';
  const reversedCondition = compatibleFirst ? 'incompatible' : 'compatible';
  const mapping1 = { goodSide, disabledSide: disabledSideInitial };
  const mapping2 = { goodSide, disabledSide: disabledSideInitial === 'left' ? 'right' : 'left' };

  metadata.app_version = APP_VERSION;
  metadata.started_at = new Date().toISOString();
  metadata.compatible_first = compatibleFirst;
  metadata.good_side = goodSide;
  metadata.disabled_side_initial = disabledSideInitial;
  metadata.user_agent = navigator.userAgent;
  metadata.screen = `${screen.width}x${screen.height}`;
  metadata.online_at_start = navigator.onLine;

  const timeline = [];
  timeline.push({
    type: ContinuePlugin,
    content: `<h1>Disability Implicit Association Test</h1><p>You will sort symbols and words into categories shown at the top-left and top-right of the screen.</p><p>Work quickly, but try not to make mistakes. Keep your index fingers ready on the response keys or buttons.</p>`,
    response_mode: metadata.response_mode, data: { trial_role: 'welcome' }
  });
  timeline.push(...buildBlock(1,20,[items.disabled,items.abled],mapping1,'target-practice','practice',metadata.response_mode,'Block 1 of 7: Sort the person symbols'));
  timeline.push(...buildBlock(2,20,[items.good,items.bad],mapping1,'attribute-practice','practice',metadata.response_mode,'Block 2 of 7: Sort the words'));
  timeline.push(...buildBlock(3,20,[items.disabled,items.abled,items.good,items.bad],mapping1,initialCondition,'practice',metadata.response_mode,'Block 3 of 7: Combined practice'));
  timeline.push(...buildBlock(4,40,[items.disabled,items.abled,items.good,items.bad],mapping1,initialCondition,'test',metadata.response_mode,'Block 4 of 7: Combined task'));
  timeline.push(...buildBlock(5,20,[items.disabled,items.abled],mapping2,'target-reversal','practice',metadata.response_mode,'Block 5 of 7: The person categories have switched sides'));
  timeline.push(...buildBlock(6,20,[items.disabled,items.abled,items.good,items.bad],mapping2,reversedCondition,'practice',metadata.response_mode,'Block 6 of 7: New combined practice'));
  timeline.push(...buildBlock(7,40,[items.disabled,items.abled,items.good,items.bad],mapping2,reversedCondition,'test',metadata.response_mode,'Block 7 of 7: Final combined task'));

  await jsPsych.run(timeline);
  metadata.finished_at = new Date().toISOString();
  const trials = jsPsych.data.get().values();
  const summary = calculateD(trials);
  const session = { metadata, summary, trials };
  localBackup(session);
  showFinish(session);
}

document.getElementById('start-button').addEventListener('click', () => {
  const participantId = cleanId(document.getElementById('participant-id').value);
  const confirmId = cleanId(document.getElementById('confirm-id').value);
  const enumeratorId = cleanId(document.getElementById('enumerator-id').value);
  const tabletId = cleanId(document.getElementById('tablet-id').value);
  const responseMode = document.querySelector('input[name="mode"]:checked').value;
  const consent = document.getElementById('consent-check').checked;
  if (!participantId || participantId.length < 3) return errorBox.textContent = 'Enter a valid participant ID.';
  if (participantId !== confirmId) return errorBox.textContent = 'The two participant IDs do not match.';
  if (!enumeratorId) return errorBox.textContent = 'Enter the enumerator ID.';
  if (!tabletId) return errorBox.textContent = 'Enter the tablet ID.';
  if (!consent) return errorBox.textContent = 'Confirm that consent has been recorded.';
  if (typeof initJsPsych !== 'function') return errorBox.textContent = 'jsPsych did not load. Connect once to the internet and reload this app before offline fieldwork.';
  errorBox.textContent = '';
  startExperiment({ participant_id: participantId, enumerator_id: enumeratorId, tablet_id: tabletId, response_mode: responseMode, session_uuid: uuid() });
});
