#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-pantechnoepistemonoesis-scientific-computing",
  "displayName": "Scientific Computing",
  "category": "PANTECHNOEPISTEMONOESIS",
  "categoryId": "pantechnoepistemonoesis",
  "sourceText": "Scientific Computing",
  "sourcePath": "./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-scientific-computing"
});
