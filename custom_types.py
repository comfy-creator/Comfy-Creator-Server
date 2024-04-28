import os
import sys
from typing import TypedDict, Optional, Dict

# Add our proto-definitions folder to the sys path
AUTOGEN_PATH = sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'autogen_python'))
if AUTOGEN_PATH not in sys.path:
    sys.path.append(AUTOGEN_PATH)

from autogen_python.workflow.v1_pb2 import WorkflowStep, Workflow
from autogen_python.comfy_request.v1_pb2 import ComfyRequest, JobSnapshot
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