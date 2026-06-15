// SEIS Release Policy — Neo4j Cypher

CREATE (:MotionMode {name: "cinematic", durationMs: 600, reducedMotionSafe: false})
CREATE (:MotionMode {name: "balanced",  durationMs: 300, reducedMotionSafe: true})
CREATE (:MotionMode {name: "reduced",   durationMs: 0,   reducedMotionSafe: true})

CREATE (:ReleaseGate {
  id: "seis-gate-v1",
  requiresQualityPass: true,
  requiresMotionDoc: true,
  requiresServerTarget: true,
  requiresA11yPass: true
})

MATCH (g:ReleaseGate {id: "seis-gate-v1"})
MATCH (m:MotionMode {name: "reduced"})
MERGE (g)-[:REQUIRES_MODE]->(m)

MATCH (g:ReleaseGate)-[:REQUIRES_MODE]->(m:MotionMode)
RETURN g.id AS gate, m.name AS requiredMode, m.reducedMotionSafe AS safe
