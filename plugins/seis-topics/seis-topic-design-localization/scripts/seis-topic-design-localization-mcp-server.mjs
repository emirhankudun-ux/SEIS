#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-localization",
  "displayName": "Localization",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Localization",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-localization"
});
