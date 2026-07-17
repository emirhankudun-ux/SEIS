#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-pantechnoepistemonoesis-technology-atlas",
  "displayName": "Technology Atlas",
  "category": "PANTECHNOEPISTEMONOESIS",
  "categoryId": "pantechnoepistemonoesis",
  "sourceText": "Technology Atlas",
  "sourcePath": "./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-technology-atlas"
});
