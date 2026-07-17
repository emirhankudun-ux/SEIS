#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-visual-design",
  "displayName": "Visual Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Visual Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-visual-design"
});
