#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-seis-seis-goal-tracking",
  "displayName": "SEIS Goal Tracking",
  "category": "SEIS",
  "categoryId": "seis",
  "sourceText": "SEIS Goal Tracking",
  "sourcePath": "./plugins/seis-topics/seis-topic-seis-seis-goal-tracking"
});
