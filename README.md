### Comfy Inference API

This serves as the headless-backend for [ComfyCreator.com](https://comfycreator.com), (formerly [void.tech](https://void.tech)); it can be run locally with your own GPU, or run in a serverless environment. This repo does not provide a UI.

Project goals:

- Adapt ComfyUI to work in a serverless, multi-user environment more easily
- Add mypy static types to make the codebase easier to maintain
- Support Comfy Creator's new shared-document model
- Maintain compatability with the existing ComfyUI ecosystem of custom-nodes and workflows

### Requirements

You need the following installed locally: 

- Python 3.10+
- (maybe a js-package manager, like yarn, npm, or pnpm)

### How to Run

First git-clone this repo, then run:

`python start.py`

(NOTE: this guide needs to be updated; the Comfy Creator front-end is now in a separate repo.)

After installing npm-dependencies and building the React app, you'll be given the option to select either a 'local' or 'remote' server.

- Local: a local server will be started on port 8188 on your machine, utilizing your own GPU (or CPU if none is found) to run inference requests.
- Rmote: you'll be prompted to login to comfycreator.com to obtain an API-key. The React app will run inference requests on void.tech's remote GPUs.

Either way, to view the React app open your browser at `localhost:8188`.

### Running with Docker Instead:

If you'd prefer to use Docker instead, you can.

- Start your docker daemon (install Docker if you don't already have it), then in the root folder run the build command:

  `docker build -t comfycreator/inference-api:0.3.0 .`

- If you'd prefer to use our prebuilt docker-image instead, pull it from our docker hub:

  `docker pull comfycreator/inference-api:0.3.0`

Note that the docker-build does not copy any of the models into the docker-image, which would bloat the image-size. Instead, it expects to load the models from an external filesystem upon startup; in this case, on your local computer. To run the container, use the command:

  `docker run -it --name comfy_api --gpus all -p 8188:8188 -v "$(pwd)"/storage:(???)`

### Other ComfyUI docker images

Check these out as alternative ComfyUI docker containers, if you'd rather run the class ComfyUI Prompt Server:

- https://hub.docker.com/r/yanwk/comfyui-boot
- https://hub.docker.com/r/universonic/stable-diffusion-webui
- https://hub.docker.com/r/ashleykza/stable-diffusion-webui
- https://github.com/ai-dock/comfyui

### Docker To Do:

- Make sure filesystem cache and sym-links are working.
- Do we really need the extra_model_paths?
- We probably won't need sym-links and extra-model paths anymore to be honest; we can build those into comfy-inference-api directly.
- Stop custom nodes from downloading external files and doing pip-install at runtime (on startup). We should ensure that's all done at build-time.
- NFS sym-links: all of ComfyUI's folders (/input, /output, /temp, /models) should be symlinked to an NFS drive, so that they can be shared amongst workers.

This is the command to install the nightly with ROCm 6.0 which might have some performance improvements:

```pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/rocm6.0```


### General To Do:

- Add ComfyUI manager into this repo by default
- Add a startup flag to switch between using ComfyUI-local or using the void-tech API

### Future

- 

### List of Changes

- (everything changed from ComfyUI Prompt-Server...)

### Comfy Creator Extensions

Comfy Creator is designed to be extensible; anyone can build and publish an extensions. Terminology:

- Extension: a pip-package or git-repo that extends functionality

- Custom Nodes: a new node-type registered with LiteGraph; either by defining it in the the server (python) or by the front-end (Tyepscript / JS).. After being registered, it can be instantiated as needed.

- Custom Widgets: widgets are input boxes that exist inside of nodes; they are a concept handled by LiteGraph. You can register new widget-types with LiteGraph.

- Plugin: custom code that runs in the front-end (client). Extensions can have many plugins.


