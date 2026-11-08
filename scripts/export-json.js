#!/usr/bin/env node
/**
 * 数据库导出 JSON 脚本
 * ---------------------
 * 将解压后的 SQLite 数据库（data/mhgu.db）按模块导出为 JSON 文件，
 * 供 Web 前端（GitHub Pages）使用。
 *
 * 设计要点：
 * 1. 按模块拆分，页面按需加载。
 * 2. 跳过 9 张空表与 3 张重复表（*_copy1）。
 * 3. 武器/防具/装饰品/随从猫装备的名称不在自身表，而在 items 表，
 *    导出时 JOIN items 合并 name / name_zh / description_zh。
 * 4. components（73k 行配方）与 quest_rewards（37k 行）不单独导出，
 *    分别内联到装备与任务 JSON 中。
 *
 * 用法：
 *   node scripts/export-json.js
 *
 * 可选参数：
 *   --db <路径>    指定 .db 文件路径（默认 data/mhgu.db）
 *   --out <目录>   指定输出目录（默认 data/json/）
 *
 * 输出数据保留英语默认字段及中文、日语字段，不导出其他语言。
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// ---- 命令行参数 ----
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const repoRoot = path.resolve(__dirname, '..');
const dbPath = path.resolve(getArg('--db', path.join(repoRoot, 'data', 'mhgu.db')));
const outDir = path.resolve(getArg('--out', path.join(repoRoot, 'data', 'json')));

if (!fs.existsSync(dbPath)) {
  console.error(`[错误] 找不到数据库文件：${dbPath}`);
  console.error('请先运行：node scripts/unpack-db.js');
  process.exit(1);
}

// ---- 语言字段过滤 ----
// 保留未带语言后缀的英语默认字段，以及英语、中文和日语翻译列。
const KEEP_LANGS = new Set(['en', 'ja', 'zh']);
function filterLang(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const m = k.match(/^(.*)_(en|zh|de|fr|es|it|ja|ko|ru)$/);
    if (m && !KEEP_LANGS.has(m[2])) continue; // 丢弃非目标语言列
    out[k] = v;
  }
  return out;
}

// ---- 工具 ----
function dumpTable(db, table, { orderBy, where } = {}) {
  const cols = db.prepare(`PRAGMA table_info("${table}")`).all().map(c => c.name);
  const sql = `SELECT * FROM "${table}"${where ? ` WHERE ${where}` : ''}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
  const rows = db.prepare(sql).all();
  return rows.map(r => {
    const o = {};
    for (const c of cols) o[c] = r[c];
    return filterLang(o);
  });
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
  console.log(`  ✓ ${path.basename(file)}  (${mb} MB, ${Array.isArray(data) ? data.length : Object.keys(data).length} 项)`);
}

// ---- 主流程 ----
console.log(`[1] 打开数据库：${dbPath}`);
const db = new DatabaseSync(dbPath, { readOnly: true });

// 空表与重复表（跳过）
const SKIP_TABLES = new Set([
  'android_metadata', 'asb_sets', 'charms', 'felyne_skills', 'food_combos',
  'ingredients', 'wishlist', 'wishlist_component', 'wishlist_data',
  'gathering_copy1', 'hunting_rewards_copy1', 'monster_damage_copy1',
]);

console.log('[2] 开始按模块导出...\n');

// ========== 怪物模块 ==========
console.log('--- 怪物 monsters ---');
const monsters = dumpTable(db, 'monsters', { orderBy: '_id' });
const monsterIds = new Set(monsters.map(m => m._id));
const monster_weakness = dumpTable(db, 'monster_weakness').filter(r => monsterIds.has(r.monster_id));
const monster_ailment = dumpTable(db, 'monster_ailment').filter(r => monsterIds.has(r.monster_id));
const monster_status = dumpTable(db, 'monster_status').filter(r => monsterIds.has(r.monster_id));
const monster_habitat = dumpTable(db, 'monster_habitat').filter(r => monsterIds.has(r.monster_id));
const monster_to_quest = dumpTable(db, 'monster_to_quest').filter(r => monsterIds.has(r.monster_id));
const hunting_rewards = dumpTable(db, 'hunting_rewards').filter(r => monsterIds.has(r.monster_id));
const monster_damage = dumpTable(db, 'monster_damage').filter(r => monsterIds.has(r.monster_id));

// 按怪物 ID 聚合子数据
const monsterMap = {};
for (const m of monsters) {
  monsterMap[m._id] = {
    ...m,
    weaknesses: monster_weakness.filter(r => r.monster_id === m._id),
    ailments: monster_ailment.filter(r => r.monster_id === m._id),
    status: monster_status.filter(r => r.monster_id === m._id),
    habitats: monster_habitat.filter(r => r.monster_id === m._id),
    quests: monster_to_quest.filter(r => r.monster_id === m._id),
    rewards: hunting_rewards.filter(r => r.monster_id === m._id),
    damage: monster_damage.filter(r => r.monster_id === m._id),
  };
}
writeJson(path.join(outDir, 'monsters.json'), Object.values(monsterMap));

// ========== 武器模块 ==========
console.log('--- 武器 weapons ---');
const weapons = dumpTable(db, 'weapons', { orderBy: '_id' });
const weaponIds = new Set(weapons.map(w => w._id));
const itemNameMap = new Map(
  dumpTable(db, 'items', { orderBy: '_id' })
    .filter(i => weaponIds.has(i._id))
    .map(i => [i._id, i])
);
const weaponsOut = weapons.map(w => {
  const item = itemNameMap.get(w._id) || {};
  return { ...w, ...item };
});
writeJson(path.join(outDir, 'weapons.json'), weaponsOut);

// ========== 防具模块 ==========
console.log('--- 防具 armor ---');
const armor = dumpTable(db, 'armor', { orderBy: '_id' });
const armorIds = new Set(armor.map(a => a._id));
const armorItemMap = new Map(
  dumpTable(db, 'items', { orderBy: '_id' })
    .filter(i => armorIds.has(i._id))
    .map(i => [i._id, i])
);
const armorOut = armor.map(a => {
  const item = armorItemMap.get(a._id) || {};
  return { ...a, ...item };
});
writeJson(path.join(outDir, 'armor.json'), armorOut);

// ========== 装饰品模块 ==========
console.log('--- 装饰品 decorations ---');
const decorations = dumpTable(db, 'decorations', { orderBy: '_id' });
const decoIds = new Set(decorations.map(d => d._id));
const decoItemMap = new Map(
  dumpTable(db, 'items', { orderBy: '_id' })
    .filter(i => decoIds.has(i._id))
    .map(i => [i._id, i])
);
const decoOut = decorations.map(d => {
  const item = decoItemMap.get(d._id) || {};
  return { ...d, ...item };
});
writeJson(path.join(outDir, 'decorations.json'), decoOut);

// ========== 物品模块 ==========
console.log('--- 物品 items ---');
const items = dumpTable(db, 'items', { orderBy: '_id' });
const itemIds = new Set(items.map(i => i._id));
const combining = dumpTable(db, 'combining').filter(r => itemIds.has(r.result_id) || itemIds.has(r.ingredient1_id) || itemIds.has(r.ingredient2_id));
const item_to_material = dumpTable(db, 'item_to_material').filter(r => itemIds.has(r.item_id));
const item_to_quest = dumpTable(db, 'item_to_quest').filter(r => itemIds.has(r.item_id));
const item_to_skill_tree = dumpTable(db, 'item_to_skill_tree').filter(r => itemIds.has(r.item_id));
const gathering = dumpTable(db, 'gathering').filter(r => itemIds.has(r.item_id));

const itemMap = {};
for (const i of items) {
  itemMap[i._id] = {
    ...i,
    combining: combining.filter(r => r.result_id === i._id || r.ingredient1_id === i._id || r.ingredient2_id === i._id),
    materials: item_to_material.filter(r => r.item_id === i._id),
    quests: item_to_quest.filter(r => r.item_id === i._id),
    skillTrees: item_to_skill_tree.filter(r => r.item_id === i._id),
    gathering: gathering.filter(r => r.item_id === i._id),
  };
}
writeJson(path.join(outDir, 'items.json'), Object.values(itemMap));

// ========== 任务模块 ==========
console.log('--- 任务 quests ---');
const quests = dumpTable(db, 'quests', { orderBy: '_id' });
const questIds = new Set(quests.map(q => q._id));
const quest_rewards = dumpTable(db, 'quest_rewards').filter(r => questIds.has(r.quest_id));
const questMap = {};
for (const q of quests) {
  questMap[q._id] = {
    ...q,
    rewards: quest_rewards.filter(r => r.quest_id === q._id),
  };
}
writeJson(path.join(outDir, 'quests.json'), Object.values(questMap));

// ========== 技能模块 ==========
console.log('--- 技能 skills ---');
const skills = dumpTable(db, 'skills', { orderBy: '_id' });
const skill_trees = dumpTable(db, 'skill_trees', { orderBy: '_id' });
writeJson(path.join(outDir, 'skills.json'), { skills, skill_trees });

// ========== 地图模块 ==========
console.log('--- 地图 locations ---');
const locations = dumpTable(db, 'locations', { orderBy: '_id' });
const locationIds = new Set(locations.map(l => l._id));
const locGathering = dumpTable(db, 'gathering').filter(r => locationIds.has(r.location_id));
const locMap = {};
for (const l of locations) {
  locMap[l._id] = {
    ...l,
    gathering: locGathering.filter(r => r.location_id === l._id),
  };
}
writeJson(path.join(outDir, 'locations.json'), Object.values(locMap));

// ========== 随从猫模块 ==========
console.log('--- 随从猫 palicos ---');
const palico_weapons = dumpTable(db, 'palico_weapons', { orderBy: '_id' });
const palicoWeaponIds = new Set(palico_weapons.map(w => w._id));
const palicoWeaponItemMap = new Map(
  dumpTable(db, 'items', { orderBy: '_id' })
    .filter(i => palicoWeaponIds.has(i._id))
    .map(i => [i._id, i])
);
const palicoWeaponsOut = palico_weapons.map(w => {
  const item = palicoWeaponItemMap.get(w._id) || {};
  return { ...w, ...item };
});

const palico_armor = dumpTable(db, 'palico_armor', { orderBy: '_id' });
const palicoArmorIds = new Set(palico_armor.map(a => a._id));
const palicoArmorItemMap = new Map(
  dumpTable(db, 'items', { orderBy: '_id' })
    .filter(i => palicoArmorIds.has(i._id))
    .map(i => [i._id, i])
);
const palicoArmorOut = palico_armor.map(a => {
  const item = palicoArmorItemMap.get(a._id) || {};
  return { ...a, ...item };
});

const meow_locations = dumpTable(db, 'meow_locations');
const meow_rewards = dumpTable(db, 'meow_rewards');
writeJson(path.join(outDir, 'palicos.json'), {
  weapons: palicoWeaponsOut,
  armor: palicoArmorOut,
  meow_locations,
  meow_rewards,
});

// ========== 调和/制作配方（components）内联到装备 ==========
// components 表 73k 行，记录"某装备由哪些素材合成"。这里不单独导出，
// 而是附加到 weapons/armor/decorations 的对应条目上。
console.log('--- 制作配方 components（内联） ---');
const components = dumpTable(db, 'components');
const compByItem = {};
for (const c of components) {
  // components 表：created_item_id = 产物（被合成的装备），component_item_id = 素材
  const key = c.created_item_id;
  if (!compByItem[key]) compByItem[key] = [];
  compByItem[key].push(c);
}

// 重新读取已写出的 JSON，附加 components 后写回
function attachComponents(file, idField) {
  const p = path.join(outDir, file);
  if (!fs.existsSync(p)) return;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const entry of data) {
    const cid = entry[idField];
    if (compByItem[cid]) entry.components = compByItem[cid];
  }
  fs.writeFileSync(p, JSON.stringify(data));
  console.log(`  ✓ ${file} 已内联 components`);
}
attachComponents('weapons.json', '_id');
attachComponents('armor.json', '_id');
attachComponents('decorations.json', '_id');

// palicos.json 是 { weapons, armor, ... } 结构，单独处理
{
  const p = path.join(outDir, 'palicos.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const w of data.weapons) {
    if (compByItem[w._id]) w.components = compByItem[w._id];
  }
  for (const a of data.armor) {
    if (compByItem[a._id]) a.components = compByItem[a._id];
  }
  fs.writeFileSync(p, JSON.stringify(data));
  console.log('  ✓ palicos.json 已内联 components');
}

// ========== 汇总 ==========
db.close();
console.log('\n[3] 导出完成！');
console.log(`输出目录：${outDir}`);
console.log('文件列表：');
for (const f of fs.readdirSync(outDir).sort()) {
  const mb = (fs.statSync(path.join(outDir, f)).size / 1024 / 1024).toFixed(2);
  console.log(`  ${f}  (${mb} MB)`);
}