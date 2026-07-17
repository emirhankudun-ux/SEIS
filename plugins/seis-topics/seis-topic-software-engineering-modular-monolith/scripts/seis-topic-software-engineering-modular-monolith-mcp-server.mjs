#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-modular-monolith",
  "displayName": "Modular Monolith",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Modular Monolith",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-modular-monolith"
});
