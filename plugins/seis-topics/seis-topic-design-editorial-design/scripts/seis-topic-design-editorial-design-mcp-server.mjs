#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-editorial-design",
  "displayName": "Editorial Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Editorial Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-editorial-design"
});
