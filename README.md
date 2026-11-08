# MHGU 数据库（MHGU Database）

> 怪物猎人 XX / Generations Ultimate（MHGU）资料库 —— 原为 Android 应用，现正迁移为 **Web 前端**，计划托管于 **GitHub Pages**。

本仓库是 [MHGen Database](https://github.com/zyth72/MHGenDatabase) 的衍生项目，已移除全部 Android 构建文件与资源，仅保留 Web 版所需的核心数据资产与源码参考。

---

## 仓库内容

| 路径 | 说明 |
|---|---|
| `app/src/main/assets/databases/mhgu.db.zip` | **核心数据库**（压缩 5.1 MB / 解压 22.9 MB，42 张表，含完整中文数据） |
| `app/src/main/icon-res/drawable/` | **247 个游戏图标**（怪物 140、物品 80、地图 27） |
| `app/src/main/java/` | **300 个 Java 源码文件**（原 Android 应用，保留作 Web 开发参考） |
| `scripts/` | **数据转换脚本**：`unpack-db.js`（解压数据库）、`export-json.js`（导出 JSON） |
| `data/` | **已导出的数据**：`json/`（按模块拆分的 JSON，全语言版） |
| `assets.md` | 仓库结构详细说明、数据库遍历结论与 Web 化精简建议 |
| `README.md` | 本文档 |
| `LICENSE.txt` | MIT 开源许可证 |
| `.gitignore` | Git 忽略规则 |

---

## 数据库

- 原始数据：`app/src/main/assets/databases/mhgu.db.zip`（压缩 5.1 MB，已入库）
- 解压后：`data/mhgu.db`（SQLite，约 22.9 MB，42 张表；**不入库**，由 `scripts/unpack-db.js` 生成）
- 内容：怪物、武器、防具、任务、技能、物品、装饰品、地图、随从猫等全部游戏数据
- 语言：含完整中文（`name_zh` 等字段）与英文等多语言字段（德/法/西/意/日），Web 端可提供语言切换
- 详细表结构、数据量与导出策略见 [assets.md](./assets.md)

### 已导出的 JSON（`data/json/`）

通过 `scripts/export-json.js` 将数据库按模块导出，供 GitHub Pages 静态托管使用：

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

> 以上为**全语言版**（含德/法/西/意/日字段），供 Web 端实现多语言切换。若需精简，可运行 `node scripts/export-json.js --lang zh` 只保留中文+英文。

## 图标资源

- 位置：`app/src/main/icon-res/drawable/`
- 怪物图标 140 个（约 1.6 MB）、物品图标 80 个（约 168 KB）、地图图标 27 个（约 168 KB）
- Web 版可直接作为静态资源复用

## 源码参考

- 位置：`app/src/main/java/com/ghstudios/android/`
- 已无法构建（构建文件已删除），仅作 Web 开发参考
- 重点参考：
  - `data/classes/` —— 数据模型类，指导 JSON 数据结构设计
  - `data/database/` —— SQL 查询逻辑，可翻译为 Web 端过滤/搜索逻辑
  - `features/` —— 各功能模块，是 Web 页面架构蓝图

---

## Web 化路线图

1. ✅ **导出数据**：`scripts/unpack-db.js` 解压数据库，`scripts/export-json.js` 按模块导出 JSON（已完成，见 `data/json/`）
2. **搭建前端**：新建 `web/` 项目（HTML/CSS/JS 静态站点），按需加载 JSON，提供多语言切换
3. **托管**：通过 GitHub Pages 发布
4. **重写文档**：README 已更新为 Web 版说明

详细方案见 [assets.md](./assets.md)。

---

## 许可证

本项目基于 [MIT 许可证](./LICENSE.txt) 开源。
