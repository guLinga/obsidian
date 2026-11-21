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
        // 自定义 CSS 会优先用系统字体；此处作 Web 回退
        header: "Noto Sans SC",
        body: "Noto Sans SC",
        code: "IBM Plex Mono",
      },
      colors: {
        // Apple 浅色：白内容区、灰侧栏、系统蓝交互
        lightMode: {
          light: "#ffffff",
          lightgray: "#e8e8ed",
          gray: "#86868b",
          darkgray: "#6e6e73",
          dark: "#1d1d1f",
          secondary: "#0071e3",
          tertiary: "#2997ff",
          highlight: "rgba(0, 113, 227, 0.1)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#000000",
          lightgray: "#1c1c1e",
          gray: "#8e8e93",
          darkgray: "#aeaeb2",
          dark: "#f5f5f7",
          secondary: "#0a84ff",
          tertiary: "#64d2ff",
          highlight: "rgba(10, 132, 255, 0.18)",
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
