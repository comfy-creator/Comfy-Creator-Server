/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import * as _m0 from "protobufjs/minimal";
import { Empty } from "./google/empty";
import { Struct } from "./google/struct";
import { SerializedGraph } from "./serialized_graph.v1";

export const protobufPackage = "comfy_request.v1";

/** These are more direct client-created workflows for client -> server -> worker */

/** Message definition for WorkflowStep */
export interface WorkflowStep {
  class_type: string;
  /** Inputs are too idiosyncratic to be typed specifically */
  inputs: { [key: string]: any } | undefined;
}

/**
 * TO DO: add conditional check for url conformity
 * Two files with the same hash are treated as equivalent; we use file-hashes as filenames.
 * File types returned:
 * image: png, jpg, svg, webp, gif
 * video: mp4
 * data: json (icluding RLE-encoded masks), npy (numpy array for embeddings)
 * TO DO: in the future, we may want more info, such as mask VS image, or latent preview
 */
export interface WorkflowFile {
  /** unique identifier for the file */
  file_hash: string;
  /** ComfyUI terminology: key 'format' */
  mime_type: string;
  reference?: WorkflowFile_FileReference | undefined;
  data?: Uint8Array | undefined;
}

export interface WorkflowFile_FileReference {
  /** string must be a valid url */
  url: string;
  /** Comfy UI terminology: key 'type', values 'temp' | 'output' */
  is_temp: boolean;
}

/**
 * TO DO: add specific buckets for different users perhaps?
 * Private VS public outputs?
 *
 * Right now: output-files are saved to our DO S3 bucket, and all of them are publicly
 * available.
 * Temp-files are saved to our DO S3 temp bucket, which is wiped after 24 hours.
 * Corresponding records exist in Firestore for both.
 * If 'save outputs' is false, then the output files are saved to the temp bucket
 * In the future, API-clients can provide us with S3 secrets which we can use to upload
 * to their specified account.
 * In the future we may allow for S3 presigned urls as well.
 * In the future we may add support for webhook callbacks.
 * In the future we may allow for direct binary outputs (instead of uploading files to S3
 * and then returning urls)
 */
export interface OutputConfig {
  save_outputs: boolean;
  send_latent_previews: boolean;
}

/** client -> server message */
export interface ComfyRequest {
  /** keys are node_ids */
  workflow: { [key: string]: WorkflowStep };
  serialized_graph?: SerializedGraph | undefined;
  input_files: WorkflowFile[];
  output_config: OutputConfig | undefined;
  worker_wait_duration?:
    | number
    | undefined;
  /** redis channel name to publish results to */
  session_id?: string | undefined;
}

export interface ComfyRequest_WorkflowEntry {
  key: string;
  value: WorkflowStep | undefined;
}

export interface JobCreated {
  /** created by the server; id of the job in the queue */
  job_id: string;
  /** redis channel to subscribe to for updates */
  session_id: string;
  queue_seconds: number;
  execution_seconds: number;
}

/** Latent-previews are not included */
export interface JobOutput {
  job_id: string;
  session_id: string;
  files: WorkflowFile[];
}

/** A list of job outputs from a session */
export interface SessionHistory {
  outputs: JobOutput[];
}

/** It's assumed that the consumer knows what session_id it's watching */
export interface ComfyMessage {
  job_id: string;
  user_id: string;
  queue_status?: ComfyMessage_QueueStatus | undefined;
  execution_start?: ComfyMessage_ExecutionStart | undefined;
  executing?: ComfyMessage_Executing | undefined;
  progress?: ComfyMessage_Progress | undefined;
  execution_error?: ComfyMessage_ExecutionError | undefined;
  execution_interrupted?: ComfyMessage_ExecutionInterrupted | undefined;
  execution_cached?: ComfyMessage_ExecutionCached | undefined;
  output?: ComfyMessage_Output | undefined;
  custom_message?: ComfyMessage_CustomMessage | undefined;
}

/**
 * updates queue-display on client. SID's purpose is unknown
 * ComfyUI terminology: 'Status'
 */
export interface ComfyMessage_QueueStatus {
  /** looks like: "99506f0d89b64dbdb09ae567274fb078" */
  sid?: string | undefined;
  queue_remaining: number;
}

/** job-started */
export interface ComfyMessage_ExecutionStart {
}

/**
 * job execution moved to node_id
 * There is a bug in ComfyUI where it'll send an Executing update with node: null at the
 * end of a job; we ignore these
 */
export interface ComfyMessage_Executing {
  node_id: string;
}

/** Updates a node's progress bar; like (value / max) = percent-complete */
export interface ComfyMessage_Progress {
  max: number;
  value: number;
}

/** we remove currentInputs and currentOutputs as they are too large */
export interface ComfyMessage_ExecutionError {
  currentInputs: { [key: string]: any } | undefined;
  currentOutputs: { [key: string]: any } | undefined;
  execution_message: string;
  exception_type: string;
  /** list of nodes executed */
  executed: string[];
  /** node id that threw the error */
  node_id: string;
  node_type: string;
  traceback: string[];
}

export interface ComfyMessage_ExecutionInterrupted {
  /** node-ids that already finished */
  executed: string[];
  node_id: string;
  node_type: string;
}

/** This specifies nodes that were skipped due to their output being cached */
export interface ComfyMessage_ExecutionCached {
  node_ids: string[];
}

/**
 * A node produced an output (temp or saved); display it
 * In the original ComfyUI, it's like output.images[0] = { filename, subfolder, type }, or output.gifs[0]
 * There is also output.animated; an array whose indices are bools corresponding to the images array
 * We simplify all of this
 * ComfyUI terinology; this is called 'Executed', which was confusing
 */
