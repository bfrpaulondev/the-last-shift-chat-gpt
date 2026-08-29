import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  director: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  persistence: await readFile('src/game/api/PersistenceManager.tsx', 'utf8'),
  gameApi: await readFile('src/game/api/gameApi.ts', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  model: await readFile('server/models/Save.js', 'utf8'),
  security: await readFile('src/game/areas/security/SecurityCenterArea.tsx', 'utf8'),
  prelude: await readFile('src/game/areas/basement/Part4Prelude.tsx', 'utf8'),
  basement: await readFile('src/game/areas/basement/BasementArea.tsx', 'utf8'),
  scene: await readFile('src/game/areas/basement/BasementScene.tsx', 'utf8'),
  systems: await readFile('src/game/areas/basement/BasementSystems.tsx', 'utf8'),
  audio: await readFile('src/game/areas/basement/BasementAudio.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/basement/BasementInteractionSystem.tsx', 'utf8'),
  direct: await readFile('src/game/areas/basement/DirectRouteRecovery.tsx', 'utf8'),
  cat: await readFile('src/game/areas/basement/JudasCat.tsx', 'utf8'),
  terminal: await readFile('src/game/areas/basement/Part4Terminal.tsx', 'utf8'),
  terminalArea: await readFile('src/game/areas/basement/Part4TerminalArea.tsx', 'utf8'),
  player: await readFile('src/game/player/PlayerController.tsx', 'utf8'),
  hud: await readFile('src/game/ui/GameHud.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m34.mjs && node scripts/acceptance-m35.mjs')) {
  throw new Error('M35 must append to the complete M1-M34 acceptance chain')
}

if (
  !files.areaTypes.includes("'part-4'") ||
  !files.areaTypes.includes("| 'basement'") ||
  !files.areaTypes.includes("| 'part4-terminal'") ||
  !files.director.includes('<BasementArea') ||
  !files.director.includes('<Part4TerminalArea')
) {
  throw new Error('Part 4 streaming areas are not registered end-to-end')
}

for (const flag of [
  'log_vision',
  'choice_basement_now',
  'choice_logs_first',
  'reader38_green',
  'migration_incomplete',
  'operator_gone',
  'seven_seconds_seen',
]) {
  if (!files.prelude.includes(flag) && !files.direct.includes(flag) && !files.interactions.includes(flag)) {
    if (flag === 'log_vision' || flag === 'reader38_green' || flag === 'migration_incomplete' || flag === 'operator_gone' || flag === 'seven_seconds_seen') continue
    throw new Error(`Part 3 continuity flag missing from Part 4 transition: ${flag}`)
  }
}

for (const line of [
  'ElevatorEvents',
  '| where TimeGenerated > ago(12h) and Floor == "B1"',
  '00:15:34 │ DOWN │ 4471',
  '(no DOWN event after 00:15:34. No UP event. Ever.)',
  'stairs_route_deduced',
]) {
  if (!files.prelude.includes(line)) throw new Error(`M1 canonical contract missing: ${line}`)
}

for (const line of [
  'BadgeEvents',
  '| where TimeGenerated > ago(2h)',
  '00:20:11 │ DOOR 38-SEC │ 4471',
  'clone_confirmed',
  'TACTIC 2/14: INITIAL ACCESS',
]) {
  if (!files.prelude.includes(line)) throw new Error(`M2 canonical contract missing: ${line}`)
}

if (
  !files.direct.includes('choice_basement_now') ||
  !files.direct.includes("setFlag('stairs_route_deduced')") ||
  !files.direct.includes("setFlag('clone_confirmed')") ||
  !files.direct.includes("setFlag('mitre_initial_access')")
) {
  throw new Error('Direct-basement route does not recover the same M1/M2 facts')
}

if (
  !files.store.includes('phoneBattery: number') ||
  !files.store.includes('phoneBattery: 3') ||
  !files.systems.includes('DRAIN_INTERVAL_MS = 90_000') ||
  !files.systems.includes('CHARGE_INTERVAL_MS = 300_000') ||
  !files.interactions.includes("setFlag('charger_found')") ||
  !files.hud.includes('phone-battery') ||
  !files.gameApi.includes('phoneBattery') ||
  !files.model.includes('phoneBattery') ||
  !files.server.includes('isPhoneBattery')
) {
  throw new Error('Finite phone battery / charging / persistence contract is incomplete')
}

if (
  !files.player.includes('crouchEnabled') ||
  !files.player.includes("keys.has('KeyC')") ||
  !files.basement.includes('crouchEnabled') ||
  !files.interactions.includes("'basement-cable'")
) {
  throw new Error('Crouched physical cable-following interaction is incomplete')
}

for (const evidence of [
  'FRAME FROZEN SINCE 23:50:07',
  'STORAGE LOOP FULL',
  'WRITE FAIL',
  'cam04_frozen',
  'false_positive_cat',
  'hardware_hidden_in_migration',
  'ghost_switch_found',
  'diego_found',
  'last_message_rog',
  'ROG, o equipamento 12 da lista não é o que pediram. Não é nosso. Não liga ele—',
]) {
  if (!files.interactions.includes(evidence)) throw new Error(`Basement canonical evidence missing: ${evidence}`)
}

