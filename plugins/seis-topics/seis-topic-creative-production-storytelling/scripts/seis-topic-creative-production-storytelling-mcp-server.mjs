#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-storytelling",
  "displayName": "Storytelling",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Storytelling",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-storytelling"
});
