window.SEIS_FIVE_YEAR_PLAN_VIEW={
  id:"sub-agent-5-year-plan",
  source:"content/development/seis-sub-agent-5-year-plan.json",
  status:"documented",
  mode:"deterministic local presentation",
  truthBoundary:"This console presents the documented five-year plan and local review boundary. It does not prove five years have elapsed, autonomous execution, deployment, model training, or release readiness.",
  guardrails:["single writer","human approval for privileged actions","no secrets in browser","dry-run and review-first defaults"],
  validation:["npm run check:seis-sub-agent-5-year-plan","npm run check:seis-sub-agent-five-year-demo-run","npm run check:seis-linux-five-year-roadmap"],
  years:[
    {year:1,theme:"Foundation, evidence, and safe agent lanes",quarters:[
      {id:"Y1-Q1",label:"Sub-agent operating contracts",status:"documented"},
      {id:"Y1-Q2",label:"Role schema and permission matrix",status:"documented"},
      {id:"Y1-Q3",label:"Command Center evidence view",status:"documented"},
      {id:"Y1-Q4",label:"Provider-neutral local agent lane",status:"documented"}
    ]},
    {year:2,theme:"Product runtime and controlled automation",quarters:[
      {id:"Y2-Q1",label:"Desktop, Code, and VFS hardening",status:"documented"},
      {id:"Y2-Q2",label:"Scheduler dry-run and cancellation",status:"documented"},
      {id:"Y2-Q3",label:"Read-only repository intelligence",status:"documented"},
      {id:"Y2-Q4",label:"MCP and plugin trust levels",status:"documented"}
    ]},
    {year:3,theme:"Integrated Command Center and AI Core alpha",quarters:[
      {id:"Y3-Q1",label:"Command Center Alpha evidence",status:"documented"},
      {id:"Y3-Q2",label:"Backend-only model routing",status:"documented"},
      {id:"Y3-Q3",label:"Write-gated local workflows",status:"documented"},
      {id:"Y3-Q4",label:"Release-candidate quality gates",status:"documented"}
    ]},
    {year:4,theme:"Scale, reliability, and controlled federation",quarters:[
      {id:"Y4-Q1",label:"Multi-repository federation policy",status:"documented"},
      {id:"Y4-Q2",label:"Observability and budget controls",status:"documented"},
      {id:"Y4-Q3",label:"Offline and local-first privacy modes",status:"documented"},
      {id:"Y4-Q4",label:"Public readiness and supply-chain plan",status:"documented"}
    ]},
    {year:5,theme:"Sustainable autonomous assistance and research readiness",quarters:[
      {id:"Y5-Q1",label:"Bounded delegation and recovery",status:"documented"},
      {id:"Y5-Q2",label:"SEIS Universe research governance",status:"documented"},
      {id:"Y5-Q3",label:"Long-term maintenance cadence",status:"documented"},
      {id:"Y5-Q4",label:"Evidence-backed next-phase gates",status:"documented"}
    ]}
  ]
};
