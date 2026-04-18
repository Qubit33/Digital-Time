export class WebGPURenderer {

  constructor(params = {}) {
    this.canvas = document.getElementById("earthCanvas");
    this.context = this.canvas.getContext("webgpu");

    this.device = null;
    this.adapter = null;
    this.format = null;

    this.width = 0;
    this.height = 0;

    this.ready = false;
  }

  async init() {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported in this browser.");
    }

    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      throw new Error("Failed to obtain GPUAdapter.");
    }

    this.device = await this.adapter.requestDevice({});

    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.ready = true;

    this.configureContext();
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.setSize(w, h);
  }

  configureContext() {
    if (!this.device || !this.context) return;

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "opaque"
    });
  }

  setSize(w, h) {
    const dpr = window.devicePixelRatio || 1;

    this.width = w;
    this.height = h;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;

    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";

    this.configureContext();
  }

  get domElement() {
    return this.canvas;
  }

  render() {
    if (!this.ready || !this.device || !this.context) return;

    const commandEncoder = this.device.createCommandEncoder();

    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });

    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}