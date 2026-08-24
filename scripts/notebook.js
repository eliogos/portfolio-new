const baseDPR = window.devicePixelRatio;

const notebook = {
    dotSize: 2,
    gridSize: 48,
    paperSize: 256,
};

function setNotebookGrid() {
    const scale = window.devicePixelRatio / baseDPR;

    document.body.style.setProperty(
        "--dot-size",
        `${notebook.dotSize / scale}px`
    );

    document.body.style.setProperty(
        "--grid-size",
        `${notebook.gridSize / scale}px`
    );

    document.body.style.setProperty(
        "--paper-size",
        `${notebook.paperSize / scale}px`
    );
}

setNotebookGrid();

window.addEventListener("resize", setNotebookGrid);

function onZoomChange(callback) {
    const mq = matchMedia(
        `(resolution: ${devicePixelRatio}dppx)`
    );

    mq.addEventListener(
        "change",
        () => {
            callback();
            onZoomChange(callback);
        },
        { once: true }
    );
}

onZoomChange(setNotebookGrid);


function paperTexture(el, defaults = {}) {
    let currentUrl = null;

    const config = {
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

        const {
            size,
            tooth,
            weight,
            shade,
            dye,
            saturation,
        } = config;

        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext("2d");
        const image = ctx.createImageData(size, size);
        const data = image.data;

        const [dr, dg, db] = dye;
        const alpha = Math.round(weight * 255);

        for (let i = 0; i < data.length; i += 4) {
            const fiber = (Math.random() - 0.5) * tooth;
            const gray = shade + fiber;

            data[i] = Math.max(
                0,
                Math.min(
                    255,
                    gray + (dr - gray) * saturation
                )
            );

            data[i + 1] = Math.max(
                0,
                Math.min(
                    255,
                    gray + (dg - gray) * saturation
                )
            );

            data[i + 2] = Math.max(
                0,
                Math.min(
                    255,
                    gray + (db - gray) * saturation
                )
            );

            data[i + 3] = alpha;
        }

        ctx.putImageData(image, 0, 0);

        const blob = await canvas.convertToBlob({
            type: "image/png",
        });

        if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
        }

        currentUrl = URL.createObjectURL(blob);

        el.style.setProperty(
            "--paper-texture",
            `url(${currentUrl})`
        );
    }

    render();

    return {
        render,

        get config() {
            return { ...config };
        },

        get url() {
            return currentUrl;
        },
    };
}

export const paper = paperTexture(document.body, {
  tooth: 500,
  weight: 0.06,
});
