import { existsSync, readFileSync, writeFileSync } from "node:fs";

const targetsPath = "deploy/server-targets.json";
const manifestPath = "dist/server-upload-manifest.json";
const outputPath = "deploy/upload-plan.json";

if (!existsSync(targetsPath)) {
  throw new Error(`Missing ${targetsPath}`);
}
if (!existsSync(manifestPath)) {
  throw new Error(`Missing ${manifestPath}. Run npm run prepare:server first.`);
}

const targets = JSON.parse(readFileSync(targetsPath, "utf8"));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const activeCandidate = (targets.candidates || []).find(candidate => candidate.id === targets.activeTarget) || null;

const plan = {
  version: 1,
  status: activeCandidate ? "ready_for_targeted_upload" : "blocked_until_target_confirmed",
  activeTarget: targets.activeTarget,
  targetType: activeCandidate?.type || null,
  package: {
    path: manifest.packagePath,
    bytes: manifest.packageBytes,
    sha256: manifest.sha256
  },
  steps: buildSteps(activeCandidate),
  rollback: {
    strategy: "restore_previous_release_zip",
    latestPointer: "releases/latest.json",
    healthCheck: "/health.json"
  },
  generatedAt: new Date().toISOString()
};

writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
console.log(`Upload plan ready: ${outputPath}`);

function buildSteps(candidate) {
  if (!candidate) {
    return [
      "Confirm hosting provider, domain, and upload path.",
      "Run scripts/configure-server-target.mjs with the chosen target.",
      "Run npm run check:deploy-readiness again.",
      "Upload dist/seis-static.zip only after checksum verification."
    ];
  }

  const stepsByCandidate = {
    "hostinger-static": [
      "Upload dist/seis-static.zip to the confirmed document root.",
      "Extract the zip so index.html is at the web root.",
      "Verify /health.json returns ok=true.",
      "Verify /tr/ and /ar/ routes render.",
      "Keep releases/latest.json for rollback."
    ],
    "apache-shared-hosting": [
      "Upload dist/seis-static.zip to the confirmed document root.",
      "Extract the zip so index.html is at the web root.",
      "Verify /health.json returns ok=true.",
      "Verify /fr/ and /de/ routes render.",
      "Keep releases/latest.json for rollback."
    ],
    "generic-sftp": [
      "Upload dist/seis-static.zip and dist/server-upload-manifest.json to the confirmed remote path.",
      "Verify the remote checksum against dist/server-upload-manifest.json before switching traffic.",
      "Verify /health.json and /manifest.webmanifest on the public URL.",
      "Keep the previous release zip available for reupload rollback."
    ],
    "node-vps": [
      "Copy dist/seis-static.zip to the confirmed host and extract it into the approved path.",
      "Start or reload the Node static server from server/node/static-server.mjs.",
      "Verify /_server/health returns ok=true.",
      "Keep the previous release path or symlink ready for rollback."
    ],
    "cloudflare-worker-origin": [
      "Deploy or update server/edge/cloudflare-worker.js only after the static origin is confirmed.",
      "Point the worker to the approved origin and keep the previous route binding recorded.",
      "Verify /health.json through the public route and /_edge/health through the worker route.",
      "Keep the previous worker route or origin mapping ready for rollback."
    ],
    "docker-node-static": [
      "Build the Docker image from server/docker/Dockerfile.",
      "Run the container with the confirmed host and port.",
      "Verify /_server/health returns ok=true.",
      "Keep dist/server-upload-manifest.json next to the deployed artifact."
    ],
    "github-pages": [
      "Publish dist/seis-static to the confirmed Pages source branch or artifact flow.",
      "Verify /, /tr/, and /sitemap.xml on the public Pages URL.",
      "Record the publish commit or workflow run used for the release.",
      "Keep the previous publish commit ready for rollback."
    ],
    "azure-static-web-apps": [
      "Upload dist/seis-static to the confirmed Azure Static Web App using the stored deployment token.",
      "Verify /, /health.json, and /sitemap.xml on the assigned preview or production URL.",
      "Record the successful deployment id in deployment notes.",
      "Keep the previous Static Web Apps deployment ready for promotion rollback."
    ],
    "aws-amplify-static": [
      "Publish the static artifact to the confirmed Amplify app and branch.",
      "Verify /, /health.json, and /manifest.webmanifest on the assigned Amplify domain.",
      "Record the Amplify job id used for the release.",
      "Keep the previous successful Amplify job ready for redeploy rollback."
    ],
    "firebase-hosting": [
      "Deploy dist/seis-static to the confirmed Firebase project and hosting site or channel.",
      "Verify /, /health.json, and /sitemap.xml on the assigned hosting URL.",
      "Record the release channel or deploy id in deployment notes.",
      "Keep the previous Firebase hosting release ready for rollback."
    ]
  };

  return stepsByCandidate[candidate.id] || [
    "Upload dist/seis-static.zip to the confirmed target.",
    "Verify checksum against dist/server-upload-manifest.json.",
    "Verify /health.json.",
    "Record deployed release in the hosting dashboard or deployment notes."
  ];
}
