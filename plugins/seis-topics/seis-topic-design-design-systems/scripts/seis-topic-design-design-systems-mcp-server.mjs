#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-design-systems",
  "displayName": "Design Systems",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Design Systems",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-design-systems"
});
