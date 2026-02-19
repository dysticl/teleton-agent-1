import { tools as messagingTools } from "./messaging/index.js";
import { tools as mediaTools } from "./media/index.js";
import { tools as chatsTools } from "./chats/index.js";
import { tools as groupsTools } from "./groups/index.js";
import { tools as giftsTools } from "./gifts/index.js";
import { tools as contactsTools } from "./contacts/index.js";
import { tools as memoryTools } from "./memory/index.js";
import { tools as tasksTools } from "./tasks/index.js";
import type { ToolEntry } from "../types.js";

// Messaging
export * from "./messaging/index.js";

// Media
export * from "./media/index.js";

// Chats
export * from "./chats/index.js";

// Groups & Members
export * from "./groups/index.js";

// Gifts & Collectibles
export * from "./gifts/index.js";

// Contacts
export * from "./contacts/index.js";

// Memory (agent self-memory management)
export * from "./memory/index.js";

// Tasks (scheduled task management)
export * from "./tasks/index.js";

// Disabled categories (not needed for gift-focused agent):
// - Stickers & GIFs (4 tools)
// - Interactive: polls, quizzes, keyboards, reactions, dice (5 tools)
// - Folders (3 tools)
// - Profile (3 tools)
// - Stars & Payments (2 tools)
// - Stories (1 tool)

export const tools: ToolEntry[] = [
  ...messagingTools,
  ...mediaTools,
  ...chatsTools,
  ...groupsTools,
  ...giftsTools,
  ...contactsTools,
  ...memoryTools,
  ...tasksTools,
];
