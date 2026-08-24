const baseDPR = window.devicePixelRatio;

function setNotebookGrid() {
  const zoom = window.devicePixelRatio / baseDPR;
  document.body.style.setProperty("--dot-size", `${1 / zoom}px`);
  document.body.style.setProperty("--grid-size", `${48 / zoom}px`);
  document.body.style.setProperty("--paper-size", `${256 / zoom}px`);
}

setNotebookGrid();
window.addEventListener("resize", setNotebookGrid);

function onZoomChange(cb) {
  const mq = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
  mq.addEventListener("change", () => { cb(); onZoomChange(cb); }, { once: true });
}
onZoomChange(setNotebookGrid);

function paperTexture(el, defaults = {}) {
  let currentUrl = null;
  let config = {
    size: 256,
    tooth: 40,
    weight: 0.05,
    shade: 128,
    dye: [0, 0, 0],
    saturation: 0,
    ...defaults,
  };

  async function render(overrides = {}) {
    Object.assign(config, overrides);
    const { size, tooth, weight, shade, dye, saturation } = config;

    const c = new OffscreenCanvas(size, size);
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    const d = img.data;

    const [dr, dg, db] = dye;
    const alpha = Math.round(weight * 255);

    for (let i = 0; i < d.length; i += 4) {
      const fiber = (Math.random() - 0.5) * tooth;
      const gray = shade + fiber;
      d[i]     = Math.max(0, Math.min(255, gray + (dr - gray) * saturation));
      d[i + 1] = Math.max(0, Math.min(255, gray + (dg - gray) * saturation));
      d[i + 2] = Math.max(0, Math.min(255, gray + (db - gray) * saturation));
      d[i + 3] = alpha;
    }

    ctx.putImageData(img, 0, 0);
    const blob = await c.convertToBlob({ type: "image/png" });

    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(blob);
    el.style.setProperty("--paper-texture", `url(${currentUrl})`);
  }

  render();

  return {
    render,
    get config() { return { ...config }; },
    get url() { return currentUrl; },
  };
}

const paper = paperTexture(document.body, {
  tooth: 500,
  weight: 0.04,
  shade: 140,
});
