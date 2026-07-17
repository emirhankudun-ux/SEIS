#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-animation",
  "displayName": "Animation",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Animation",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-animation"
});
