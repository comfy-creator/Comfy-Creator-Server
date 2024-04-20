### Comfy Inference API

This serves as the headless-backend for [ComfyCreator.com](https://comfycreator.com), (formerly [void.tech](https://void.tech)); it can be run locally with your own GPU, or run in a serverless environment. This repo does not provide a UI.

Project goals:

- Adapt ComfyUI to work in a serverless, multi-user environment more easily
- Add mypy static types to make the codebase easier to maintain
- Support Comfy Creator's new shared-document model
- Maintain compatability with the existing ComfyUI ecosystem of custom-nodes and workflows

### Requirements

- Python 3.8+

### Installation

- Clone this repo
- Run `python -m venv venv` and `Source ./venv/Scripts/activate`; this will create a virtual environment and activate it.
- Run `pip install -r requirements.txt`; this will install all dependencies. Possibly also try `pip install -r requirements.optional.txt` as well if you're not on Windows.
- Next, install pytorch using one of the following commands, depending on the environment you're running in:

Nvidia GPUs: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu121` to install Pytorch for your Nvidia CUDA.

AMD GPUs (Linux): `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7`

### Running

- Run `poetry run python main.py` to start the gen-server


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

#### Troubleshooting

If you get the "Torch not compiled with CUDA enabled" error, uninstall torch with:

```pip uninstall torch```

And install it again with the command above.

### Dependencies

Install the dependencies by opening your terminal inside the ComfyUI folder and:

```pip install -r requirements.txt```

After this you should have everything installed and can proceed to running ComfyUI.

### Others:

#### [Intel Arc](https://github.com/comfyanonymous/ComfyUI/discussions/476)

#### Apple Mac silicon

You can install ComfyUI in Apple Mac silicon (M1 or M2) with any recent macOS version.

1. Install pytorch nightly. For instructions, read the [Accelerated PyTorch training on Mac](https://developer.apple.com/metal/pytorch/) Apple Developer guide (make sure to install the latest pytorch nightly).
1. Follow the [ComfyUI manual installation](#manual-install-windows-linux) instructions for Windows and Linux.
1. Install the ComfyUI [dependencies](#dependencies). If you have another Stable Diffusion UI [you might be able to reuse the dependencies](#i-already-have-another-ui-for-stable-diffusion-installed-do-i-really-have-to-install-all-of-these-dependencies).
1. Launch ComfyUI by running `python main.py`

> **Note**: Remember to add your models, VAE, LoRAs etc. to the corresponding Comfy folders, as discussed in [ComfyUI manual installation](#manual-install-windows-linux).

#### DirectML (AMD Cards on Windows)

```pip install torch-directml``` Then you can launch ComfyUI with: ```python main.py --directml```

### I already have another UI for Stable Diffusion installed do I really have to install all of these dependencies?

You don't. If you have another UI installed and working with its own python venv you can use that venv to run ComfyUI. You can open up your favorite terminal and activate it:

```source path_to_other_sd_gui/venv/bin/activate```

or on Windows:

With Powershell: ```"path_to_other_sd_gui\venv\Scripts\Activate.ps1"```

With cmd.exe: ```"path_to_other_sd_gui\venv\Scripts\activate.bat"```

And then you can use that terminal to run ComfyUI without installing any dependencies. Note that the venv folder might be called something else depending on the SD UI.

# Running

```python main.py```

### For AMD cards not officially supported by ROCm

Try running it with this command if you have issues:

For 6700, 6600 and maybe other RDNA2 or older: ```HSA_OVERRIDE_GFX_VERSION=10.3.0 python main.py```

For AMD 7600 and maybe other RDNA3 cards: ```HSA_OVERRIDE_GFX_VERSION=11.0.0 python main.py```

# Notes

Only parts of the graph that have an output with all the correct inputs will be executed.

Only parts of the graph that change from each execution to the next will be executed, if you submit the same graph twice only the first will be executed. If you change the last part of the graph only the part you changed and the part that depends on it will be executed.

Dragging a generated png on the webpage or loading one will give you the full workflow including seeds that were used to create it.

You can use () to change emphasis of a word or phrase like: (good code:1.2) or (bad code:0.8). The default emphasis for () is 1.1. To use () characters in your actual prompt escape them like \\( or \\).

You can use {day|night}, for wildcard/dynamic prompts. With this syntax "{wild|card|test}" will be randomly replaced by either "wild", "card" or "test" by the frontend every time you queue the prompt. To use {} characters in your actual prompt escape them like: \\{ or \\}.

Dynamic prompts also support C-style comments, like `// comment` or `/* comment */`.

To use a textual inversion concepts/embeddings in a text prompt put them in the models/embeddings directory and use them in the CLIPTextEncode node like this (you can omit the .pt extension):

```embedding:embedding_filename.pt```


## How to increase generation speed?

Make sure you use the regular loaders/Load Checkpoint node to load checkpoints. It will auto pick the right settings depending on your GPU.

You can set this command line setting to disable the upcasting to fp32 in some cross attention operations which will increase your speed. Note that this will very likely give you black images on SD2.x models. If you use xformers or pytorch attention this option does not do anything.

```--dont-upcast-attention```

## How to show high-quality previews?

Use ```--preview-method auto``` to enable previews.

The default installation includes a fast latent preview method that's low-resolution. To enable higher-quality previews with [TAESD](https://github.com/madebyollin/taesd), download the [taesd_decoder.pth](https://github.com/madebyollin/taesd/raw/main/taesd_decoder.pth) (for SD1.x and SD2.x) and [taesdxl_decoder.pth](https://github.com/madebyollin/taesd/raw/main/taesdxl_decoder.pth) (for SDXL) models and place them in the `models/vae_approx` folder. Once they're installed, restart ComfyUI to enable high-quality previews.

## Support and dev channel

[Matrix space: #comfyui_space:matrix.org](https://app.element.io/#/room/%23comfyui_space%3Amatrix.org) (it's like discord but open source).

# QA

### Why did you make this?

I wanted to learn how Stable Diffusion worked in detail. I also wanted something clean and powerful that would let me experiment with SD without restrictions.

### Who is this for?

This is for anyone that wants to make complex workflows with SD or that wants to learn more how SD works. The interface follows closely how SD works and the code should be much more simple to understand than other SD UIs.
