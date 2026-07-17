#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-visual-identity",
  "displayName": "Visual Identity",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Visual Identity",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-visual-identity"
});
