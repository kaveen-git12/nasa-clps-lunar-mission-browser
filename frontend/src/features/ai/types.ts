// frontend/src/features/ai/types.ts
export type MessageRole = "user" | "assistant";

export interface SourceItem {
  type: "mission" | "site" | "calculation";
  id?: string | null;
  tool?: string | null;
  args?: Record<string, unknown> | null;
  computed_at?: string | null;
  method_version?: string | null;
}

export type SceneAction =
  | "focus_site"
  | "set_time"
  | "set_view"
  | "toggle_layer"
  | "reset_camera";

export type SceneViewMode = "moon" | "earth_moon_sun" | "south_pole";
export type SceneLayerName = "markers" | "labels" | "orbits";

export interface SceneCommand {
  action: SceneAction;
  site_id?: string;
  time?: string;
  view?: SceneViewMode;
  layer?: SceneLayerName;
  visible?: boolean;
}

export interface ChatResult {
  answer: string;
  sources: SourceItem[];
  scene_commands: SceneCommand[];
  warnings: string[];
}

export interface UIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sources?: SourceItem[];
  scene_commands?: SceneCommand[];
  warnings?: string[];
  isStreaming?: boolean;
}

export interface ChatContext {
  selected_site_id?: string;
  selected_time_utc?: string;
}

export interface AIStatusEvent {
  state: "thinking" | "tool_running" | "writing";
  tool: string | null;
}

export interface AIHealthStatus {
  ai_enabled: boolean;
  ollama_reachable: boolean;
  model: string;
  model_present: boolean;
  prompt_version: string;
  hint?: string | null;
}

export interface ConversationThread {
  id: string;
  title: string;
  updatedAtLabel: string;
  messages: UIMessage[];
}
