#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-robotics",
  "displayName": "Robotics",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Robotics",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-robotics"
});