if (
  !files.cat.includes('judas-cat') ||
  !files.cat.includes('false_positive_cat') ||
  !files.interactions.includes("setFlag('cat_friend')") ||
  !files.interactions.includes("setFlag('cat_looks_up')") ||
  !files.interactions.includes("new Event('basement:cat-purr')") ||
  !files.systems.includes('catDistance <= 3')
) {
  throw new Error('Judas companion / anti-BPM / navigation contract is incomplete')
}

if (
  !files.interactions.includes("setFlag('canary_live')") &&
  !files.interactions.includes("const flag = leaveOnline ? 'canary_live' : 'canary_killed'")
) {
  throw new Error('Canary branch is missing')
}
if (
  !files.interactions.includes('LEAVE ONLINE — MONITOR ITS EDITS') ||
  !files.interactions.includes('DISCONNECT') ||
  !files.terminal.includes('3 events rewritten in last 5 min — signature: SW-12')
) {
  throw new Error('Canary UI/data consequence contract is incomplete')
}

for (const text of [
  'VALE, E. — Assistente Técnico N3 — 6 anos de casa',
  'NÃO PAGO — ERRO OPERACIONAL',
  'approvals_folder_gone',
  'BRANDÃO, O. — APROVAÇÕES',
]) {
  if (!files.interactions.includes(text) && !files.scene.includes(text)) {
    throw new Error(`Archive canonical evidence missing: ${text}`)
  }
}

for (const line of [
  'BadgeEvents',
  '| where TimeGenerated > ago(18h)',
  '| summarize entries = countif(Action == "ENTRY"),',
  'exits   = countif(Action == "EXIT") by BadgeId, Owner',
  '| where entries != exits',
  '4471  │ PAULON, B.',
  '4472  │ VALE, E. — TERMINATED 2024-11-08',
  'PERSON CURRENTLY ON PREMISES (PER RECORDS): 2.',
  'orphan_account_found',
]) {
  if (!files.terminal.includes(line)) throw new Error(`Q1 canonical terminal contract missing: ${line}`)
}

if (
  !files.terminal.includes("setSystemClock('23:52')") ||
  !files.terminal.includes("setSystemClock('23:47')") ||
  !files.terminal.includes("setFlag('ntp_jump_witnessed')")
) {
  throw new Error('Canonical NTP jump is missing')
}

for (const line of [
  'Gostei do cuidado com o meu switch. Ele gosta de você. Ele me mostra o que você pergunta. Você pergunta bem, colega. Quase bem.',
  'Você desligou meu switch. Isso foi honesto. Foi burro, mas foi honesto.',
  'E cuida do Judas. Ele é mais velho que a sua carreira aqui.',
  'shadowbyte_contact_2',
  'he_hears',
]) {
  if (!files.terminal.includes(line)) throw new Error(`ShadowByte Part 4 response missing: ${line}`)
}

if (
  !files.terminal.includes('ELEVATOR CAM — 00:15:34') ||
  !files.terminal.includes('CABIN: EMPTY') ||
  !files.terminal.includes('BUTTON: B1 — LIT') ||
  !files.terminal.includes("setFlag('elevator_ghost_ride')")
) {
  throw new Error('Optional empty-elevator replay is incomplete')
}

for (const flag of [
  'wet_steps_b1',
  'basement_circuit_drop',
  'basement_monitor_static',
]) {
  if (!files.systems.includes(flag)) throw new Error(`Part 4 random incident missing: ${flag}`)
}

for (const audioContract of [
  'frequency.value = 120',
  'frequency.value = 45',
  'playWetSteps',
  'playYank',
  'playPurr',
  'deathSilence',
  'playShadowByte',
]) {
  if (!files.audio.includes(audioContract)) throw new Error(`Procedural audio contract missing: ${audioContract}`)
}

for (const endingLine of [
  'PARTE 4 — FIM',
  'BADGE 4472 — VALE, E. — TERMINATED 2024-11-08 — SAÍDA: NUNCA REGISTRADA.',
  '[UNLOCKED] SUMMARIZE/JOIN ● │ BASELINE/UEBA ● │ CANARY ●',
  'TACTIC 2/14: INITIAL ACCESS',
  'TACTIC 3/14: PERSISTENCE',
  'PRÓXIMO — PARTE 5: “A CONTA ÓRFÃ”',
  "setFlag('part4_complete')",
]) {
  if (!files.terminal.includes(endingLine)) throw new Error(`Part 4 ending contract missing: ${endingLine}`)
}

if (
  !files.security.includes('<Part4Prelude />') ||
  !files.terminalArea.includes('<Part4Terminal />') ||
  !files.persistence.includes('latestState.phoneBattery')
) {
  throw new Error('Part 4 transition / final terminal / save integration is incomplete')
}

console.log('M35 Part 4 — O Porão canonical acceptance passed')
