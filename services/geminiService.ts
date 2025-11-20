
import { GoogleGenAI, Type } from "@google/genai";
import { ProtocolAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProtocolCode = async (code: string): Promise<ProtocolAnalysis> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are an expert Opentrons robot simulator. 
    Analyze the following Python protocol code for an OT-2 or Flex robot.
    
    **Goal:** Provide strictly accurate, deterministic counts of actions and detailed sequential logs.
    
    **CRITICAL RULE: Pipette Channels & Totals**
    1. **Identify Channels**: For each loaded instrument, determine if it is 1, 8, or 96 channels based on the name (e.g., 'p300_single' -> 1, 'p300_multi' -> 8, 'p1000_96' -> 96).
    2. **Calculate Volumes**: For 'aspirated_volume_ul' and 'dispensed_volume_ul', multiply the command volume by the number of channels. (e.g., Aspirating 10uL on a 96-channel pipette = 960uL total).
    3. **Calculate Tips**: For 'tip_pickups', multiply the number of pickup actions by the channels. (e.g., 1 pickup on 8-channel = 8 tips used).
    
    **1. Procedure (Layman's Terms):**
    - Generate a sequential list of strings explaining what the robot is doing in simple English.

    **2. Mechanical Breakdown:**
    - Count the NUMBER of movement commands for each axis/mount.
    - "Gantry X", "Gantry Y", "Pipette Left Z", "Pipette Right Z".
    - **INCLUDE "Gripper"** as an axis if used (pickups/moves).
    - For each axis, provide a 'actions' list containing specific descriptions of moves (e.g., "Move to (100, 200)").
    
    **3. Liquid & Pipettes:**
    - Breakdown by Pipette + Tip Type combination.
    - Count specifically: aspirate, dispense, mix, blowout.
    - **CRITICAL:** Provide a 'logs' array for each pipette containing EVERY action sequentially.
    
    **4. Auxiliary Motions:**
    - For actions like 'mix', 'blow_out', 'touch_tip', 'air_gap'.
    - Group them by action type/parameters.
    - Provide a 'logs' array detailing each instance.
    
    **5. Tip Usage:**
    - Count TOTAL individual tips used per tip rack type (multiply pickups by pipette channels).
    - Provide a 'logs' array detailing each pickup.
    
    **6. Custom Actions:**
    - Detect overrides (flow_rate, offsets, speed changes).
    - **Do not list duplicate custom actions** if they appear in a loop; just list the unique type of override once or note "Multiple times".

    **7. Modules:**
    - Count engagements, lid moves, temp changes, latch moves.
    - **CRITICAL:** Provide a 'logs' array for each module containing the sequential actions with specific details (e.g., "Set Temp to 4C", "Heater Shaker Open Latch", "Shake at 1000 RPM for 30s").
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      { text: prompt },
      { text: `PROTOCOL CODE:\n${code}` }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          procedure_steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          pipette_stats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pipette_name: { type: Type.STRING },
                mount: { type: Type.STRING },
                channels: { type: Type.NUMBER, description: "Number of channels (1, 8, or 96)" },
                tip_type: { type: Type.STRING },
                aspirated_volume_ul: { type: Type.NUMBER, description: "Total volume (command vol * channels)" },
                dispensed_volume_ul: { type: Type.NUMBER, description: "Total volume (command vol * channels)" },
                aspirate_count: { type: Type.NUMBER },
                dispense_count: { type: Type.NUMBER },
                mix_count: { type: Type.NUMBER },
                blowout_count: { type: Type.NUMBER },
                logs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      volume_ul: { type: Type.NUMBER },
                      location: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          total_aspirated_ul: { type: Type.NUMBER },
          total_dispensed_ul: { type: Type.NUMBER },
          total_tip_pickups: { type: Type.NUMBER },
          tip_usage_breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tip_rack: { type: Type.STRING },
                count: { type: Type.NUMBER, description: "Total individual tips used" },
                logs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      location: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          auxiliary_motions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                count: { type: Type.NUMBER },
                tip_status: { type: Type.STRING },
                tip_type: { type: Type.STRING },
                volume_ul: { type: Type.NUMBER },
                logs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      volume_ul: { type: Type.NUMBER },
                      location: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          summary: { type: Type.STRING },
          custom_actions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                line_number: { type: Type.NUMBER }
              }
            }
          },
          labware: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                model: { type: Type.STRING },
                slot: { type: Type.STRING }
              }
            }
          },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                model: { type: Type.STRING },
                slot: { type: Type.STRING }
              }
            }
          },
          module_stats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                module_name: { type: Type.STRING },
                slot: { type: Type.STRING },
                model: { type: Type.STRING },
                lid_open_count: { type: Type.NUMBER },
                lid_close_count: { type: Type.NUMBER },
                latch_open_count: { type: Type.NUMBER },
                latch_close_count: { type: Type.NUMBER },
                temp_change_count: { type: Type.NUMBER },
                engagements_count: { type: Type.NUMBER },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      count: { type: Type.NUMBER },
                      details: { type: Type.STRING }
                    }
                  }
                },
                logs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      details: { type: Type.STRING },
                      location: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          api_commands: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                command: { type: Type.STRING },
                count: { type: Type.NUMBER }
              }
            }
          },
          axes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                axis: { type: Type.STRING, description: "e.g. Gantry X, Pipette Left Z, Gripper" },
                movement_count: { type: Type.NUMBER },
                homing_count: { type: Type.NUMBER },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      details: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        required: [
          "procedure_steps", "pipette_stats", "total_aspirated_ul", "total_dispensed_ul",
          "total_tip_pickups", "tip_usage_breakdown",
          "auxiliary_motions",
          "axes", "summary", "labware", "modules", "module_stats", "api_commands", "custom_actions"
        ]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ProtocolAnalysis;
  }

  throw new Error("Failed to analyze protocol");
};