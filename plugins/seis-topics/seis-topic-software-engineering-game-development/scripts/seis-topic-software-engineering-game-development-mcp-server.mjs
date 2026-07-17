#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-game-development",
  "displayName": "Game Development",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Game Development",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-game-development"
});
