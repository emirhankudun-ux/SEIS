#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-networking",
  "displayName": "Networking",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Networking",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-networking"
});
