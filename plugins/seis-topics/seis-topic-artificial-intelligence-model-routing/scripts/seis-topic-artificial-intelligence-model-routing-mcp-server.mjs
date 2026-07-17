#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-model-routing",
  "displayName": "Model Routing",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Model Routing",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-model-routing"
});
