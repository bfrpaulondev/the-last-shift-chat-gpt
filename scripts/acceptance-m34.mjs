import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  area: await readFile('src/game/areas/security/SecurityCenterArea.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/security/SecurityCenterInteractionSystem.tsx', 'utf8'),
  terminal: await readFile('src/game/areas/security/SentinelTerminal.tsx', 'utf8'),
  hardware: await readFile('src/game/areas/security/SentinelHardware.tsx', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  persistence: await readFile('src/game/api/PersistenceManager.tsx', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  model: await readFile('server/models/Save.js', 'utf8'),
}

if (!files.package.includes('acceptance-m33.mjs && node scripts/acceptance-m34.mjs')) {
  throw new Error('M34 must append to the complete M1-M33 acceptance chain')
}

if (
  !files.area.includes('<SentinelTerminal />') ||
  !files.area.includes('<SentinelHardware />') ||
  !files.interactions.includes("'[E] Sentar no terminal — SENTINEL v9.4.1'") ||
  !files.interactions.includes("new Event('security:terminal-open')")
) {
  throw new Error('M33 notebook return is not connected to the Area L terminal')
}

for (const text of [
  'SENTINEL v9.4.1 — MERIDIAN TOWER',
  '61% OPERATIONAL',
  '12 OFFLINE (MIGRATION IN PROGRESS)',
  'SYSTEM CLOCK............... 23:47 (SYNCHRONIZED)',
  'OPEN INCIDENTS............. 1',
  'ACCESS MODE: _',
]) {
  if (!files.terminal.includes(text)) throw new Error(`Canonical SENTINEL boot line missing: ${text}`)
}

if (
  !files.terminal.includes('NASCIMENTO1994+ANO ATUAL') ||
  !files.terminal.includes('não confio em memória, memória é volátil') ||
  !files.terminal.includes('PASSWORDS CONTAINING PERSONAL DATA ARE TRIVIAL TO GUESS') ||
  !files.terminal.includes("setFlag('lesson_identity')") ||
  !files.terminal.includes("setCheckpoint('sentinel-credential-found'")
) {
  throw new Error('Nascimento paper credential / identity-hygiene lesson contract is incomplete')
}

if (
  !files.terminal.includes("const LOGIN_COMMAND = 'SENTINEL --maintenance --operator=4471'") ||
  !files.terminal.includes('> CREDENTIAL ACCEPTED.') ||
  !files.terminal.includes('> WELCOME, PAULON, B.') ||
  !files.terminal.includes("setFlag('sentinel_login')")
) {
  throw new Error('Real maintenance login gameplay is incomplete')
}

for (const text of [
  'INCIDENT #0001 — PRIORITY: CRITICAL',
  'INTRUSION / COMPROMISED IDENTITY',
  'BADGE 4471 — PAULON, B.',
  '2 confirmed deaths. Unauthorized access',
  'Potential suspect: YOU.',
  'Dois mortos confirmados... Eu conheço um.',
]) {
  if (!files.terminal.includes(text)) throw new Error(`Canonical incident #0001 content missing: ${text}`)
}

if (
  !files.terminal.includes('TRAINING MODE available.') ||
  !files.terminal.includes('Do you wish to learn how to read this building? [Y/N]') ||
  !files.terminal.includes('Response recorded as YES. I record everything. It is my job.') ||
  !files.terminal.includes("setFlag('training_forced')") ||
  !files.terminal.includes("setFlag('training_accepted')") ||
  !files.terminal.includes("setFlag('training_mode')")
) {
  throw new Error('Canonical forced TRAINING MODE gag is incomplete')
}

for (const queryLine of [
  'BadgeEvents',
  '| where BadgeId == "4471"',
  '| order by TimeGenerated asc',
  '| project TimeGenerated, Location, Action, Result',
]) {
  if (!files.terminal.includes(queryLine)) throw new Error(`Canonical first query line missing: ${queryLine}`)
}

if (
  !files.terminal.includes("event.code === 'Tab'") ||
  !files.terminal.includes("event.code === 'Backspace'") ||
  !files.terminal.includes('DID YOU MEAN:') ||
  !files.terminal.includes('editDistanceOne') ||
  !files.terminal.includes('tremorChance') ||
  !files.terminal.includes('setBpm(110)') ||
  !files.terminal.includes('setBpm(90)')
) {
  throw new Error('Typing/autocomplete/typo/BPM query gameplay is incomplete')
}

for (const result of [
  '23:12:08 │ LOBBY │ ENTRY │ OK',
  '23:58:12 │ DOOR 37-BREAKROOM │ OPEN │ OK',
  '23:59:41 │ DOOR 37-MAIN │ LOCKED │ OK',
  '00:15:33 │ LOBBY │ ENTRY │ OK',
  '00:15:34 │ ELEVATOR │ BASEMENT │ OK',
  'ENTRIES: 2 │ EXITS: 0',
]) {
  if (!files.terminal.includes(result)) throw new Error(`Canonical query result missing: ${result}`)
}

if (
  !files.terminal.includes('Duas entradas... zero saídas...') ||
  !files.terminal.includes('Ele ficou com meu crachá. E devolveu... a cópia.') ||
  !files.terminal.includes('23:58:12 → 23:58:19 (7 SECONDS MISSING)') ||
  !files.terminal.includes('👌  1.2s HOLD') ||
  !files.terminal.includes('interruption begins 0.4 seconds after the gesture') ||
  !files.terminal.includes("setFlag('seven_seconds_seen')") ||
  !files.terminal.includes("setFlag('he_knew')")
) {
  throw new Error('Canonical seven-second replay / OK gesture evidence is incomplete')
}

if (
  !files.terminal.includes('VISUAL LOG OVERLAY: ENABLED.') ||
  !files.terminal.includes('From now on — you see what I see.') ||
  !files.terminal.includes("setFlag('log_vision')") ||
  !files.hardware.includes('sentinel-log-vision') ||
  !files.hardware.includes('depthTest') ||
  !files.hardware.includes('RADIO BASE │ JAMMED 00:02:11 │ SIGNAL SOURCE: INTERNAL')
) {
  throw new Error('Permanent world-space Log Vision unlock is incomplete')
}

if (
  !files.hardware.includes("window.addEventListener('sentinel:key-pulse'") ||
  !files.hardware.includes('targetY =') ||
  !files.hardware.includes('<pointLight') ||
  !files.hardware.includes("color={PHOSPHOR}") ||
  !files.hardware.includes('CADERNETA') && files.hardware.includes('NASCIMENTO')
) {
  throw new Error('Physical key depression / phosphor-green hand-zone lighting is incomplete')
}

for (const pactLine of [
  'POLICE DISPATCHED BY ALARM: YES',
  'ESTIMATED ETA: 06:00 (5H REMAINING)',
  'SYSTEM: 39% OPERATIONAL (MIGRATION IN PROGRESS)',
  'MOVEMENT — BASEMENT — CAMERA 04 LOST SIGNAL 4 MIN AGO',
  'GO TO THE BASEMENT NOW',
  'INVESTIGATE THROUGH THE LOGS',
]) {
  if (!files.terminal.includes(pactLine)) throw new Error(`Canonical pact/triage content missing: ${pactLine}`)
}

if (
  !files.terminal.includes("setFlag(actionChoice ? 'choice_basement_now' : 'choice_logs_first')") ||
  !files.terminal.includes("setFlag('police_eta_armed')") ||
  !files.terminal.includes("setFlag('part3_complete')") ||
  !files.terminal.includes("setCheckpoint('part3-terminal-complete'") ||
  !files.terminal.includes('Começa aí, colega. Eu deixei o rastro limpinho pra você. Um abraço pro Nascimento.') ||
  !files.terminal.includes('CAPÍTULO 1 — PARTE 3 · FIM') ||
  !files.terminal.includes('MITRE — TACTIC 1/14: RECONNAISSANCE') ||
  !files.terminal.includes('PRÓXIMO — PARTE 4: “O PORÃO”')
) {
  throw new Error('Part 3 pact, triage telemetry or canonical ending is incomplete')
}

if (
  !files.interactions.includes('subtitleQueue.length > 0') ||
  !files.interactions.includes('dismissSubtitle') ||
  !files.terminal.includes('game.subtitleQueue.length > 0')
) {
  throw new Error('Serialized dialogue progression regressed during terminal gameplay')
}

if (
  !files.persistence.includes('hydrateProgress') ||
  !files.server.includes('/api/save') ||
  !files.model.includes('flags') ||
  !files.terminal.includes("setCheckpoint('sentinel-query-complete'") ||
  !files.terminal.includes("setCheckpoint('sentinel-log-vision'")
) {
  throw new Error('M34 checkpoint/Mongo persistence contract is incomplete')
}

console.log('M34 Area L SENTINEL terminal canonical acceptance passed')
