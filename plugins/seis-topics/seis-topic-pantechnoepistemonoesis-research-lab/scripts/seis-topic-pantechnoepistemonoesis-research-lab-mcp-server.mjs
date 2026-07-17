#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-pantechnoepistemonoesis-research-lab",
  "displayName": "Research Lab",
  "category": "PANTECHNOEPISTEMONOESIS",
  "categoryId": "pantechnoepistemonoesis",
  "sourceText": "Research Lab",
  "sourcePath": "./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-research-lab"
});
