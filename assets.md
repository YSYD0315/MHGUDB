# MHGUDB 仓库文件夹/文件用途说明

> 本文档整理自仓库现状，用于帮助理解项目结构，为 Web 前端改造提供参考。
>
> 项目：**MHGU 数据库**（怪物猎人 XX / Generations Ultimate 资料库），由 Android 应用转向 Web 前端。
> Android 构建配置已删除；数据库、图标和原应用源码仍保留为 Web 数据资产与参考。

---

## 一、根目录

| 路径 | 类型 | 用途 |
|---|---|---|
| `README.md` | 文件 | 项目说明（已重写为中文 Web 版说明） |
| `LICENSE.txt` | 文件 | MIT 开源许可证（版权归 DavianCorp 2014），必须保留 |
| `.gitignore` | 文件 | Git 忽略规则（已补充 Web 版规则并中文化注释） |
| `assets.md` | 文件 | 本文档：仓库结构说明 |
| `app/` | 目录 | 原应用数据库、图标和源码参考（详见下文） |
| `scripts/` | 目录 | 数据库解包及 JSON 导出脚本 |
| `data/mhgu.db` | 文件 | 从原始压缩包解出的 SQLite 数据库 |
| `data/json/` | 目录 | 按模块拆分的中、日、英三语 JSON 数据 |

> 已删除：`PRIVACY.md`（隐私政策）、`changelog.txt`（更新日志）、`captures/`（调试抓包）、三个本地库模块及全部 Gradle 构建配置。原应用源码和图标资源仍保留在 `app/` 中。

### 1.1 数据处理脚本

| 路径 | 用途 |
|---|---|
| `scripts/unpack-db.js` | 解包 `app/src/main/assets/databases/mhgu.db.zip`，默认输出到 `data/mhgu.db` |
| `scripts/export-json.js` | 读取 `data/mhgu.db` 并按功能模块导出 JSON 到 `data/json/`；只保留中、日、英三语 |

重新生成数据时，在仓库根目录依次运行 `node scripts/unpack-db.js` 和 `node scripts/export-json.js`。导出脚本使用 Node.js 内置的 `node:sqlite` 模块。

---

## 二、`app/` —— 核心数据资产与源码参考

### 2.1 核心数据资产（Web 版必需）

| 路径 | 用途 | Web 处理方式 |
|---|---|---|
| `app/src/main/assets/databases/mhgu.db.zip` | **核心数据库**：压缩 5.1 MB / 解压 22.9 MB，42 张表，含全部游戏数据（怪物、武器、防具、任务、技能、物品等） | 需用脚本转换为 JSON（GitHub Pages 无法直接运行 SQLite） |
| `app/src/main/icon-res/drawable/` | **247 个图标**：怪物图标 140 个（1.6 MB）、物品图标 80 个（168 KB）、地图图标 27 个（168 KB） | 整体复制为 Web 静态资源（约 1.9 MB） |
| `data/mhgu.db` | 解包后的 SQLite 数据库（约 22.0 MiB） | 导出源文件；由 `unpack-db.js` 生成 |
| `data/json/` | 9 个按模块拆分的 JSON 文件，仅保留中、日、英三语 | Web 页面按需加载；后续由前端提供三语切换 |

### 2.2 Java/Kotlin 源码（`app/src/main/java/com/ghstudios/android/`，共 300 个文件）

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

## 三、数据库遍历结论（Web 导出依据）

### 3.1 表概况（42 张表）

- **9 张空表**：`asb_sets`、`charms`、`felyne_skills`、`food_combos`、`ingredients`、`wishlist`、`wishlist_component`、`wishlist_data`、`android_metadata` → 导出时跳过
- **3 张重复表**：`gathering_copy1`、`hunting_rewards_copy1`、`monster_damage_copy1`（与原始表结构完全相同）→ 导出时跳过

### 3.2 核心表数据量与原始 JSON 体积估算

| 表 | 行数 | 单表估算 JSON | Web 用途 |
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

上表是按数据库单表估算的规模，并非最终导出文件的大小。实际导出文件会因语言字段数量，以及装备名称、制作配方、任务报酬和关联资料合并进模块数据而变化。

### 3.3 关键关联发现

