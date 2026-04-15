export class WebGPURenderer {

  constructor(params = {}) {
    this.canvas = document.createElement("canvas");
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
      throw new Error("WebGPU não suportado neste navegador.");
    }

    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      throw new Error("Falha ao obter GPUAdapter.");
    }

    // Pode expor `requiredFeatures`/`requiredLimits` via `params` depois
    this.device = await this.adapter.requestDevice({});

    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.ready = true;

    // Configurar o contexto logo após o init
    this.configureContext();
  }

  // Renomeado para algo mais óbvio; poderia ser `configureCanvas`
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

  // Getter padrão de renderer
  get domElement() {
    return this.canvas;
  }

  // `render` pode ser estendido depois para receber `scene` e `camera`
  render(/* scene, camera */) {
    if (!this.ready || !this.device || !this.context) return;

    const commandEncoder = this.device.createCommandEncoder();

    // Atualiza a textura do canvas toda vez
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

    // em vez de escrever nada, apenas encerra o pass
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}