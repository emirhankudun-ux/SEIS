#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-design-tokens",
  "displayName": "Design Tokens",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Design Tokens",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-design-tokens"
});
