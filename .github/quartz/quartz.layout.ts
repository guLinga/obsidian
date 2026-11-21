import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import type { QuartzComponent, QuartzComponentConstructor } from "./quartz/components/types"

/** 左侧栏拖拽调宽（宽度写入 --left-sidebar-width，并记 localStorage） */
const SidebarResize: QuartzComponentConstructor = () => {
  const Resizer: QuartzComponent = () => null
  Resizer.afterDOMLoaded = `
(() => {
  const KEY = "quartz-left-sidebar-width";
  const MIN = 160;
  const MAX_VW = 0.5;
  const MAX_PX = 560;

  function clamp(w) {
    const max = Math.min(window.innerWidth * MAX_VW, MAX_PX);
    return Math.min(Math.max(w, MIN), max);
  }

  function apply(width) {
    document.documentElement.style.setProperty("--left-sidebar-width", clamp(width) + "px");
  }

  const saved = localStorage.getItem(KEY);
  if (saved) apply(Number(saved));

  function bind() {
    if (window.matchMedia("(max-width: 799px)").matches) return;
    const sidebar = document.querySelector(".sidebar.left");
    if (!sidebar || sidebar.dataset.resizeBound === "1") return;
    sidebar.dataset.resizeBound = "1";

    let handle = sidebar.querySelector(".sidebar-resize-handle");
    if (!handle) {
      handle = document.createElement("div");
      handle.className = "sidebar-resize-handle";
      handle.title = "拖拽调整宽度";
      sidebar.appendChild(handle);
    }

    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = sidebar.getBoundingClientRect().width;
      handle.setPointerCapture(e.pointerId);

      const onMove = (ev) => {
        apply(startW + (ev.clientX - startX));
      };
      const onUp = (ev) => {
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        const raw = getComputedStyle(document.documentElement)
          .getPropertyValue("--left-sidebar-width")
          .replace("px", "");
        localStorage.setItem(KEY, String(clamp(Number(raw) || startW)));
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
    });
  }

  bind();
  document.addEventListener("nav", bind);
})();
`
  return Resizer
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [SidebarResize()],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/guLinga/obsidian",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    // Graph 会把 d3 等打进 JS（约 0.5MB+），不需要关系图谱就关掉以加速首屏
    // Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
