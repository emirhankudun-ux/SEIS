#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-graphics-game-engine",
  "displayName": "Game Engine",
  "category": "Graphics",
  "categoryId": "graphics",
  "sourceText": "Game Engine",
  "sourcePath": "./plugins/seis-topics/seis-topic-graphics-game-engine"
});
