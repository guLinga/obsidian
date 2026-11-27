(() => {
  const STORAGE_KEY = "quartz-left-sidebar-width"
  const MIN = 200
  const MAX = 560
  const DEFAULT = 320
  const MOBILE_MQ = "(max-width: 800px)"

  function clamp(n) {
    return Math.min(MAX, Math.max(MIN, n))
  }

  function applyWidth(px) {
    const w = clamp(px)
    document.documentElement.style.setProperty("--left-sidebar-width", `${w}px`)
    return w
  }

  function restore() {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    applyWidth(Number.isFinite(saved) && saved > 0 ? saved : DEFAULT)
  }

  function ensureHandle() {
    const sidebar = document.querySelector(".page > #quartz-body > .sidebar.left")
    if (!sidebar) return null
    let handle = sidebar.querySelector(":scope > .sidebar-resize-handle")
    if (!handle) {
      handle = document.createElement("div")
      handle.className = "sidebar-resize-handle"
      handle.setAttribute("role", "separator")
      handle.setAttribute("aria-orientation", "vertical")
      handle.setAttribute("aria-label", "调整左侧栏宽度")
      handle.tabIndex = 0
      sidebar.appendChild(handle)
    }
    return handle
  }

  function bind(handle) {
    if (!handle || handle.dataset.bound === "1") return
    handle.dataset.bound = "1"

    let startX = 0
    let startW = DEFAULT

    function onMove(e) {
      const x = e.touches ? e.touches[0].clientX : e.clientX
      applyWidth(startW + (x - startX))
      e.preventDefault()
    }

    function onUp() {
      handle.classList.remove("is-dragging")
      document.documentElement.classList.remove("is-resizing-sidebar")
      const current = getComputedStyle(document.documentElement)
        .getPropertyValue("--left-sidebar-width")
        .trim()
      const px = Number.parseFloat(current)
      if (Number.isFinite(px)) localStorage.setItem(STORAGE_KEY, String(Math.round(px)))
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onUp)
    }

    function onDown(e) {
      if (window.matchMedia(MOBILE_MQ).matches) return
      const x = e.touches ? e.touches[0].clientX : e.clientX
      startX = x
      startW = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--left-sidebar-width"),
      )
      if (!Number.isFinite(startW) || startW <= 0) startW = DEFAULT
      handle.classList.add("is-dragging")
      document.documentElement.classList.add("is-resizing-sidebar")
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("touchmove", onMove, { passive: false })
      window.addEventListener("touchend", onUp)
      e.preventDefault()
    }

    handle.addEventListener("pointerdown", onDown)
    handle.addEventListener("touchstart", onDown, { passive: false })

    handle.addEventListener("keydown", (e) => {
      if (window.matchMedia(MOBILE_MQ).matches) return
      const step = e.shiftKey ? 32 : 16
      const current =
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--left-sidebar-width"),
        ) || DEFAULT
      if (e.key === "ArrowLeft") {
        localStorage.setItem(STORAGE_KEY, String(applyWidth(current - step)))
        e.preventDefault()
      } else if (e.key === "ArrowRight") {
        localStorage.setItem(STORAGE_KEY, String(applyWidth(current + step)))
        e.preventDefault()
      }
    })
  }

  function init() {
    restore()
    bind(ensureHandle())
  }

  document.addEventListener("nav", init)
  document.addEventListener("render", init)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init)
  else init()
})()
