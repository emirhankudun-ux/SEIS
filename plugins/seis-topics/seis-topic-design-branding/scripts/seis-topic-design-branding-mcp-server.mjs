#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-branding",
  "displayName": "Branding",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Branding",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-branding"
});
