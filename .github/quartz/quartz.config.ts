import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "我的知识库",
    pageTitleSuffix: "",
    enableSPA: true,
    // 悬浮预览会额外拉取正文 HTML；关掉后首页更轻，点进详情才加载全文
    enablePopovers: false,
    analytics: null,
    locale: "zh-CN",
    // GitHub Pages 项目站：用户名.github.io/仓库名（不要加 https://）
    baseUrl: "gulinga.github.io/obsidian",
    ignorePatterns: ["private", "templates", ".obsidian", ".github"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        // 接近 Obsidian 默认的干净无衬线
        header: "Noto Sans SC",
        body: "Noto Sans SC",
        code: "IBM Plex Mono",
      },
      colors: {
        // 贴近截图：白底、浅灰分隔/选中、中性文字
        lightMode: {
          light: "#fafafa",
          lightgray: "#ebebeb",
          gray: "#b0b0b0",
          darkgray: "#5c5c5c",
          dark: "#2a2a2a",
          secondary: "#4a4a4a",
          tertiary: "#787878",
          highlight: "rgba(0, 0, 0, 0.06)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#1e1e1e",
          lightgray: "#2a2a2a",
          gray: "#6e6e6e",
          darkgray: "#bababa",
          dark: "#dadada",
          secondary: "#c8c8c8",
          tertiary: "#9a9a9a",
          highlight: "rgba(255, 255, 255, 0.08)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      // mermaid: false —— Mermaid 常占 JS/内联脚本约 2MB+，不用流程图就关掉
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false, mermaid: false }),
      Plugin.GitHubFlavoredMarkdown(),
      // 默认 maxDepth 是 3；改成 6 才能收录 ###### 标题
      Plugin.TableOfContents({
        maxDepth: 6,
        minEntries: 1,
        showByDefault: true,
        collapseByDefault: false,
      }),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      // KaTeX 约几百 KB；笔记几乎不用公式时可整行注释掉以再瘦一截
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // 关掉可加快构建；需要社交预览图时再打开
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
