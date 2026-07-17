#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-visual-effects",
  "displayName": "Visual Effects",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Visual Effects",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-visual-effects"
});
