#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-provider-routing",
  "displayName": "Provider Routing",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Provider Routing",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-provider-routing"
});
