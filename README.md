# MHGU 数据库

怪物猎人 XX / Generations Ultimate（MHGU）资料库。项目正从 Android 应用转向静态 Web 前端，计划通过 GitHub Pages 托管。

## 当前仓库内容

| 路径 | 用途 |
|---|---|
| `app/src/main/assets/databases/mhgu.db.zip` | 原始 SQLite 数据库压缩包，是数据导出的来源 |
| `app/src/main/icon-res/drawable/` | 247 个游戏图标：怪物 140 个、物品 80 个、地图 27 个 |
| `app/src/main/java/com/ghstudios/android/` | 原 Android 应用源码，仅供数据模型和业务逻辑参考；当前仓库不包含 Android 构建配置 |
| `scripts/unpack-db.js` | 解包数据库压缩包，生成 `data/mhgu.db` |
| `scripts/export-json.js` | 将 SQLite 数据按模块导出到 `data/json/` |
| `data/mhgu.db` | 从原始压缩包解出的 SQLite 数据库 |
| `data/json/` | 已生成的分模块 JSON 数据，仅保留中、日、英三语 |
| `assets.md` | 仓库目录、数据结构及 Web 化说明 |
| `LICENSE.txt` | MIT 开源许可证 |

## 数据与语言

数据库包含怪物、武器、防具、任务、技能、物品、装饰品、地图和随从猫等资料。Web 使用的 `data/json/` 按模块拆分，只保留中文、日文翻译字段和英文默认文本；不同数据类型实际具备的翻译字段可能不同。

后续 Web 前端计划提供简体中文、日语和英语切换。原始数据库文件保留为数据来源；导出到 Web 的 JSON 不包含其他语言。

### 重新生成数据

在仓库根目录运行：

```sh
node scripts/unpack-db.js
node scripts/export-json.js
```

导出脚本只生成中、日、英三语资源。运行环境需要支持 Node.js 内置的 `node:sqlite` 模块。

## Web 前端计划

GitHub Pages 仅托管静态文件，不能直接查询 SQLite，因此前端将使用 `data/json/` 中的分模块数据，并按需加载。后续工作包括搭建 Web 界面、实现全局搜索与语言切换，并配置 GitHub Pages 发布。

原 Android 源码和图标可作为数据字段、页面功能和视觉资源的参考。更多目录与数据库说明见 [assets.md](./assets.md)。

## 许可证

本项目基于 [MIT 许可证](./LICENSE.txt) 开源。
