#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-mcp",
  "displayName": "MCP",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "MCP",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-mcp"
});
