# This is a first attempt...

import os
import subprocess
import sys
import re

def create_virtual_env():
    # Create virtual environment
    subprocess.check_call([sys.executable, '-m', 'venv', 'venv'])
    print("Virtual environment created. Please activate it using 'source venv/bin/activate' on Unix or 'venv\\Scripts\\activate' on Windows before running this script again.")
    sys.exit()

def install_requirements():
    # Install required dependencies
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    # Attempt to install optional dependencies
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.extras.txt'])
    except subprocess.CalledProcessError:
        print("Some optional dependencies may not have been installed.")

def get_cuda_version():
    """
    Uses nvidia-smi to find the CUDA version installed on systems with NVIDIA GPUs.
    Returns the CUDA version as a string if found, otherwise None.
    """
    try:
        output = subprocess.check_output(["nvidia-smi"], universal_newlines=True)
        match = re.search(r"CUDA Version: (\d+\.\d+)", output)
        if match:
            return match.group(1)
    except Exception as e:
        print(f"Error finding CUDA version with nvidia-smi: {e}")
    return None

def install_pytorch():
    # Detect operating system and GPU type, then install appropriate PyTorch version
    os_type = sys.platform
    if os_type.startswith('linux'):
        gpu_info = str(subprocess.check_output('lspci', stderr=subprocess.STDOUT))
        if 'NVIDIA' in gpu_info:
            cuda_version = get_cuda_version()
            if cuda_version:
                print(f"Detected CUDA version: {cuda_version}")
                # Adjust the PyTorch installation command based on the detected CUDA version
                # This is a simplified example; you'll need to map CUDA versions to PyTorch wheel tags
                if cuda_version.startswith('11.'):
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu118'])
                elif cuda_version.startswith('12.'):
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu121'])
                else:
                    print("CUDA version not specifically handled. Installing the CPU version of PyTorch.")
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'torch torchvision torchaudio'])
            else:
                print("CUDA version could not be detected or CUDA is not installed. Installing the CPU version of PyTorch.")
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'torch', 'torchvision', 'torchaudio'])
        elif 'AMD' in gpu_info:
            # Example for AMD on Linux
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'torch', 'torchvision', 'torchaudio', '--index-url', 'https://download.pytorch.org/whl/rocm5.7'])
    elif os_type.startswith('win'):
        # Example for Windows, assuming NVIDIA for simplicity
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'torch', 'torchvision', 'torchaudio'])
    elif os_type == 'darwin':
        # Example for macOS, including Apple Silicon
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'torch', 'torchvision', 'torchaudio'])

if __name__ == '__main__':
    if not os.path.exists('venv'):
        create_virtual_env()
    install_requirements()
    install_pytorch()
    print("Installation completed. Please remember to activate the virtual environment before proceeding.")