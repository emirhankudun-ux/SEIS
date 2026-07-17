#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-project-management-goal-tracking",
  "displayName": "Goal Tracking",
  "category": "Project Management",
  "categoryId": "project-management",
  "sourceText": "Goal Tracking",
  "sourcePath": "./plugins/seis-topics/seis-topic-project-management-goal-tracking"
});
