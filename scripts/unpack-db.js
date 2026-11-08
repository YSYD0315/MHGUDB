#!/usr/bin/env node
/**
 * 解包数据库脚本
 * -----------------
 * 将 app/src/main/assets/databases/mhgu.db.zip 解压为 SQLite 数据库文件，
 * 供后续导出 JSON 使用（GitHub Pages 无法直接运行 SQLite）。
 *
 * 用法：
 *   node scripts/unpack-db.js
 *
 * 可选参数：
 *   --zip <路径>     指定 zip 文件路径（默认自动查找）
 *   --out <路径>     指定输出 .db 文件路径（默认输出到 data/ 目录）
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---- 简易命令行参数解析 ----
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

// ---- 路径定位 ----
const repoRoot = path.resolve(__dirname, '..');
const defaultZip = path.join(
  repoRoot,
  'app', 'src', 'main', 'assets', 'databases', 'mhgu.db.zip'
);
const zipPath = path.resolve(getArg('--zip', defaultZip));
const outPath = path.resolve(
  getArg('--out', path.join(repoRoot, 'data', 'mhgu.db'))
);

// ---- 解压 ----
if (!fs.existsSync(zipPath)) {
  console.error(`[错误] 找不到 zip 文件：${zipPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });

console.log(`[1/2] 读取压缩包：${zipPath}`);
const zipBuf = fs.readFileSync(zipPath);

// zip 中央目录解析（简化版，适用于单文件 zip）
// 查找 End of Central Directory (EOCD) 签名 0x06054b50
let eocd = -1;
for (let i = zipBuf.length - 22; i >= 0; i--) {
  if (zipBuf.readUInt32LE(i) === 0x06054b50) {
    eocd = i;
    break;
  }
}
if (eocd === -1) {
  console.error('[错误] 无效的 zip 文件（未找到中央目录）');
  process.exit(1);
}

const entryCount = zipBuf.readUInt16LE(eocd + 10);
const cdOffset = zipBuf.readUInt32LE(eocd + 16);
console.log(`[信息] 压缩包内条目数：${entryCount}`);

// 遍历中央目录，找到第一个文件条目
let found = false;
let offset = cdOffset;
for (let i = 0; i < entryCount; i++) {
  if (zipBuf.readUInt32LE(offset) !== 0x02014b50) {
    console.error('[错误] 中央目录损坏');
    process.exit(1);
  }
  const method = zipBuf.readUInt16LE(offset + 10);
  const compSize = zipBuf.readUInt32LE(offset + 20);
  const uncompSize = zipBuf.readUInt32LE(offset + 24);
  const nameLen = zipBuf.readUInt16LE(offset + 28);
  const extraLen = zipBuf.readUInt16LE(offset + 30);
  const commentLen = zipBuf.readUInt16LE(offset + 32);
  const localOffset = zipBuf.readUInt32LE(offset + 42);
  const name = zipBuf.toString('utf8', offset + 46, offset + 46 + nameLen);

  // 读取本地文件头，获取数据起始位置
  if (zipBuf.readUInt32LE(localOffset) !== 0x04034b50) {
    console.error('[错误] 本地文件头损坏');
    process.exit(1);
  }
  const localNameLen = zipBuf.readUInt16LE(localOffset + 26);
  const localExtraLen = zipBuf.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + localNameLen + localExtraLen;
  const compData = zipBuf.subarray(dataStart, dataStart + compSize);

  let outBuf;
  if (method === 0) {
    outBuf = Buffer.from(compData); // 存储（无压缩）
  } else if (method === 8) {
    outBuf = zlib.inflateRawSync(compData); // deflate
  } else {
    console.error(`[错误] 不支持的压缩方法：${method}`);
    process.exit(1);
  }

  if (outBuf.length !== uncompSize) {
    console.error('[错误] 解压后大小不匹配');
    process.exit(1);
  }

  fs.writeFileSync(outPath, outBuf);
  console.log(`[2/2] 已解压：${name} (${(outBuf.length / 1024 / 1024).toFixed(2)} MB) -> ${outPath}`);
  found = true;
  break;
}

if (!found) {
  console.error('[错误] 压缩包内没有文件');
  process.exit(1);
}

console.log('\n完成。下一步可运行：node scripts/export-json.js');