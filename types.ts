
export interface AxisStats {
  axis: string;
  movement_count: number;
  homing_count: number;
  actions: DetailedAction[];
}

export interface LabwareItem {
  name: string;
  model: string;
  slot: string;
}

export interface CommandStat {
  command: string;
  count: number;
}

export interface DetailedAction {
  description: string;
  volume_ul?: number;
  location?: string;
  details?: string;
}

export interface AuxMotionStat {
  action: string; // mix, blow_out, touch_tip, air_gap
  count: number;
  tip_status: string; // "With Tip" or "No Tip"
  tip_type: string; // e.g. "300ul"
  volume_ul: number; // volume involved in action
  logs: DetailedAction[];
}

export interface PipetteLiquidStat {
  pipette_name: string;
  mount: string;
  channels: number; // 1, 8, or 96
  tip_type: string;
  aspirated_volume_ul: number;
  dispensed_volume_ul: number;
  aspirate_count: number;
  dispense_count: number;
  mix_count: number;
  blowout_count: number;
  logs: DetailedAction[]; // Chronological list of actions for this pipette
}

export interface CustomAction {
  description: string;
  line_number?: number;
}

export interface ModuleStatAction {
  type: string; // e.g. "Lid Open", "Temp Change", "Latch Movement"
  count: number;
  details: string; // e.g. "Heated to 95C"
}

export interface ModuleStats {
  module_name: string;
  slot: string;
  model: string;
  lid_open_count: number;
  lid_close_count: number;
  latch_open_count: number;
  latch_close_count: number;
  temp_change_count: number;
  engagements_count: number; // For magdeck or gripper
  actions: ModuleStatAction[];
  logs: DetailedAction[]; // Chronological list of actions for this module
}

export interface TipUsageStat {
  tip_rack: string;
  count: number;
  logs: DetailedAction[];
}

export interface ProtocolAnalysis {
  procedure_steps: string[]; // Layman terms list
  pipette_stats: PipetteLiquidStat[];
  total_aspirated_ul: number;
  total_dispensed_ul: number;
  
  total_tip_pickups: number;
  tip_usage_breakdown: TipUsageStat[];
  
  auxiliary_motions: AuxMotionStat[];

  axes: AxisStats[];
  summary: string;
  labware: LabwareItem[];
  modules: LabwareItem[]; 
  module_stats: ModuleStats[]; 
  api_commands: CommandStat[];
  custom_actions: CustomAction[];
}

export enum AppView {
  EDITOR = 'EDITOR',
  ANALYSIS = 'ANALYSIS'
}