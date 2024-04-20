import asyncio
import websockets
import json

async def send_prompt(prompt_data):
    async with websockets.connect("ws://127.0.0.1:8188/ws") as websocket:
        # Send the prompt data as JSON
        await websocket.send(json.dumps({"prompt": prompt_data}))

        # Receive initial response to get generated node IDs
        initial_response = await websocket.recv()
        initial_data = json.loads(initial_response)
        node_mapping = initial_data["data"]["node_errors"]  # Extract node ID mapping

        # Map original IDs to server-generated IDs
        mapped_prompt_data = {}
        for original_id, node_info in prompt_data.items():
            server_id = node_mapping.get(original_id)
            if server_id:
                mapped_prompt_data[server_id] = node_info
            else:
                print(f"Error: Node ID {original_id} not found in server response")

        # Resend the prompt with mapped IDs
        await websocket.send(json.dumps({"prompt": mapped_prompt_data}))

        # Receive and print further status updates
        while True:
            response = await websocket.recv()
            response_data = json.loads(response)
            print(f"Received: {response_data}")

async def main():
    # Example prompt data (replace with your actual prompt)
    prompt_data = {
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
        }

    await send_prompt(prompt_data)

if __name__ == "__main__":
    asyncio.run(main())