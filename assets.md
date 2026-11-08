# MHGUDB 仓库文件夹/文件用途说明

> 本文档整理自仓库现状（分支 `develop`），用于帮助理解项目结构，为 Web 前端改造提供参考。
>
> 原项目：**MHGU Database**（怪物猎人 XX / Generations Ultimate 资料库），Android 应用。
> 本仓库已按 Web 化精简计划删除全部 Android 构建文件与资源，仅保留 Web 版所需的核心数据资产与源码参考。

---

## 一、根目录

| 路径 | 类型 | 用途 |
|---|---|---|
| `README.md` | 文件 | 项目说明（已重写为中文 Web 版说明） |
| `LICENSE.txt` | 文件 | MIT 开源许可证（版权归 DavianCorp 2014），必须保留 |
| `.gitignore` | 文件 | Git 忽略规则（已补充 Web 版规则并中文化注释） |
| `assets.md` | 文件 | 本文档：仓库结构说明 |
| `scripts/` | 目录 | 数据转换脚本（详见下文） |
| `data/` | 目录 | 已导出的数据库与 JSON（详见下文） |
| `app/` | 目录 | 核心数据资产与源码参考（详见下文） |

> 已删除：`PRIVACY.md`（隐私政策）、`changelog.txt`（更新日志）、`captures/`（调试抓包）、三个本地库模块、全部 Gradle 构建文件（`build.gradle`、`settings.gradle`、`gradle.properties`、`gradlew*`、`gradle/`）。

---

## 二、`scripts/` —— 数据转换脚本

| 文件 | 用途 | 用法 |
|---|---|---|
| `unpack-db.js` | 将 `app/src/main/assets/databases/mhgu.db.zip` 解压为 SQLite 数据库文件（`data/mhgu.db`） | `node scripts/unpack-db.js` |
| `export-json.js` | 将 SQLite 数据库按模块导出为 JSON（`data/json/`），供 GitHub Pages 使用 | `node scripts/export-json.js` |

`export-json.js` 设计要点：

1. **按模块拆分**，页面按需加载，避免一次性加载 38 MB。
2. **跳过 12 张冗余/空表**（9 张空表 + 3 张 `*_copy1` 重复表）。
3. **JOIN `items` 表**：武器/防具/装饰品/随从猫装备的名称不在自身表，而在 `items` 表，导出时合并 `name` / `name_zh` / `description_zh` 等字段。
4. **内联配方与报酬**：`components`（73k 行配方）内联到对应装备 JSON，`quest_rewards`（37k 行）内联到任务 JSON，不单独导出。
5. **多语言保留**：默认导出全部语言字段（英/中/德/法/西/意/日），供 Web 端实现语言切换；可用 `--lang zh` 只保留中文+英文以减小体积。

---

## 三、`data/` —— 已导出的数据

| 路径 | 说明 |
|---|---|
| `data/mhgu.db` | 解压后的 SQLite 数据库（约 22.9 MB，42 张表；**不入库**，由 `scripts/unpack-db.js` 生成） |
| `data/json/` | 按模块导出的 JSON 文件（全语言版，已入库） |

### `data/json/` 文件清单

| 文件 | 体积 | 内容 |
|---|---:|---|
| `monsters.json` | 1.6 MB | 129 只怪物 + 弱点/状态/栖息地/任务/报酬/伤害 |
| `weapons.json` | 20.7 MB | 10,877 把武器 + 名称 + 制作配方 |
| `armor.json` | 5.6 MB | 5,637 件防具 + 名称 + 制作配方 |
| `decorations.json` | 0.25 MB | 242 个装饰品 + 制作配方 |
| `items.json` | 21.5 MB | 21,153 个物品 + 调和/素材/任务/采集 |
| `quests.json` | 6.3 MB | 1,355 个任务 + 报酬 |
| `skills.json` | 0.26 MB | 技能与技能树 |
| `locations.json` | 2.2 MB | 31 张地图 + 采集点 |
| `palicos.json` | 2.0 MB | 随从猫武器/防具/探险 |

---

## 四、`app/` —— 核心数据资产与源码参考

### 4.1 核心数据资产（Web 版必需）

