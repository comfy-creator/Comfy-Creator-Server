#This is an example that uses the websockets api to know when a prompt execution is done
#Once the prompt execution is done it downloads the images using the /history endpoint

import websocket #NOTE: websocket-client (https://github.com/websocket-client/websocket-client)
import uuid
import json
import urllib.request
import urllib.parse

server_address = "127.0.0.1:8188"
client_id = str(uuid.uuid4())

print("Starting client with id: {}".format(client_id))

def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": client_id}
    data = json.dumps(p).encode('utf-8')
    req =  urllib.request.Request("http://{}/prompt".format(server_address), data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_image(filename, subfolder, folder_type):
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    with urllib.request.urlopen("http://{}/view?{}".format(server_address, url_values)) as response:
        return response.read()

def get_history(prompt_id):
    with urllib.request.urlopen("http://{}/history/{}".format(server_address, prompt_id)) as response:
        return json.loads(response.read())

def get_images(ws, prompt):
    prompt_id = queue_prompt(prompt)['prompt_id']
    output_images = {}
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message['type'] == 'executing':
                data = message['data']
                if data['node'] is None and data['prompt_id'] == prompt_id:
                    break #Execution is done
        else:
            continue #previews are binary data

    history = get_history(prompt_id)[prompt_id]
    for o in history['outputs']:
        for node_id in history['outputs']:
            node_output = history['outputs'][node_id]
            if 'images' in node_output:
                images_output = []
                for image in node_output['images']:
                    image_data = get_image(image['filename'], image['subfolder'], image['type'])
                    images_output.append(image_data)
            output_images[node_id] = images_output

    return output_images

prompt_text = """
{
  "60": {
    "inputs": {
      "image": "ComfyUI_temp_ojiqm_00001_.png",
      "upload": "image"
    },
    "class_type": "LoadImage",
    "_meta": {
      "title": "Load Image"
    }
  },
  "61": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "preview": true,
      "bucket_name": "my-bucket",
      "images": [
        "60",
        0
      ]
    },
    "class_type": "SaveFile",
    "_meta": {
      "title": "Save File"
    }
  }
}
"""

prompt = json.loads(prompt_text)
#set the text prompt for our positive CLIPTextEncode
# prompt["6"]["inputs"]["text"] = "masterpiece best quality man"

#set the seed for our KSampler node
# prompt["3"]["inputs"]["seed"] = 5

ws = websocket.WebSocket()
ws.connect("ws://{}/ws?clientId={}".format(server_address, client_id))
images = get_images(ws, prompt)

#Commented out code to display the output images:

# for node_id in images:
#     for image_data in images[node_id]:
#         from PIL import Image
#         import io
#         image = Image.open(io.BytesIO(image_data))
#         image.show()


print("Done!")
