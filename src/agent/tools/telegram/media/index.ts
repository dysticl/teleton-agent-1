import { telegramSendPhotoTool, telegramSendPhotoExecutor } from "./send-photo.js";
import { telegramDownloadMediaTool, telegramDownloadMediaExecutor } from "./download-media.js";
import { visionAnalyzeTool, visionAnalyzeExecutor } from "./vision-analyze.js";
import type { ToolEntry } from "../../types.js";

export { telegramSendPhotoTool, telegramSendPhotoExecutor };
export { telegramDownloadMediaTool, telegramDownloadMediaExecutor };
export { visionAnalyzeTool, visionAnalyzeExecutor };

// Disabled (not needed): send_voice, send_sticker, send_gif

export const tools: ToolEntry[] = [
  { tool: telegramSendPhotoTool, executor: telegramSendPhotoExecutor },
  { tool: telegramDownloadMediaTool, executor: telegramDownloadMediaExecutor },
  { tool: visionAnalyzeTool, executor: visionAnalyzeExecutor },
];