| 路径 | 用途 | Web 处理方式 |
|---|---|---|
| `app/src/main/assets/databases/mhgu.db.zip` | **核心数据库**：压缩 5.1 MB / 解压 22.9 MB，42 张表，含全部游戏数据（怪物、武器、防具、任务、技能、物品等） | 已由 `scripts/unpack-db.js` 解压并导出为 JSON（见 `data/`） |
| `app/src/main/icon-res/drawable/` | **247 个图标**：怪物图标 140 个（1.6 MB）、物品图标 80 个（168 KB）、地图图标 27 个（168 KB） | 整体复制为 Web 静态资源（约 1.9 MB） |

### 4.2 Java/Kotlin 源码（`app/src/main/java/com/ghstudios/android/`，共 300 个文件）

> 这些代码已无法构建（构建文件已删除），仅作为 Web 开发的**参考**。

| 包 | 用途 | Web 参考价值 |
|---|---|---|
| `data/classes/`（42 个） | 数据模型类：`Monster`、`Weapon`、`Armor`、`Quest`、`Item`、`Skill` 等 | 高：字段定义指导 JSON 数据结构设计 |
| `data/classes/meta/`（3 个） | 元数据模型 | 中 |
| `data/database/`（8 个） | 数据库访问层：`MonsterHunterDatabaseHelper.kt`（123 KB，核心 SQL 查询）、各 DAO、`S.java`（表名/列名常量） | 高：SQL 查询逻辑可翻译为 Web 端过滤/搜索逻辑 |
| `data/cursors/`（33 个） | Cursor 封装，将数据库行转换为模型对象 | 中：理解字段映射 |
| `data/util/`（6 个） | 查询辅助、搜索过滤、转换工具 | 中 |
| `data/`（3 个） | `DataManager`、`ASBManager`（配装器）、`WishlistManager`（收藏夹） | 中：业务逻辑参考 |
| `features/`（约 100 个） | 各功能模块：怪物、武器、防具、任务、技能、装饰品、道具、地图、随从猫、配装器、收藏夹、搜索 | 高：每个子包对应一个 Web 页面，是页面架构蓝图 |
| `adapter/`、`adapter/common/` | 列表/展开列表适配器 | 低：Android 专属 UI |
| `components/`（14 个） | 自定义视图组件 | 低 |
| `ClickListeners/`（14 个） | 点击监听器 | 低 |
| `loader/`（22 个） | 数据加载器 | 低 |
| `util/`（5 个） | 通用工具与扩展函数 | 低 |
| 根包（13 个） | `MHApplication`、`AssetLoader`、`BasePagerActivity` 等 | 低：Android 生命周期相关 |

---

## 五、数据库遍历结论（Web 导出依据）

### 5.1 表概况（42 张表）

- **9 张空表**：`asb_sets`、`charms`、`felyne_skills`、`food_combos`、`ingredients`、`wishlist`、`wishlist_component`、`wishlist_data`、`android_metadata` → 导出时跳过
- **3 张重复表**：`gathering_copy1`、`hunting_rewards_copy1`、`monster_damage_copy1`（与原始表结构完全相同）→ 导出时跳过

### 5.2 核心表数据量与 JSON 体积估算

| 表 | 行数 | 估算 JSON | Web 用途 |
|---|---:|---:|---|
| `components` | 73,187 | ~14 MB | 装备制作素材配方（最大表） |
| `quest_rewards` | 37,370 | ~7.1 MB | 任务报酬 |
| `items` | 21,153 | ~4 MB | 物品总表（含武器/防具名称） |
| `gathering` | 15,414 | ~2.9 MB | 采集点 |
| `item_to_skill_tree` | 14,510 | ~2.8 MB | 物品→技能树点数 |
| `weapons` | 10,877 | ~2.1 MB | 武器属性 |
| `hunting_rewards` | 7,527 | ~1.4 MB | 怪物剥取/破坏报酬 |
| `armor` | 5,637 | ~1.1 MB | 防具属性 |
| `quests` | 1,355 | ~0.26 MB | 任务 |
| 其余 15 张核心表 | ~8,000 | ~1.5 MB | 怪物/技能/装饰品/地图等 |

**→ 全量导出约 38 MB，必须拆分。** 已由 `scripts/export-json.js` 实现（见 `data/json/`）。