| 发现 | 说明 | Web 设计含义 |
|---|---|---|
| 武器/防具名称不在自身表 | `weapons`、`armor`、`decorations`、`palico_weapons`、`palico_armor` 均无名称列，名称在 `items` 表 | 导出时必须 JOIN `items` 合并名称 |
| ID 完全对应 | 武器 10,877 / 防具 5,637 / 装饰品 242 / 随从猫武器 495 的 `_id` 100% 存在于 `items` 表 | 可用 `_id` 直接关联 |
| 多语言字段 | 有未带语言后缀的默认英文文本，以及部分 `*_zh`、`*_ja` 等翻译列；其他语言列只存在于原始数据库 | Web 导出只保留中、日、英；后续界面提供这三种语言切换 |
| `components` 是配方表 | 73,187 行记录"某装备由哪些素材合成" | 体积大但价值高，建议按装备内联 |
| `S.java` 是常量类 | 定义所有表名/列名常量 | 参考字段命名，无需迁移 |

---

## 四、Web 化精简建议

### 4.1 数据库导出与语言策略

1. **按模块拆分 JSON**，页面按需加载。`data/json/` 中的三语导出文件及实测大小如下：

| 文件 | 内容 | 实测体积 |
|---|---|---:|
| `monsters.json` | 怪物 + 弱点 + 状态 + 栖息地 + 任务 + 报酬 + 伤害 | 1.62 MB |
| `weapons.json` | 武器（合并物品名称）+ 制作素材 | 15.25 MB |
| `armor.json` | 防具（合并物品名称）+ 制作素材 | 4.53 MB |
| `decorations.json` | 装饰品（合并物品名称）+ 制作素材 | 0.16 MB |
| `items.json` | 物品 + 调和 + 素材 + 任务 + 技能树 + 采集 | 12.79 MB |
| `quests.json` | 任务 + 报酬 | 4.61 MB |
| `skills.json` | 技能 + 技能树 | 0.10 MB |
| `locations.json` | 地图 + 采集点 | 2.17 MB |
| `palicos.json` | 随从猫武器/防具 + 探险信息 | 1.23 MB |

9 个文件合计约 42.5 MiB（44.5 MB）。

2. `components`（73,187 行）不单独导出，**内联到对应装备 JSON**。
3. `quest_rewards`（37,370 行）同理，按任务内联。
4. 跳过 9 张空表和 3 张重复表。
5. Web 输出仅保留中文、日文翻译及英文默认文本；其他语言从导出 JSON 中移除。原始数据库仅作为数据来源保留，不直接供 Web 加载。

### 4.2 功能模块优先级（源自 `features/` 包）

| 优先级 | 模块 | 说明 |
|---|---|---|
| ★★★ 核心 | 怪物 / 武器 / 防具 / 道具 / 任务 / 技能 / 装饰品 / 搜索 | Web 首期实现 |
| ★★ 重要 | 地图 / 随从猫 / 调和 | 二期 |
| ☆ 可选 | 配装器（最复杂，2,423 行）/ 收藏夹 | 可用 localStorage 实现 |

### 4.3 推荐的 Web 项目结构

```
web/                          # 计划新增的静态 Web 前端
├── index.html
├── assets/
│   ├── icons/                # 物品图标（80个）
│   ├── monsters/             # 怪物图标（140个）
│   └── locations/            # 地图图标（27个）
├── data/                     # 可直接使用仓库中的 data/json/，避免复制数据
│   ├── monsters.json         # 按模块拆分，按需加载
│   ├── weapons.json
│   ├── armor.json
│   ├── decorations.json
│   ├── items.json
│   ├── quests.json
│   ├── skills.json
│   ├── locations.json
│   └── palicos.json
├── css/
├── js/
│   ├── db.js                 # 数据加载/缓存
│   ├── search.js             # 全局搜索
│   ├── i18n.js               # 计划实现的语言选择与文本回退
│   └── pages/                # 各功能页面
└── README.md
```

### 4.4 GitHub Pages 托管关键提醒

1. GitHub Pages 只支持静态文件，无法直接运行 SQLite；使用 `scripts/` 中的脚本将数据库导出为 JSON。
2. 使用 `data/json/` 中按类别拆分的中、日、英三语 JSON，页面按需加载，并在 Web 前端实现三语切换。
3. 图标资源（约 247 个 PNG，约 1.9 MB）可直接放进仓库，由 Pages 静态托管。
4. 建议在 `gh-pages` 分支或 `web/` 子目录中开发。