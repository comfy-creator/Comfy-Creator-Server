import asyncio
import websockets
import json
import aiohttp
import y_py as Y

async def run_client():
    server_url = "http://127.0.0.1:8188" 
    uri = "ws://127.0.0.1:8188/ws"

    ydoc = Y.YDoc()  # Local Yjs document
    provider = None  # You can add a provider for real-time collaboration (e.g., WebrtcProvider)

    # Define and send a sample workflow (use your actual workflow here)
    workflow = {
        '375da500-7d7f-46c9-82f7-d6ef89761a97': 
            {
                'class_type': 'LoadImage', 
                '_meta': {'title': 'Load Image'}, 
                'inputs': {'image': 'example.png'}
            }, 
        '4a205b27-a663-4923-bd36-50e4968eb15e': 
            {
                'class_type': 'SaveImage', 
                '_meta': {'title': 'Save Image'}, 
                'inputs': {'images': ['375da500-7d7f-46c9-82f7-d6ef89761a97', 0], 
                        'filename_prefix': 'ComfyUI'}
            },
        'outputs':{
            'images': [ "4a205b27-a663-4923-bd36-50e4968eb15e", 0 ],
        }
    }

    # Send the prompt through the /prompt endpoint
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{server_url}/prompt", json={"prompt": workflow}) as response:
            if response.status == 200:
                prompt_data = await response.json()
                print("Prompt submitted successfully:", prompt_data)
            else:
                print("Error submitting prompt:", await response.text())
                return

    async with websockets.connect(uri) as websocket:
        
        await websocket.send(json.dumps({"prompt": workflow}))

        # Receive and process messages from the server
        while True:
            message = await websocket.recv()
            data = json.loads(message)

            if data["type"] == "yjs_update":
                # Apply Yjs update to the local document
                update_data = data["data"]
                Y.apply_update(ydoc, update_data.encode())  # Encode update data before applying

                # Access and process the updated outputs
                output_map = ydoc.get_map("workflows")
                if output_map.get("latent_image"):
                    latent_image_data = json.loads(output_map.get("latent_image"))
                    print("Received latent image data:", latent_image_data)
                if output_map.get("generated_image"):
                    generated_image_data = json.loads(output_map.get("generated_image"))
                    print("Received generated image data:", generated_image_data)
                    # You can further process the image data here (e.g., save to a file, display)

            elif data["type"] == "status":
                print("Status update:", data["data"])
            else:
                print("Received message:", data)

asyncio.run(run_client())