### 5.3 关键关联发现

| 发现 | 说明 | Web 设计含义 |
|---|---|---|
| 武器/防具名称不在自身表 | `weapons`、`armor`、`decorations`、`palico_weapons`、`palico_armor` 均无名称列，名称在 `items` 表 | 导出时必须 JOIN `items` 合并名称（脚本已实现） |
| ID 完全对应 | 武器 10,877 / 防具 5,637 / 装饰品 242 / 随从猫武器 495 的 `_id` 100% 存在于 `items` 表 | 可用 `_id` 直接关联 |
| 多语言字段 | `items` 表含 `name_zh`（21,153 条全填充）、`description_zh`（15,239 条）；怪物/防具/任务/技能均有 `name_zh` | 中文数据完整，Web 端可直接输出中文 |
| `components` 是配方表 | 73,187 行记录"某装备由哪些素材合成" | 体积大但价值高，已按装备内联到 JSON |
| `S.java` 是常量类 | 定义所有表名/列名常量 | 参考字段命名，无需迁移 |

---

## 六、Web 化精简建议

### 6.1 数据库导出策略（✅ 已实现）

1. **按模块拆分 JSON**，页面按需加载（已导出至 `data/json/`，全语言版）：

| 文件 | 内容 | 实际体积 |
|---|---:|---:|
| `monsters.json` | 怪物 + 弱点 + 栖息地 + 剥取 | 1.6 MB |
| `weapons.json` | 武器（JOIN items 合并名称）+ 制作素材 | 20.7 MB |
| `armor.json` | 防具（JOIN items）+ 套装 | 5.6 MB |
| `items.json` | 物品 + 调和 + 采集 | 21.5 MB |
| `quests.json` | 任务 + 报酬 | 6.3 MB |
| `skills.json` | 技能 + 技能树 + 装饰品 | 0.26 MB |
| `locations.json` | 地图 + 采集点 | 2.2 MB |
| `palicos.json` | 随从猫武器/防具 | 2.0 MB |

2. `components`（14 MB）不单独导出，**内联到对应装备 JSON**（已实现）。
3. `quest_rewards`（7 MB）同理，按任务内联（已实现）。
4. 跳过 12 张冗余/空表（已实现）。
5. 当前保存**全语言**（英/中/德/法/西/意/日），供 Web 端提供语言切换；若需精简可运行 `node scripts/export-json.js --lang zh` 只保留中文+英文，可省 40-50% 体积。

### 6.2 功能模块优先级（源自 `features/` 包）

| 优先级 | 模块 | 说明 |
|---|---|---|
| ★★★ 核心 | 怪物 / 武器 / 防具 / 道具 / 任务 / 技能 / 装饰品 / 搜索 | Web 首期实现 |
| ★★ 重要 | 地图 / 随从猫 / 调和 | 二期 |
| ☆ 可选 | 配装器（最复杂，2,423 行）/ 收藏夹 | 可用 localStorage 实现 |

### 6.3 推荐的 Web 项目结构

```
web/                          # 新建 Web 前端（与 Android 代码分离）
├── index.html
├── assets/
│   ├── icons/                # 物品图标（80个）
│   ├── monsters/             # 怪物图标（140个）
│   └── locations/            # 地图图标（27个）
├── data/                     # 从 data/json/ 复制所需模块
│   ├── monsters.json
│   ├── weapons.json
│   ├── armor.json
│   ├── items.json
│   ├── quests.json
│   ├── skills.json
│   ├── locations.json
│   └── palicos.json
├── css/
├── js/
│   ├── db.js                 # 数据加载/缓存
│   ├── i18n.js               # 多语言切换（全语言数据已就绪）
│   ├── search.js             # 全局搜索
│   └── pages/                # 各功能页面
└── README.md
```

### 6.4 GitHub Pages 托管关键提醒

1. GitHub Pages 只支持静态文件，无法直接运行 SQLite，已用 `scripts/` 将 `mhgu.db` 导出为 JSON。
2. 导出后的 JSON 按类别拆分，页面按需加载。
3. 图标资源（约 247 个 PNG，约 1.9 MB）可直接放进仓库，由 Pages 静态托管。
4. 建议在 `gh-pages` 分支或 `web/` 子目录中开发。