export interface ComfyMessage_Output {
  node_id: string;
  /** Note; in the future, we may need an 'event-type' as well */
  files: WorkflowFile[];
}

/** This is a catch-all; custom-nodes can define their own update-messages */
export interface ComfyMessage_CustomMessage {
  type: string;
  data: { [key: string]: any } | undefined;
}

/**
 * If outputs_only is true, then only Output messages will be returned,
 * otherwise all ComfyMessage types will be returned.
 * By default, output messages consisting of temp-files and latent-previews are
 * not included, but if you want them, set those flags to true.
 */
export interface MessageFilter {
  outputs_only: boolean;
  include_temp_files?: boolean | undefined;
  include_latent_previews?: boolean | undefined;
}

/** By default, all message-types will be returned, unless a filter is applied */
export interface StreamSessionRequest {
  session_id: string;
  filter?: MessageFilter | undefined;
}

export interface StreamJobRequest {
  job_id: string;
  filter?: MessageFilter | undefined;
}

export interface SessionId {
  session_id: string;
}

export interface JobId {
  job_id: string;
}

export interface NodeDefinition {
  display_name: string;
  description: string;
  category: string;
  inputs: NodeDefinition_InputDef[];
  outputs: NodeDefinition_OutputDef[];
  output_node: boolean;
}

export interface NodeDefinition_InputDef {
  label: string;
  edge_type: string;
  spec: { [key: string]: any } | undefined;
}

export interface NodeDefinition_OutputDef {
  label: string;
  edge_type: string;
}

export interface NodeDefs {
  defs: { [key: string]: NodeDefinition };
}

export interface NodeDefs_DefsEntry {
  key: string;
  value: NodeDefinition | undefined;
}

/** Leave blank to retrieve all node definitions */
export interface NodeDefRequest {
  extension_ids: string[];
}

export interface Models {
  info: Models_ModelInfo[];
}

export interface Models_ModelInfo {
  blake3_hash: string;
  display_name: string;
}

/** Maps architecture to model */
export interface ModelCatalog {
  models: { [key: string]: Models };
}

export interface ModelCatalog_ModelsEntry {
  key: string;
  value: Models | undefined;
}

/** Leave blank to retrieve all models */
export interface ModelCatalogRequest {
  architecture: string[];
}

function createBaseWorkflowStep(): WorkflowStep {
  return { class_type: "", inputs: undefined };
}

