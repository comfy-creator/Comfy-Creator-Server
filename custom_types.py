from typing import TypedDict, Optional, Dict
from autogen_python.comfy_request.v1_pb2 import ComfyRequest, JobSnapshot, WorkflowStep
from autogen_python.serialized_graph.v1_pb2 import SerializedGraph

class ExtraPNGInfo(TypedDict):
    serializedGraph: Optional[SerializedGraph]

class ExtraData(TypedDict):
    extra_pnginfo: ExtraPNGInfo
    
class QueueJobRequest(TypedDict):
    prompt: Dict[str, WorkflowStep]
    client_id: str
    workflow: Dict[str, WorkflowStep]
    extra_data: ExtraData