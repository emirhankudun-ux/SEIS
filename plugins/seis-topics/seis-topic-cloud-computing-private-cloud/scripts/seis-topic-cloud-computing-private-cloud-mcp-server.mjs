#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-private-cloud",
  "displayName": "Private Cloud",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Private Cloud",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-private-cloud"
});
