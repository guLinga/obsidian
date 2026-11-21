/**
 * 缩小 contentIndex.json：去掉全文 content，只留 title/tags/links。
 * 首页/侧栏仍只有名称；详情正文在各自 HTML 里，点进页面才下载。
 * 代价：站内搜索不能按正文全文检索。
 */
import fs from "node:fs"
import path from "node:path"

function findIndexFile() {
  const candidates = [
    process.env.CONTENT_INDEX_PATH,
    "./_site/static/contentIndex.json",
    "./static/contentIndex.json",
    "./public/static/contentIndex.json",
  ].filter(Boolean)

  for (const p of candidates) {
    const abs = path.resolve(p)
    if (fs.existsSync(abs)) return abs
  }

  for (const root of ["./_site", "./public", "./dist", "."]) {
    if (!fs.existsSync(root)) continue
    const stack = [root]
    while (stack.length) {
      const dir = stack.pop()
      let entries = []
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true })
      } catch {
        continue
      }
      for (const ent of entries) {
        const full = path.join(dir, ent.name)
        if (ent.isDirectory()) {
          if (ent.name === "node_modules" || ent.name === ".git") continue
          stack.push(full)
        } else if (ent.name === "contentIndex.json") {
          return path.resolve(full)
        }
      }
    }
  }
  return null
}

const indexPath = findIndexFile()
if (!indexPath) {
  console.error("[slim-content-index] contentIndex.json not found")
  console.error("[slim-content-index] cwd=", process.cwd())
  for (const d of [".", "_site", "public", "dist"]) {
    if (!fs.existsSync(d)) continue
    console.error(`[slim-content-index] ls ${d}:`, fs.readdirSync(d).join(", "))
  }
  process.exit(1)
}

const before = fs.statSync(indexPath).size
const data = JSON.parse(fs.readFileSync(indexPath, "utf8"))

let entries = 0
for (const key of Object.keys(data)) {
  const entry = data[key]
  if (!entry || typeof entry !== "object") continue
  entries++
  delete entry.content
  delete entry.richContent
}

fs.writeFileSync(indexPath, JSON.stringify(data))
const after = fs.statSync(indexPath).size
console.log(
  `[slim-content-index] ${indexPath}\n  ${entries} entries: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB`,
)
