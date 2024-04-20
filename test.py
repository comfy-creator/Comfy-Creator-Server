import asyncio
import websockets
import json
import aiohttp
import y_py as Y

async def run_test():
    server_url = "http://127.0.0.1:8188"
    ws_uri = f"ws://127.0.0.1:8188/ws"

    ydoc = Y.YDoc()  # Create a Yjs document to store the progressive outputs
    provider = None 

    # Define a sample workflow with "workflows" output structure
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

    # Connect to the websocket to receive updates
    async with websockets.connect(ws_uri) as websocket:
        # Receive and process progressive outputs and updates
        while True:
            message = await websocket.recv()
            data = json.loads(message)

            print(message)

            if data["type"] == "yjs_update":
                # Apply Yjs update to the local document
                update_data_str = json.dumps(data["data"]) 
                update_data = update_data_str.encode()
                Y.apply_update(ydoc, message)

                # Access and display the progressive outputs
                output_map = ydoc.get_map("workflows")
                if output_map.get("images"):
                    images_data = json.loads(output_map.get("images"))
                    print("Received images data:", images_data)
            elif data["type"] == "status":
                # Process status updates from the server
                print("Status update:", data["data"])
            else:
                print("Received message:", data)

asyncio.run(run_test())