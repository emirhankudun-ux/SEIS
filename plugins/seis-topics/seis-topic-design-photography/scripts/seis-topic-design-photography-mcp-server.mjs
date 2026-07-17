#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-photography",
  "displayName": "Photography",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Photography",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-photography"
});
