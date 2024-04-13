import requests
from PIL import Image
import json

# Make a request to the endpoint
response = requests.get('http://127.0.0.1:8188/view_all')

# Parse the JSON response
data = response.json()

# Display each image
# for file_path in data['files']:
#     img = Image.open(file_path)
#     img.show()

print(data['files'])