export const WorkflowStep = {
  encode(message: WorkflowStep, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.class_type !== "") {
      writer.uint32(10).string(message.class_type);
    }
    if (message.inputs !== undefined) {
      Struct.encode(Struct.wrap(message.inputs), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowStep {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkflowStep();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.class_type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.inputs = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<WorkflowStep>): WorkflowStep {
    return WorkflowStep.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<WorkflowStep>): WorkflowStep {
    const message = createBaseWorkflowStep();
    message.class_type = object.class_type ?? "";
    message.inputs = object.inputs ?? undefined;
    return message;
  },
};

function createBaseWorkflowFile(): WorkflowFile {
  return { file_hash: "", mime_type: "", reference: undefined, data: undefined };
}

export const WorkflowFile = {
  encode(message: WorkflowFile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.file_hash !== "") {
      writer.uint32(10).string(message.file_hash);
    }
    if (message.mime_type !== "") {
      writer.uint32(18).string(message.mime_type);
    }
    if (message.reference !== undefined) {
      WorkflowFile_FileReference.encode(message.reference, writer.uint32(26).fork()).ldelim();
    }
    if (message.data !== undefined) {
      writer.uint32(34).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowFile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkflowFile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.file_hash = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.mime_type = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.reference = WorkflowFile_FileReference.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.data = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<WorkflowFile>): WorkflowFile {
    return WorkflowFile.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<WorkflowFile>): WorkflowFile {
    const message = createBaseWorkflowFile();
    message.file_hash = object.file_hash ?? "";
    message.mime_type = object.mime_type ?? "";
    message.reference = (object.reference !== undefined && object.reference !== null)
      ? WorkflowFile_FileReference.fromPartial(object.reference)
      : undefined;
    message.data = object.data ?? undefined;
    return message;
  },
};

function createBaseWorkflowFile_FileReference(): WorkflowFile_FileReference {
  return { url: "", is_temp: false };
}

export const WorkflowFile_FileReference = {
  encode(message: WorkflowFile_FileReference, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.is_temp === true) {
      writer.uint32(16).bool(message.is_temp);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkflowFile_FileReference {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkflowFile_FileReference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.url = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.is_temp = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<WorkflowFile_FileReference>): WorkflowFile_FileReference {
    return WorkflowFile_FileReference.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<WorkflowFile_FileReference>): WorkflowFile_FileReference {
    const message = createBaseWorkflowFile_FileReference();
    message.url = object.url ?? "";
    message.is_temp = object.is_temp ?? false;
    return message;
  },
};

function createBaseOutputConfig(): OutputConfig {
  return { save_outputs: false, send_latent_previews: false };
}

export const OutputConfig = {
  encode(message: OutputConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.save_outputs === true) {
      writer.uint32(8).bool(message.save_outputs);
    }
    if (message.send_latent_previews === true) {
      writer.uint32(16).bool(message.send_latent_previews);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OutputConfig {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOutputConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.save_outputs = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.send_latent_previews = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<OutputConfig>): OutputConfig {
    return OutputConfig.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<OutputConfig>): OutputConfig {
    const message = createBaseOutputConfig();
    message.save_outputs = object.save_outputs ?? false;
    message.send_latent_previews = object.send_latent_previews ?? false;
    return message;
  },
};

function createBaseComfyRequest(): ComfyRequest {
  return {
    workflow: {},
    serialized_graph: undefined,
    input_files: [],
    output_config: undefined,
    worker_wait_duration: undefined,
    session_id: undefined,
  };
}

export const ComfyRequest = {
  encode(message: ComfyRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.workflow).forEach(([key, value]) => {
      ComfyRequest_WorkflowEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    if (message.serialized_graph !== undefined) {
      SerializedGraph.encode(message.serialized_graph, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.input_files) {
      WorkflowFile.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.output_config !== undefined) {
      OutputConfig.encode(message.output_config, writer.uint32(34).fork()).ldelim();
    }
    if (message.worker_wait_duration !== undefined) {
      writer.uint32(40).uint32(message.worker_wait_duration);
    }
    if (message.session_id !== undefined) {
      writer.uint32(50).string(message.session_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = ComfyRequest_WorkflowEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.workflow[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.serialized_graph = SerializedGraph.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.input_files.push(WorkflowFile.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.output_config = OutputConfig.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.worker_wait_duration = reader.uint32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.session_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyRequest>): ComfyRequest {
    return ComfyRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyRequest>): ComfyRequest {
    const message = createBaseComfyRequest();
    message.workflow = Object.entries(object.workflow ?? {}).reduce<{ [key: string]: WorkflowStep }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = WorkflowStep.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    message.serialized_graph = (object.serialized_graph !== undefined && object.serialized_graph !== null)
      ? SerializedGraph.fromPartial(object.serialized_graph)
      : undefined;
    message.input_files = object.input_files?.map((e) => WorkflowFile.fromPartial(e)) || [];
    message.output_config = (object.output_config !== undefined && object.output_config !== null)
      ? OutputConfig.fromPartial(object.output_config)
      : undefined;
    message.worker_wait_duration = object.worker_wait_duration ?? undefined;
    message.session_id = object.session_id ?? undefined;
    return message;
  },
};

function createBaseComfyRequest_WorkflowEntry(): ComfyRequest_WorkflowEntry {
  return { key: "", value: undefined };
}

export const ComfyRequest_WorkflowEntry = {
  encode(message: ComfyRequest_WorkflowEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      WorkflowStep.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyRequest_WorkflowEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyRequest_WorkflowEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = WorkflowStep.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyRequest_WorkflowEntry>): ComfyRequest_WorkflowEntry {
    return ComfyRequest_WorkflowEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyRequest_WorkflowEntry>): ComfyRequest_WorkflowEntry {
    const message = createBaseComfyRequest_WorkflowEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? WorkflowStep.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseJobCreated(): JobCreated {
  return { job_id: "", session_id: "", queue_seconds: 0, execution_seconds: 0 };
}

export const JobCreated = {
  encode(message: JobCreated, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.job_id !== "") {
      writer.uint32(10).string(message.job_id);
    }
    if (message.session_id !== "") {
      writer.uint32(18).string(message.session_id);
    }
    if (message.queue_seconds !== 0) {
      writer.uint32(24).uint32(message.queue_seconds);
    }
    if (message.execution_seconds !== 0) {
      writer.uint32(32).uint32(message.execution_seconds);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): JobCreated {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJobCreated();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.job_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.session_id = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.queue_seconds = reader.uint32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.execution_seconds = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<JobCreated>): JobCreated {
    return JobCreated.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<JobCreated>): JobCreated {
    const message = createBaseJobCreated();
    message.job_id = object.job_id ?? "";
    message.session_id = object.session_id ?? "";
    message.queue_seconds = object.queue_seconds ?? 0;
    message.execution_seconds = object.execution_seconds ?? 0;
    return message;
  },
};

function createBaseJobOutput(): JobOutput {
  return { job_id: "", session_id: "", files: [] };
}

export const JobOutput = {
  encode(message: JobOutput, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.job_id !== "") {
      writer.uint32(10).string(message.job_id);
    }
    if (message.session_id !== "") {
      writer.uint32(18).string(message.session_id);
    }
    for (const v of message.files) {
      WorkflowFile.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): JobOutput {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJobOutput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.job_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.session_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.files.push(WorkflowFile.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<JobOutput>): JobOutput {
    return JobOutput.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<JobOutput>): JobOutput {
    const message = createBaseJobOutput();
    message.job_id = object.job_id ?? "";
    message.session_id = object.session_id ?? "";
    message.files = object.files?.map((e) => WorkflowFile.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSessionHistory(): SessionHistory {
  return { outputs: [] };
}

export const SessionHistory = {
  encode(message: SessionHistory, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.outputs) {
      JobOutput.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SessionHistory {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSessionHistory();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.outputs.push(JobOutput.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SessionHistory>): SessionHistory {
    return SessionHistory.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SessionHistory>): SessionHistory {
    const message = createBaseSessionHistory();
    message.outputs = object.outputs?.map((e) => JobOutput.fromPartial(e)) || [];
    return message;
  },
};

function createBaseComfyMessage(): ComfyMessage {
  return {
    job_id: "",
    user_id: "",
    queue_status: undefined,
    execution_start: undefined,
    executing: undefined,
    progress: undefined,
    execution_error: undefined,
    execution_interrupted: undefined,
    execution_cached: undefined,
    output: undefined,
    custom_message: undefined,
  };
}

export const ComfyMessage = {
  encode(message: ComfyMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.job_id !== "") {
      writer.uint32(10).string(message.job_id);
    }
    if (message.user_id !== "") {
      writer.uint32(18).string(message.user_id);
    }
    if (message.queue_status !== undefined) {
      ComfyMessage_QueueStatus.encode(message.queue_status, writer.uint32(26).fork()).ldelim();
    }
    if (message.execution_start !== undefined) {
      ComfyMessage_ExecutionStart.encode(message.execution_start, writer.uint32(34).fork()).ldelim();
    }
    if (message.executing !== undefined) {
      ComfyMessage_Executing.encode(message.executing, writer.uint32(42).fork()).ldelim();
    }
    if (message.progress !== undefined) {
      ComfyMessage_Progress.encode(message.progress, writer.uint32(50).fork()).ldelim();
    }
    if (message.execution_error !== undefined) {
      ComfyMessage_ExecutionError.encode(message.execution_error, writer.uint32(58).fork()).ldelim();
    }
    if (message.execution_interrupted !== undefined) {
      ComfyMessage_ExecutionInterrupted.encode(message.execution_interrupted, writer.uint32(66).fork()).ldelim();
    }
    if (message.execution_cached !== undefined) {
      ComfyMessage_ExecutionCached.encode(message.execution_cached, writer.uint32(74).fork()).ldelim();
    }
    if (message.output !== undefined) {
      ComfyMessage_Output.encode(message.output, writer.uint32(82).fork()).ldelim();
    }
    if (message.custom_message !== undefined) {
      ComfyMessage_CustomMessage.encode(message.custom_message, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.job_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.user_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.queue_status = ComfyMessage_QueueStatus.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.execution_start = ComfyMessage_ExecutionStart.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.executing = ComfyMessage_Executing.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.progress = ComfyMessage_Progress.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.execution_error = ComfyMessage_ExecutionError.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.execution_interrupted = ComfyMessage_ExecutionInterrupted.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.execution_cached = ComfyMessage_ExecutionCached.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.output = ComfyMessage_Output.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.custom_message = ComfyMessage_CustomMessage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage>): ComfyMessage {
    return ComfyMessage.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage>): ComfyMessage {
    const message = createBaseComfyMessage();
    message.job_id = object.job_id ?? "";
    message.user_id = object.user_id ?? "";
    message.queue_status = (object.queue_status !== undefined && object.queue_status !== null)
      ? ComfyMessage_QueueStatus.fromPartial(object.queue_status)
      : undefined;
    message.execution_start = (object.execution_start !== undefined && object.execution_start !== null)
      ? ComfyMessage_ExecutionStart.fromPartial(object.execution_start)
      : undefined;
    message.executing = (object.executing !== undefined && object.executing !== null)
      ? ComfyMessage_Executing.fromPartial(object.executing)
      : undefined;
    message.progress = (object.progress !== undefined && object.progress !== null)
      ? ComfyMessage_Progress.fromPartial(object.progress)
      : undefined;
    message.execution_error = (object.execution_error !== undefined && object.execution_error !== null)
      ? ComfyMessage_ExecutionError.fromPartial(object.execution_error)
      : undefined;
    message.execution_interrupted =
      (object.execution_interrupted !== undefined && object.execution_interrupted !== null)
        ? ComfyMessage_ExecutionInterrupted.fromPartial(object.execution_interrupted)
        : undefined;
    message.execution_cached = (object.execution_cached !== undefined && object.execution_cached !== null)
      ? ComfyMessage_ExecutionCached.fromPartial(object.execution_cached)
      : undefined;
    message.output = (object.output !== undefined && object.output !== null)
      ? ComfyMessage_Output.fromPartial(object.output)
      : undefined;
    message.custom_message = (object.custom_message !== undefined && object.custom_message !== null)
      ? ComfyMessage_CustomMessage.fromPartial(object.custom_message)
      : undefined;
    return message;
  },
};

function createBaseComfyMessage_QueueStatus(): ComfyMessage_QueueStatus {
  return { sid: undefined, queue_remaining: 0 };
}

export const ComfyMessage_QueueStatus = {
  encode(message: ComfyMessage_QueueStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sid !== undefined) {
      writer.uint32(10).string(message.sid);
    }
    if (message.queue_remaining !== 0) {
      writer.uint32(16).uint32(message.queue_remaining);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_QueueStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_QueueStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.sid = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.queue_remaining = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_QueueStatus>): ComfyMessage_QueueStatus {
    return ComfyMessage_QueueStatus.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_QueueStatus>): ComfyMessage_QueueStatus {
    const message = createBaseComfyMessage_QueueStatus();
    message.sid = object.sid ?? undefined;
    message.queue_remaining = object.queue_remaining ?? 0;
    return message;
  },
};

function createBaseComfyMessage_ExecutionStart(): ComfyMessage_ExecutionStart {
  return {};
}

export const ComfyMessage_ExecutionStart = {
  encode(_: ComfyMessage_ExecutionStart, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_ExecutionStart {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_ExecutionStart();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_ExecutionStart>): ComfyMessage_ExecutionStart {
    return ComfyMessage_ExecutionStart.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<ComfyMessage_ExecutionStart>): ComfyMessage_ExecutionStart {
    const message = createBaseComfyMessage_ExecutionStart();
    return message;
  },
};

function createBaseComfyMessage_Executing(): ComfyMessage_Executing {
  return { node_id: "" };
}

export const ComfyMessage_Executing = {
  encode(message: ComfyMessage_Executing, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.node_id !== "") {
      writer.uint32(10).string(message.node_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_Executing {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_Executing();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.node_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_Executing>): ComfyMessage_Executing {
    return ComfyMessage_Executing.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_Executing>): ComfyMessage_Executing {
    const message = createBaseComfyMessage_Executing();
    message.node_id = object.node_id ?? "";
    return message;
  },
};

function createBaseComfyMessage_Progress(): ComfyMessage_Progress {
  return { max: 0, value: 0 };
}

export const ComfyMessage_Progress = {
  encode(message: ComfyMessage_Progress, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.max !== 0) {
      writer.uint32(8).uint32(message.max);
    }
    if (message.value !== 0) {
      writer.uint32(16).uint32(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_Progress {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_Progress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.max = reader.uint32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.value = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_Progress>): ComfyMessage_Progress {
    return ComfyMessage_Progress.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_Progress>): ComfyMessage_Progress {
    const message = createBaseComfyMessage_Progress();
    message.max = object.max ?? 0;
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseComfyMessage_ExecutionError(): ComfyMessage_ExecutionError {
  return {
    currentInputs: undefined,
    currentOutputs: undefined,
    execution_message: "",
    exception_type: "",
    executed: [],
    node_id: "",
    node_type: "",
    traceback: [],
  };
}

export const ComfyMessage_ExecutionError = {
  encode(message: ComfyMessage_ExecutionError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.currentInputs !== undefined) {
      Struct.encode(Struct.wrap(message.currentInputs), writer.uint32(10).fork()).ldelim();
    }
    if (message.currentOutputs !== undefined) {
      Struct.encode(Struct.wrap(message.currentOutputs), writer.uint32(18).fork()).ldelim();
    }
    if (message.execution_message !== "") {
      writer.uint32(26).string(message.execution_message);
    }
    if (message.exception_type !== "") {
      writer.uint32(34).string(message.exception_type);
    }
    for (const v of message.executed) {
      writer.uint32(42).string(v!);
    }
    if (message.node_id !== "") {
      writer.uint32(50).string(message.node_id);
    }
    if (message.node_type !== "") {
      writer.uint32(58).string(message.node_type);
    }
    for (const v of message.traceback) {
      writer.uint32(66).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_ExecutionError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_ExecutionError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.currentInputs = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.currentOutputs = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.execution_message = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.exception_type = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.executed.push(reader.string());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.node_id = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.node_type = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.traceback.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_ExecutionError>): ComfyMessage_ExecutionError {
    return ComfyMessage_ExecutionError.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_ExecutionError>): ComfyMessage_ExecutionError {
    const message = createBaseComfyMessage_ExecutionError();
    message.currentInputs = object.currentInputs ?? undefined;
    message.currentOutputs = object.currentOutputs ?? undefined;
    message.execution_message = object.execution_message ?? "";
    message.exception_type = object.exception_type ?? "";
    message.executed = object.executed?.map((e) => e) || [];
    message.node_id = object.node_id ?? "";
    message.node_type = object.node_type ?? "";
    message.traceback = object.traceback?.map((e) => e) || [];
    return message;
  },
};

function createBaseComfyMessage_ExecutionInterrupted(): ComfyMessage_ExecutionInterrupted {
  return { executed: [], node_id: "", node_type: "" };
}

export const ComfyMessage_ExecutionInterrupted = {
  encode(message: ComfyMessage_ExecutionInterrupted, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.executed) {
      writer.uint32(10).string(v!);
    }
    if (message.node_id !== "") {
      writer.uint32(18).string(message.node_id);
    }
    if (message.node_type !== "") {
      writer.uint32(26).string(message.node_type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_ExecutionInterrupted {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_ExecutionInterrupted();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.executed.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.node_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.node_type = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_ExecutionInterrupted>): ComfyMessage_ExecutionInterrupted {
    return ComfyMessage_ExecutionInterrupted.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_ExecutionInterrupted>): ComfyMessage_ExecutionInterrupted {
    const message = createBaseComfyMessage_ExecutionInterrupted();
    message.executed = object.executed?.map((e) => e) || [];
    message.node_id = object.node_id ?? "";
    message.node_type = object.node_type ?? "";
    return message;
  },
};

function createBaseComfyMessage_ExecutionCached(): ComfyMessage_ExecutionCached {
  return { node_ids: [] };
}

export const ComfyMessage_ExecutionCached = {
  encode(message: ComfyMessage_ExecutionCached, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.node_ids) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_ExecutionCached {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_ExecutionCached();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.node_ids.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_ExecutionCached>): ComfyMessage_ExecutionCached {
    return ComfyMessage_ExecutionCached.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_ExecutionCached>): ComfyMessage_ExecutionCached {
    const message = createBaseComfyMessage_ExecutionCached();
    message.node_ids = object.node_ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseComfyMessage_Output(): ComfyMessage_Output {
  return { node_id: "", files: [] };
}

export const ComfyMessage_Output = {
  encode(message: ComfyMessage_Output, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.node_id !== "") {
      writer.uint32(10).string(message.node_id);
    }
    for (const v of message.files) {
      WorkflowFile.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_Output {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_Output();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.node_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.files.push(WorkflowFile.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_Output>): ComfyMessage_Output {
    return ComfyMessage_Output.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_Output>): ComfyMessage_Output {
    const message = createBaseComfyMessage_Output();
    message.node_id = object.node_id ?? "";
    message.files = object.files?.map((e) => WorkflowFile.fromPartial(e)) || [];
    return message;
  },
};

function createBaseComfyMessage_CustomMessage(): ComfyMessage_CustomMessage {
  return { type: "", data: undefined };
}

export const ComfyMessage_CustomMessage = {
  encode(message: ComfyMessage_CustomMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.data !== undefined) {
      Struct.encode(Struct.wrap(message.data), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComfyMessage_CustomMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComfyMessage_CustomMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.data = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ComfyMessage_CustomMessage>): ComfyMessage_CustomMessage {
    return ComfyMessage_CustomMessage.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ComfyMessage_CustomMessage>): ComfyMessage_CustomMessage {
    const message = createBaseComfyMessage_CustomMessage();
    message.type = object.type ?? "";
    message.data = object.data ?? undefined;
    return message;
  },
};

function createBaseMessageFilter(): MessageFilter {
  return { outputs_only: false, include_temp_files: undefined, include_latent_previews: undefined };
}

export const MessageFilter = {
  encode(message: MessageFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.outputs_only === true) {
      writer.uint32(8).bool(message.outputs_only);
    }
    if (message.include_temp_files !== undefined) {
      writer.uint32(16).bool(message.include_temp_files);
    }
    if (message.include_latent_previews !== undefined) {
      writer.uint32(24).bool(message.include_latent_previews);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MessageFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMessageFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.outputs_only = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.include_temp_files = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.include_latent_previews = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<MessageFilter>): MessageFilter {
    return MessageFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MessageFilter>): MessageFilter {
    const message = createBaseMessageFilter();
    message.outputs_only = object.outputs_only ?? false;
    message.include_temp_files = object.include_temp_files ?? undefined;
    message.include_latent_previews = object.include_latent_previews ?? undefined;
    return message;
  },
};

function createBaseStreamSessionRequest(): StreamSessionRequest {
  return { session_id: "", filter: undefined };
}

export const StreamSessionRequest = {
  encode(message: StreamSessionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.session_id !== "") {
      writer.uint32(10).string(message.session_id);
    }
    if (message.filter !== undefined) {
      MessageFilter.encode(message.filter, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamSessionRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamSessionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.session_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.filter = MessageFilter.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<StreamSessionRequest>): StreamSessionRequest {
    return StreamSessionRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StreamSessionRequest>): StreamSessionRequest {
    const message = createBaseStreamSessionRequest();
    message.session_id = object.session_id ?? "";
    message.filter = (object.filter !== undefined && object.filter !== null)
      ? MessageFilter.fromPartial(object.filter)
      : undefined;
    return message;
  },
};

function createBaseStreamJobRequest(): StreamJobRequest {
  return { job_id: "", filter: undefined };
}

export const StreamJobRequest = {
  encode(message: StreamJobRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.job_id !== "") {
      writer.uint32(10).string(message.job_id);
    }
    if (message.filter !== undefined) {
      MessageFilter.encode(message.filter, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamJobRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamJobRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.job_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.filter = MessageFilter.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<StreamJobRequest>): StreamJobRequest {
    return StreamJobRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StreamJobRequest>): StreamJobRequest {
    const message = createBaseStreamJobRequest();
    message.job_id = object.job_id ?? "";
    message.filter = (object.filter !== undefined && object.filter !== null)
      ? MessageFilter.fromPartial(object.filter)
      : undefined;
    return message;
  },
};

function createBaseSessionId(): SessionId {
  return { session_id: "" };
}

export const SessionId = {
  encode(message: SessionId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.session_id !== "") {
      writer.uint32(10).string(message.session_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SessionId {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSessionId();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.session_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SessionId>): SessionId {
    return SessionId.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SessionId>): SessionId {
    const message = createBaseSessionId();
    message.session_id = object.session_id ?? "";
    return message;
  },
};

function createBaseJobId(): JobId {
  return { job_id: "" };
}

export const JobId = {
  encode(message: JobId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.job_id !== "") {
      writer.uint32(10).string(message.job_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): JobId {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJobId();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.job_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<JobId>): JobId {
    return JobId.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<JobId>): JobId {
    const message = createBaseJobId();
    message.job_id = object.job_id ?? "";
    return message;
  },
};

function createBaseNodeDefinition(): NodeDefinition {
  return { display_name: "", description: "", category: "", inputs: [], outputs: [], output_node: false };
}

export const NodeDefinition = {
  encode(message: NodeDefinition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.display_name !== "") {
      writer.uint32(10).string(message.display_name);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.category !== "") {
      writer.uint32(26).string(message.category);
    }
    for (const v of message.inputs) {
      NodeDefinition_InputDef.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.outputs) {
      NodeDefinition_OutputDef.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.output_node === true) {
      writer.uint32(48).bool(message.output_node);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDefinition {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDefinition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.display_name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.category = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.inputs.push(NodeDefinition_InputDef.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.outputs.push(NodeDefinition_OutputDef.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.output_node = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NodeDefinition>): NodeDefinition {
    return NodeDefinition.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NodeDefinition>): NodeDefinition {
    const message = createBaseNodeDefinition();
    message.display_name = object.display_name ?? "";
    message.description = object.description ?? "";
    message.category = object.category ?? "";
    message.inputs = object.inputs?.map((e) => NodeDefinition_InputDef.fromPartial(e)) || [];
    message.outputs = object.outputs?.map((e) => NodeDefinition_OutputDef.fromPartial(e)) || [];
    message.output_node = object.output_node ?? false;
    return message;
  },
};

function createBaseNodeDefinition_InputDef(): NodeDefinition_InputDef {
  return { label: "", edge_type: "", spec: undefined };
}

export const NodeDefinition_InputDef = {
  encode(message: NodeDefinition_InputDef, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.edge_type !== "") {
      writer.uint32(18).string(message.edge_type);
    }
    if (message.spec !== undefined) {
      Struct.encode(Struct.wrap(message.spec), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDefinition_InputDef {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDefinition_InputDef();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.label = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.edge_type = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.spec = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NodeDefinition_InputDef>): NodeDefinition_InputDef {
    return NodeDefinition_InputDef.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NodeDefinition_InputDef>): NodeDefinition_InputDef {
    const message = createBaseNodeDefinition_InputDef();
    message.label = object.label ?? "";
    message.edge_type = object.edge_type ?? "";
    message.spec = object.spec ?? undefined;
    return message;
  },
};

function createBaseNodeDefinition_OutputDef(): NodeDefinition_OutputDef {
  return { label: "", edge_type: "" };
}

export const NodeDefinition_OutputDef = {
  encode(message: NodeDefinition_OutputDef, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.label !== "") {
      writer.uint32(10).string(message.label);
    }
    if (message.edge_type !== "") {
      writer.uint32(18).string(message.edge_type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDefinition_OutputDef {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDefinition_OutputDef();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.label = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.edge_type = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NodeDefinition_OutputDef>): NodeDefinition_OutputDef {
    return NodeDefinition_OutputDef.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NodeDefinition_OutputDef>): NodeDefinition_OutputDef {
    const message = createBaseNodeDefinition_OutputDef();
    message.label = object.label ?? "";
    message.edge_type = object.edge_type ?? "";
    return message;
  },
};

function createBaseNodeDefs(): NodeDefs {
  return { defs: {} };
}

export const NodeDefs = {
  encode(message: NodeDefs, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.defs).forEach(([key, value]) => {
      NodeDefs_DefsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDefs {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDefs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = NodeDefs_DefsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.defs[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NodeDefs>): NodeDefs {
    return NodeDefs.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NodeDefs>): NodeDefs {
    const message = createBaseNodeDefs();
    message.defs = Object.entries(object.defs ?? {}).reduce<{ [key: string]: NodeDefinition }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = NodeDefinition.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseNodeDefs_DefsEntry(): NodeDefs_DefsEntry {
  return { key: "", value: undefined };
}

export const NodeDefs_DefsEntry = {
  encode(message: NodeDefs_DefsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      NodeDefinition.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDefs_DefsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDefs_DefsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = NodeDefinition.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NodeDefs_DefsEntry>): NodeDefs_DefsEntry {
    return NodeDefs_DefsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NodeDefs_DefsEntry>): NodeDefs_DefsEntry {
    const message = createBaseNodeDefs_DefsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? NodeDefinition.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseNodeDefRequest(): NodeDefRequest {
  return { extension_ids: [] };
}

export const NodeDefRequest = {
  encode(message: NodeDefRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.extension_ids) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDefRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeDefRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.extension_ids.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NodeDefRequest>): NodeDefRequest {
    return NodeDefRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NodeDefRequest>): NodeDefRequest {
    const message = createBaseNodeDefRequest();
    message.extension_ids = object.extension_ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseModels(): Models {
  return { info: [] };
}

export const Models = {
  encode(message: Models, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.info) {
      Models_ModelInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Models {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModels();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.info.push(Models_ModelInfo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Models>): Models {
    return Models.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Models>): Models {
    const message = createBaseModels();
    message.info = object.info?.map((e) => Models_ModelInfo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseModels_ModelInfo(): Models_ModelInfo {
  return { blake3_hash: "", display_name: "" };
}

export const Models_ModelInfo = {
  encode(message: Models_ModelInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.blake3_hash !== "") {
      writer.uint32(10).string(message.blake3_hash);
    }
    if (message.display_name !== "") {
      writer.uint32(18).string(message.display_name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Models_ModelInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModels_ModelInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.blake3_hash = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.display_name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Models_ModelInfo>): Models_ModelInfo {
    return Models_ModelInfo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Models_ModelInfo>): Models_ModelInfo {
    const message = createBaseModels_ModelInfo();
    message.blake3_hash = object.blake3_hash ?? "";
    message.display_name = object.display_name ?? "";
    return message;
  },
};

function createBaseModelCatalog(): ModelCatalog {
  return { models: {} };
}

export const ModelCatalog = {
  encode(message: ModelCatalog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.models).forEach(([key, value]) => {
      ModelCatalog_ModelsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ModelCatalog {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModelCatalog();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = ModelCatalog_ModelsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.models[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ModelCatalog>): ModelCatalog {
    return ModelCatalog.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ModelCatalog>): ModelCatalog {
    const message = createBaseModelCatalog();
    message.models = Object.entries(object.models ?? {}).reduce<{ [key: string]: Models }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Models.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseModelCatalog_ModelsEntry(): ModelCatalog_ModelsEntry {
  return { key: "", value: undefined };
}

export const ModelCatalog_ModelsEntry = {
  encode(message: ModelCatalog_ModelsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Models.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ModelCatalog_ModelsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModelCatalog_ModelsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = Models.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ModelCatalog_ModelsEntry>): ModelCatalog_ModelsEntry {
    return ModelCatalog_ModelsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ModelCatalog_ModelsEntry>): ModelCatalog_ModelsEntry {
    const message = createBaseModelCatalog_ModelsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? Models.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseModelCatalogRequest(): ModelCatalogRequest {
  return { architecture: [] };
}

export const ModelCatalogRequest = {
  encode(message: ModelCatalogRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.architecture) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ModelCatalogRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModelCatalogRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.architecture.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ModelCatalogRequest>): ModelCatalogRequest {
    return ModelCatalogRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ModelCatalogRequest>): ModelCatalogRequest {
    const message = createBaseModelCatalogRequest();
    message.architecture = object.architecture?.map((e) => e) || [];
    return message;
  },
};

export type ComfyDefinition = typeof ComfyDefinition;
export const ComfyDefinition = {
  name: "Comfy",
  fullName: "comfy_request.v1.Comfy",
  methods: {
    /** Queue a workflow and receive the job id */
    runWorkflow: {
      name: "RunWorkflow",
      requestType: ComfyRequest,
      requestStream: false,
      responseType: JobCreated,
      responseStream: false,
      options: {},
    },
    /** Queue a workflow and wait for the final outputs */
    runWorkflowSync: {
      name: "RunWorkflowSync",
      requestType: ComfyRequest,
      requestStream: false,
      responseType: JobOutput,
      responseStream: false,
      options: {},
    },
    /** Server-side stream of all jobs in a given session-id */
    streamSession: {
      name: "StreamSession",
      requestType: StreamSessionRequest,
      requestStream: false,
      responseType: ComfyMessage,
      responseStream: true,
      options: {},
    },
    /** Server-side stream of a specific job-id */
    streamJob: {
      name: "StreamJob",
      requestType: StreamJobRequest,
      requestStream: false,
      responseType: ComfyMessage,
      responseStream: true,
      options: {},
    },
    /**
     * Cancels a specific job (regardless if it's running or queued)
     * This is a combination of 'delete' and 'interrupt' from ComfyUI.
     */
    cancelJob: {
      name: "CancelJob",
      requestType: JobId,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    /**
     * Cancels all queued (pending) jobs in a given session-id
     * ComfyUI calls this 'clear'
     */
    purgeSessionQueue: {
      name: "PurgeSessionQueue",
      requestType: SessionId,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    /** Returns a list of outputs from a given session-id */
    getSessionHistory: {
      name: "GetSessionHistory",
      requestType: SessionId,
      requestStream: false,
      responseType: SessionHistory,
      responseStream: false,
      options: {},
    },
    /** Removes the JobOutputs from memory for a given session-id */
    clearSessionHistory: {
      name: "ClearSessionHistory",
      requestType: SessionId,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    /** Gets the definitions of all nodes supported by this server */
    getNodeDefinitions: {
      name: "GetNodeDefinitions",
      requestType: NodeDefRequest,
      requestStream: false,
      responseType: NodeDefs,
      responseStream: false,
      options: {},
    },
    /** Get models, grouped by architecture */
    getModelCatalog: {
      name: "GetModelCatalog",
      requestType: ModelCatalogRequest,
      requestStream: false,
      responseType: ModelCatalog,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface ComfyServiceImplementation<CallContextExt = {}> {
  /** Queue a workflow and receive the job id */
  runWorkflow(request: ComfyRequest, context: CallContext & CallContextExt): Promise<DeepPartial<JobCreated>>;
  /** Queue a workflow and wait for the final outputs */
  runWorkflowSync(request: ComfyRequest, context: CallContext & CallContextExt): Promise<DeepPartial<JobOutput>>;
  /** Server-side stream of all jobs in a given session-id */
  streamSession(
    request: StreamSessionRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<ComfyMessage>>;
  /** Server-side stream of a specific job-id */
  streamJob(
    request: StreamJobRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<ComfyMessage>>;
  /**
   * Cancels a specific job (regardless if it's running or queued)
   * This is a combination of 'delete' and 'interrupt' from ComfyUI.
   */
  cancelJob(request: JobId, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  /**
   * Cancels all queued (pending) jobs in a given session-id
   * ComfyUI calls this 'clear'
   */
  purgeSessionQueue(request: SessionId, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  /** Returns a list of outputs from a given session-id */
  getSessionHistory(request: SessionId, context: CallContext & CallContextExt): Promise<DeepPartial<SessionHistory>>;
  /** Removes the JobOutputs from memory for a given session-id */
  clearSessionHistory(request: SessionId, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  /** Gets the definitions of all nodes supported by this server */
  getNodeDefinitions(request: NodeDefRequest, context: CallContext & CallContextExt): Promise<DeepPartial<NodeDefs>>;
  /** Get models, grouped by architecture */
  getModelCatalog(
    request: ModelCatalogRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<ModelCatalog>>;
}

export interface ComfyClient<CallOptionsExt = {}> {
  /** Queue a workflow and receive the job id */
  runWorkflow(request: DeepPartial<ComfyRequest>, options?: CallOptions & CallOptionsExt): Promise<JobCreated>;
  /** Queue a workflow and wait for the final outputs */
  runWorkflowSync(request: DeepPartial<ComfyRequest>, options?: CallOptions & CallOptionsExt): Promise<JobOutput>;
  /** Server-side stream of all jobs in a given session-id */
  streamSession(
    request: DeepPartial<StreamSessionRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<ComfyMessage>;
  /** Server-side stream of a specific job-id */
  streamJob(
    request: DeepPartial<StreamJobRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<ComfyMessage>;
  /**
   * Cancels a specific job (regardless if it's running or queued)
   * This is a combination of 'delete' and 'interrupt' from ComfyUI.
   */
  cancelJob(request: DeepPartial<JobId>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  /**
   * Cancels all queued (pending) jobs in a given session-id
   * ComfyUI calls this 'clear'
   */
  purgeSessionQueue(request: DeepPartial<SessionId>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  /** Returns a list of outputs from a given session-id */
  getSessionHistory(request: DeepPartial<SessionId>, options?: CallOptions & CallOptionsExt): Promise<SessionHistory>;
  /** Removes the JobOutputs from memory for a given session-id */
  clearSessionHistory(request: DeepPartial<SessionId>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  /** Gets the definitions of all nodes supported by this server */
  getNodeDefinitions(request: DeepPartial<NodeDefRequest>, options?: CallOptions & CallOptionsExt): Promise<NodeDefs>;
  /** Get models, grouped by architecture */
  getModelCatalog(
    request: DeepPartial<ModelCatalogRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<ModelCatalog>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
