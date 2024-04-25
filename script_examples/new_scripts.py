import os
import blake3
import boto3
import firebase_admin
from botocore.exceptions import ClientError
from firebase_admin import credentials, firestore
import websocket
import uuid
import json
import urllib.request
from urllib.parse import urlparse
from dotenv import load_dotenv


load_dotenv()


server_address = "127.0.0.1:8188"
client_id = "3e74171b-f65a-4a9a-a135-4e12fc46fe74"  # str(uuid.uuid4())


# Configure Firebase credentials
cred = credentials.Certificate("comfyimages-firebase-adminsdk-rmtn6-dd81abf28c.json")
firebase_admin.initialize_app(cred)

# Configure S3 client
session = boto3.Session(
    aws_access_key_id=os.getenv("DO_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("DO_SECRET_ACCESS_KEY"),
    region_name=os.getenv("REGION_NAME"),
)
client = session.client("s3", endpoint_url=os.getenv("DO_ENDPOINT_URL"))
bucket_name = os.getenv("BUCKET_NAME")
print("bucket_name", bucket_name)


# Function to upload an image to DigitalOcean Spaces
def upload_image(image_path):
    # Calculate the blake3 hash of the image
    with open(image_path, "rb") as f:
        file_bytes = f.read()
        file_hash = blake3.blake3(file_bytes).hexdigest()

    # Generate the reference in the format "file_(blake3 hash)"
    reference = f"img_{file_hash}"

    # Upload the image to DigitalOcean Spaces
    try:
        key = f"comfy-test/{reference}.png"

        client.put_object(Bucket=bucket_name, Key=key, Body=file_bytes, ACL="public-read")

        print("Done!")

        # Generate and return the image URL
        endpoint_url = client.meta.endpoint_url
        hostname = urlparse(endpoint_url).hostname

        image_url = f"https://{bucket_name}.{hostname}/{key}"

        # Save the reference and URL to Firebase Database
        db = firestore.client()
        db.collection("images").document(client_id).set({
            file_hash: image_url
        })

        print(reference)

        return reference
    except ClientError as e:
        print(f"Error uploading image: {e}")
        return None


# Function to fetch an image from DigitalOcean Spaces using the reference
def fetch_image(reference):
    hash = reference.split("_")[1]
    # Fetch the image URL from Firebase Realtime Database
    db = firestore.client()
    image_doc = db.collection("images").document(client_id).get()

    if image_doc.exists:
        image_data = image_doc.to_dict()
        image_url = image_data[hash]
        return image_url
    else:
        return None
    

ref = upload_image("SDAPI_00005_.png")
url = fetch_image(ref)

print(url)


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
  "11": {
    "inputs": {
      "image": "img_95314ab6fd250a8ca39767812012ffc1a3d9d661e8de427f35a21a59b1953bec",
      "upload": "image"
    },
    "class_type": "LoadImage",
    "_meta": {
      "title": "Load Image"
    }
  },
  "12": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "save_type": "local",
      "bucket_name": "my-bucket",
      "images": [
        "11",
        0
      ]
    },
    "class_type": "SaveAndPreviewImage",
    "_meta": {
      "title": "Save and Preview Image"
    }
  }
}
"""

prompt = json.loads(prompt_text)

# Change image location
prompt["11"]["inputs"]["image"] = ref



# ws = websocket.WebSocket()
# ws.connect("ws://{}/ws?clientId={}".format(server_address, client_id))
# images = get_images(ws, prompt)

#Commented out code to display the output images:

# for node_id in images:
#     for image_data in images[node_id]:
#         from PIL import Image
#         import io
#         image = Image.open(io.BytesIO(image_data))
#         image.show()