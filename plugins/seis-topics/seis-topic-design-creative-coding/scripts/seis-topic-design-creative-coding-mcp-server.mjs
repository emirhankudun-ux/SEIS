#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-creative-coding",
  "displayName": "Creative Coding",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Creative Coding",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-creative-coding"
});
