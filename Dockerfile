FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04 as runtime

# Configure shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV SHELL=/bin/bash
ENV PYTHONUNBUFFERED=1

# Set the working directory in the docker container
WORKDIR /comfy-ts

# Configure apt-get to automatically use noninteractive settings
ENV DEBIAN_FRONTEND=noninteractive

# Install system libraries
RUN apt-get update --yes && \
    apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends git wget curl bash libgl1 fuse software-properties-common openssh-server rsync dos2unix ffmpeg libmagic1 && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get --yes --no-install-recommends install python3.11-dev python3.11-venv && \
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen

# Install GCC and ONNX Runtime
RUN apt-get install --yes libcurand10 gcc g++ && \
    wget https://github.com/microsoft/onnxruntime/releases/download/v1.16.3/onnxruntime-linux-x64-gpu-1.16.3.tgz && \
    tar zxvf onnxruntime-linux-x64-gpu-1.16.3.tgz && \
    rm onnxruntime-linux-x64-gpu-1.16.3.tgz && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up Python and pip
RUN ln -s /usr/bin/python3.11 /usr/bin/python && \
    rm /usr/bin/python3 && \
    ln -s /usr/bin/python3.11 /usr/bin/python3 && \
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
    python get-pip.py

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install this project's python packages
RUN pip install --upgrade --no-cache-dir pip && \
    pip install --upgrade setuptools && \
    pip install --upgrade wheel && \
    pip install --upgrade --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

COPY requirements.txt requirements-ts.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -r requirements-ts.txt 

# Set up Jupyter Notebook
RUN jupyter contrib nbextension install --user && \
    jupyter nbextension enable --py widgetsnbextension

# Copy entire ComfyTS repo. Folders / files in .dockerignore will not be included
COPY . .

# Use dos2unix to ensure line-endings are unix-style
# TO DO: if we build these directories into ComfyTS, we can remove this step
RUN mv ./build_files/model_paths/symlinks.txt .
RUN dos2unix ./symlinks.txt

# Clone Custom-Nodes into container and install their dependencies
RUN mkdir -p /usr/share/custom_nodes && \
    mv ./build_files/custom_nodes/repos.txt /usr/share/custom_nodes/
RUN mv ./build_files/custom_nodes/pull_custom_nodes.sh /usr/local/bin/pull_custom_nodes.sh && \
    dos2unix /usr/local/bin/pull_custom_nodes.sh && \
    /usr/local/bin/pull_custom_nodes.sh > /var/log/pull_custom_nodes.log

RUN mv ./build_files/model_paths ./model_paths

# This will be our start script
RUN mv ./build_files/start.sh . && \
    rm -rf ./build_files
RUN dos2unix ./start.sh && \
    chmod +x ./start.sh

# Set default values for environment variables
# ENV APP_HOST=0.0.0.0
# ENV APP_PORT=8080

# Create user group so we don't have to run as root
# RUN useradd -l -M appuser
# USER appuser

# Run ComfyTS, Jupyter Notebook, and NGINX Proxy
CMD ["/comfy-ts/start.sh"]
