(function () {
  'use strict';

  var DOMAINS = [
    { id: 'domain_ai_and_machine_learning', label: 'AI & Machine Learning', color: 'violet' },
    { id: 'domain_physical_ai',             label: 'Physical AI',           color: 'cyan'   },
    { id: 'domain_accelerated_computing',   label: 'Accelerated Computing', color: 'amber'  },
    { id: 'domain_infrastructure',          label: 'Infrastructure',        color: 'green'  },
    { id: 'domain_developer_tools',         label: 'Developer Tools',       color: 'nvidia' }
  ];

  var AUDIENCES = [
    { id: 'audience_developer',           label: 'Developer'           },
    { id: 'audience_ai_engineer',         label: 'AI Engineer'         },
    { id: 'audience_ml_engineer',         label: 'ML Engineer'         },
    { id: 'audience_application_developer', label: 'App Developer'     },
    { id: 'audience_platform_engineer',   label: 'Platform Engineer'   },
    { id: 'audience_devops_engineer',     label: 'DevOps Engineer'     },
    { id: 'audience_data_scientist',      label: 'Data Scientist'      },
    { id: 'audience_hpc_developer',       label: 'HPC Developer'       },
    { id: 'audience_hands_on_builder',    label: 'Hands-On Builder'    },
    { id: 'audience_robotics_developer',  label: 'Robotics Developer'  },
    { id: 'audience_solutions_architect', label: 'Solutions Architect' },
    { id: 'audience_research_academic',   label: 'Researcher'          },
    { id: 'audience_data_engineer',       label: 'Data Engineer'       },
    { id: 'audience_simulation_engineer', label: 'Simulation Engineer' },
    { id: 'audience_it_operations',       label: 'IT Operations'       },
    { id: 'audience_production_operator', label: 'Production Operator' },
    { id: 'audience_quantum_researcher',  label: 'Quantum Researcher'  },
    { id: 'audience_security_engineer',   label: 'Security Engineer'   }
  ];

  var BASE_URL = 'https://build.nvidia.com/skills';

  var SKILLS = [
    {
      id: 'nvidia-nim',
      name: 'NVIDIA NIM',
      desc: 'Deploy AI models as production-ready microservices with optimized containers, standard APIs, and sub-second inference latency.',
      domains:   ['domain_ai_and_machine_learning'],
      audiences: ['audience_developer', 'audience_ai_engineer', 'audience_application_developer', 'audience_ml_engineer', 'audience_platform_engineer'],
      level: 'Beginner'
    },
    {
      id: 'nemo-framework',
      name: 'NVIDIA NeMo',
      desc: 'Build, train, and fine-tune large language models and generative AI with an end-to-end, scalable framework.',
      domains:   ['domain_ai_and_machine_learning'],
      audiences: ['audience_ai_engineer', 'audience_ml_engineer', 'audience_research_academic', 'audience_data_scientist'],
      level: 'Intermediate'
    },
    {
      id: 'triton-server',
      name: 'Triton Inference Server',
      desc: 'Serve multiple AI models simultaneously with high throughput and low latency using NVIDIA open-source inference software.',
      domains:   ['domain_ai_and_machine_learning', 'domain_infrastructure'],
      audiences: ['audience_ml_engineer', 'audience_platform_engineer', 'audience_devops_engineer', 'audience_solutions_architect'],
      level: 'Intermediate'
    },
    {
      id: 'tensorrt',
      name: 'TensorRT',
      desc: 'Optimize and deploy deep learning models with NVIDIA high-performance inference optimizer and runtime for maximum GPU utilization.',
      domains:   ['domain_ai_and_machine_learning', 'domain_accelerated_computing'],
      audiences: ['audience_ml_engineer', 'audience_ai_engineer', 'audience_developer', 'audience_hpc_developer'],
      level: 'Intermediate'
    },
    {
      id: 'rapids',
      name: 'NVIDIA RAPIDS',
      desc: 'Accelerate data science pipelines end-to-end on GPU — ETL, machine learning, and graph analytics with cuDF, cuML, and cuGraph.',
      domains:   ['domain_ai_and_machine_learning', 'domain_accelerated_computing'],
      audiences: ['audience_data_scientist', 'audience_data_engineer', 'audience_ml_engineer', 'audience_hpc_developer'],
      level: 'Beginner'
    },
    {
      id: 'dali',
      name: 'NVIDIA DALI',
      desc: 'Speed up deep learning training with a GPU-accelerated data loading and augmentation pipeline that removes the CPU bottleneck.',
      domains:   ['domain_ai_and_machine_learning', 'domain_accelerated_computing'],
      audiences: ['audience_ml_engineer', 'audience_ai_engineer', 'audience_research_academic'],
      level: 'Intermediate'
    },
    {
      id: 'merlin',
      name: 'NVIDIA Merlin',
      desc: 'Build and deploy high-performance recommender systems with GPU-accelerated preprocessing, training, and serving.',
      domains:   ['domain_ai_and_machine_learning'],
      audiences: ['audience_ml_engineer', 'audience_data_scientist', 'audience_application_developer'],
      level: 'Intermediate'
    },
    {
      id: 'morpheus',
      name: 'NVIDIA Morpheus',
      desc: 'Detect cybersecurity threats in real time at petabyte scale using AI pipelines powered by GPU acceleration.',
      domains:   ['domain_ai_and_machine_learning', 'domain_infrastructure'],
      audiences: ['audience_security_engineer', 'audience_devops_engineer', 'audience_platform_engineer', 'audience_it_operations'],
      level: 'Intermediate'
    },
    {
      id: 'rag-nim',
      name: 'RAG with NVIDIA NIM',
      desc: 'Build retrieval-augmented generation pipelines using NIM microservices — combine vector search with LLM inference for grounded AI apps.',
      domains:   ['domain_ai_and_machine_learning', 'domain_developer_tools'],
      audiences: ['audience_developer', 'audience_ai_engineer', 'audience_application_developer', 'audience_hands_on_builder'],
      level: 'Beginner'
    },
    {
      id: 'modulus',
      name: 'NVIDIA Modulus',
      desc: 'Develop physics-informed machine learning models for scientific computing — surrogate models, PINNs, and digital twins.',
      domains:   ['domain_ai_and_machine_learning', 'domain_physical_ai'],
      audiences: ['audience_research_academic', 'audience_simulation_engineer', 'audience_data_scientist', 'audience_ml_engineer'],
      level: 'Advanced'
    },
    {
      id: 'isaac-sim',
      name: 'NVIDIA Isaac Sim',
      desc: 'Build, simulate, and train AI-based robots in a photorealistic virtual environment before physical deployment.',
      domains:   ['domain_physical_ai'],
      audiences: ['audience_robotics_developer', 'audience_simulation_engineer', 'audience_research_academic', 'audience_ai_engineer'],
      level: 'Intermediate'
    },
    {
      id: 'isaac-ros',
      name: 'NVIDIA Isaac ROS',
      desc: 'Accelerate robot perception with GPU-optimized ROS 2 packages for cameras, LiDAR, and sensor fusion.',
      domains:   ['domain_physical_ai', 'domain_developer_tools'],
      audiences: ['audience_robotics_developer', 'audience_developer', 'audience_simulation_engineer'],
      level: 'Intermediate'
    },
    {
      id: 'jetson',
      name: 'NVIDIA Jetson',
      desc: 'Deploy AI at the edge with Jetson modules — high-performance GPU computing in a compact, power-efficient form factor.',
      domains:   ['domain_physical_ai', 'domain_developer_tools'],
      audiences: ['audience_robotics_developer', 'audience_developer', 'audience_hands_on_builder', 'audience_production_operator'],
      level: 'Beginner'
    },
    {
      id: 'omniverse',
      name: 'NVIDIA Omniverse',
      desc: 'Create physically accurate 3D simulation environments and digital twins for AI training data generation and visualization.',
      domains:   ['domain_physical_ai'],
      audiences: ['audience_simulation_engineer', 'audience_developer', 'audience_research_academic', 'audience_solutions_architect'],
      level: 'Intermediate'
    },
    {
      id: 'drive',
      name: 'NVIDIA DRIVE',
      desc: 'Develop, test, and validate autonomous vehicle software — perception, planning, and control on a unified open AV platform.',
      domains:   ['domain_physical_ai', 'domain_ai_and_machine_learning'],
      audiences: ['audience_robotics_developer', 'audience_ai_engineer', 'audience_simulation_engineer', 'audience_research_academic'],
      level: 'Advanced'
    },
    {
      id: 'deepstream',
      name: 'NVIDIA DeepStream',
      desc: 'Build real-time AI video analytics pipelines for smart cities, retail, and industrial vision at scale.',
      domains:   ['domain_physical_ai', 'domain_ai_and_machine_learning'],
      audiences: ['audience_developer', 'audience_ai_engineer', 'audience_application_developer', 'audience_production_operator'],
      level: 'Intermediate'
    },
    {
      id: 'cuda',
      name: 'CUDA Programming',
      desc: 'Master GPU parallel programming with CUDA C++ — thread hierarchy, memory management, and kernel optimization from first principles.',
      domains:   ['domain_accelerated_computing'],
      audiences: ['audience_developer', 'audience_hpc_developer', 'audience_research_academic', 'audience_ml_engineer', 'audience_hands_on_builder'],
      level: 'Beginner'
    },
    {
      id: 'cuda-math-libs',
      name: 'CUDA Math Libraries',
      desc: 'Accelerate linear algebra, FFT, and sparse matrix operations with cuBLAS, cuFFT, and cuSPARSE — drop-in GPU replacements for CPU libraries.',
      domains:   ['domain_accelerated_computing'],
      audiences: ['audience_hpc_developer', 'audience_developer', 'audience_research_academic', 'audience_ml_engineer'],
      level: 'Intermediate'
    },
    {
      id: 'thrust',
      name: 'NVIDIA Thrust',
      desc: 'Write parallel algorithms at a high level with Thrust, a C++ template library that targets both GPU and multi-core CPU.',
      domains:   ['domain_accelerated_computing', 'domain_developer_tools'],
      audiences: ['audience_developer', 'audience_hpc_developer', 'audience_research_academic'],
      level: 'Intermediate'
    },
    {
      id: 'nccl',
      name: 'NCCL Multi-GPU Communications',
      desc: 'Achieve optimal throughput for collective operations across multiple GPUs and nodes during distributed AI model training.',
      domains:   ['domain_accelerated_computing', 'domain_infrastructure'],
      audiences: ['audience_hpc_developer', 'audience_ml_engineer', 'audience_platform_engineer', 'audience_devops_engineer'],
      level: 'Advanced'
    },
    {
      id: 'openacc',
      name: 'OpenACC',
      desc: 'Accelerate Fortran and C/C++ scientific codes for GPU with directive-based programming — maximum speedup, minimal code changes.',
      domains:   ['domain_accelerated_computing'],
      audiences: ['audience_hpc_developer', 'audience_research_academic', 'audience_developer'],
      level: 'Beginner'
    },
    {
      id: 'infiniband',
      name: 'NVIDIA InfiniBand',
      desc: 'Build high-speed, low-latency AI cluster networking with InfiniBand — designed for GPU-to-GPU communication at hyperscale.',
      domains:   ['domain_infrastructure'],
      audiences: ['audience_platform_engineer', 'audience_devops_engineer', 'audience_hpc_developer', 'audience_it_operations', 'audience_solutions_architect'],
      level: 'Intermediate'
    },
    {
      id: 'bluefield-dpu',
      name: 'NVIDIA BlueField DPU',
      desc: 'Offload, accelerate, and isolate infrastructure tasks — networking, storage, and security — from the CPU using the BlueField DPU.',
      domains:   ['domain_infrastructure'],
      audiences: ['audience_platform_engineer', 'audience_devops_engineer', 'audience_it_operations', 'audience_production_operator'],
      level: 'Intermediate'
    },
    {
      id: 'ngc',
      name: 'NVIDIA NGC Catalog',
      desc: 'Access a curated hub of GPU-optimized containers, pretrained models, SDKs, and Helm charts ready for production.',
      domains:   ['domain_infrastructure', 'domain_developer_tools'],
      audiences: ['audience_developer', 'audience_ml_engineer', 'audience_devops_engineer', 'audience_platform_engineer', 'audience_hands_on_builder'],
      level: 'Beginner'
    },
    {
      id: 'nsight-systems',
      name: 'NVIDIA Nsight Systems',
      desc: 'Profile your full application stack — CPU, GPU, memory, and I/O — to find bottlenecks and optimize system-wide performance.',
      domains:   ['domain_developer_tools'],
      audiences: ['audience_developer', 'audience_hpc_developer', 'audience_ml_engineer', 'audience_devops_engineer'],
      level: 'Intermediate'
    },
    {
      id: 'nsight-compute',
      name: 'NVIDIA Nsight Compute',
      desc: 'Profile and tune individual CUDA kernels with guided roofline analysis, hardware counter metrics, and source correlation.',
      domains:   ['domain_developer_tools', 'domain_accelerated_computing'],
      audiences: ['audience_developer', 'audience_hpc_developer', 'audience_research_academic'],
      level: 'Advanced'
    },
    {
      id: 'ai-workbench',
      name: 'NVIDIA AI Workbench',
      desc: 'Set up and collaborate on AI projects in minutes with a unified, reproducible developer environment across laptop and cloud.',
      domains:   ['domain_developer_tools'],
      audiences: ['audience_developer', 'audience_ai_engineer', 'audience_ml_engineer', 'audience_data_scientist', 'audience_hands_on_builder'],
      level: 'Beginner'
    },
    {
      id: 'cuda-toolkit',
      name: 'NVIDIA CUDA Toolkit',
      desc: 'Get the complete development environment for GPU-accelerated applications — compilers, libraries, debuggers, and profilers in one install.',
      domains:   ['domain_developer_tools', 'domain_accelerated_computing'],
      audiences: ['audience_developer', 'audience_hpc_developer', 'audience_ml_engineer', 'audience_research_academic', 'audience_hands_on_builder'],
      level: 'Beginner'
    },
    {
      id: 'fleet-command',
      name: 'NVIDIA Fleet Command',
      desc: 'Deploy, monitor, and manage AI applications across distributed edge locations from a single cloud control plane.',
      domains:   ['domain_infrastructure', 'domain_developer_tools'],
      audiences: ['audience_devops_engineer', 'audience_it_operations', 'audience_platform_engineer', 'audience_production_operator', 'audience_solutions_architect'],
      level: 'Intermediate'
    }
  ];

  var domainMap = {};
  DOMAINS.forEach(function (d) { domainMap[d.id] = d; });

  var state = { domains: {}, audiences: {} };

  function parseURLFilters() {
    var params = new URLSearchParams(location.search);
    var raw = params.get('filters') || '';
    var validDomains = DOMAINS.map(function (d) { return d.id; });
    var validAudiences = AUDIENCES.map(function (a) { return a.id; });
    raw.split(',').forEach(function (token) {
      var parts = token.split(':');
      if (parts.length !== 2) return;
      var type = parts[0];
      var value = parts[1];
      if (type === 'domain' && validDomains.indexOf(value) !== -1) state.domains[value] = true;
      if (type === 'audience' && validAudiences.indexOf(value) !== -1) state.audiences[value] = true;
    });
  }

  function updateURL() {
    var tokens = [];
    Object.keys(state.domains).forEach(function (k) { tokens.push('domain:' + k); });
    Object.keys(state.audiences).forEach(function (k) { tokens.push('audience:' + k); });
    var params = new URLSearchParams(location.search);
    if (tokens.length > 0) {
      params.set('filters', tokens.join(','));
    } else {
      params.delete('filters');
    }
    var qs = params.toString();
    var newUrl = location.pathname + (qs ? '?' + qs : '');
    if (location.href !== location.origin + newUrl) {
      history.replaceState(null, '', newUrl);
    }
  }

  function hasFilters() {
    return Object.keys(state.domains).length > 0 || Object.keys(state.audiences).length > 0;
  }

  function matches(skill) {
    var domainKeys = Object.keys(state.domains);
    var audienceKeys = Object.keys(state.audiences);
    var domainOk = domainKeys.length === 0 || skill.domains.some(function (d) { return state.domains[d]; });
    var audienceOk = audienceKeys.length === 0 || skill.audiences.some(function (a) { return state.audiences[a]; });
    return domainOk && audienceOk;
  }

  function renderChips() {
    var df = document.getElementById('domain-filters');
    var af = document.getElementById('audience-filters');

    var dHtml = '';
    DOMAINS.forEach(function (d) {
      var pressed = state.domains[d.id] ? 'true' : 'false';
      dHtml += '<button type="button" class="ns-chip ns-chip--' + d.color + '" ' +
        'aria-pressed="' + pressed + '" ' +
        'data-ftype="domain" data-fval="' + d.id + '">' + d.label + '</button>';
    });
    df.innerHTML = dHtml;

    var aHtml = '';
    AUDIENCES.forEach(function (a) {
      var pressed = state.audiences[a.id] ? 'true' : 'false';
      aHtml += '<button type="button" class="ns-chip" ' +
        'aria-pressed="' + pressed + '" ' +
        'data-ftype="audience" data-fval="' + a.id + '">' + a.label + '</button>';
    });
    af.innerHTML = aHtml;
  }

  function renderCards() {
    var visible = SKILLS.filter(matches);
    var grid = document.getElementById('ns-grid');
    var empty = document.getElementById('ns-empty');
    var count = document.getElementById('ns-count');
    var clearBtn = document.getElementById('ns-clear');

    count.textContent = String(visible.length);
    clearBtn.hidden = !hasFilters();

    if (visible.length === 0) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    var html = '';
    visible.forEach(function (skill) {
      var primary = domainMap[skill.domains[0]] || DOMAINS[0];
      var extra = skill.domains.slice(1).map(function (did) {
        return domainMap[did] ? domainMap[did].label : '';
      }).filter(Boolean);

      html += '<article class="ns-card ns-card--' + primary.color + '">';
      html += '<div class="ns-card-top">';
      html += '<span class="ns-badge ns-badge--' + primary.color + '">' + primary.label + '</span>';
      html += '<span class="ns-level">' + skill.level + '</span>';
      html += '</div>';
      html += '<h3>' + skill.name + '</h3>';
      html += '<p class="ns-desc">' + skill.desc + '</p>';
      if (extra.length) {
        html += '<p class="ns-also">Also: ' + extra.join(', ') + '</p>';
      }
      html += '<div class="ns-card-foot">';
      html += '<a class="ns-link" href="' + BASE_URL + '" target="_blank" rel="noopener noreferrer">';
      html += 'View on NVIDIA Build <span aria-hidden="true">→</span></a>';
      html += '</div>';
      html += '</article>';
    });
    grid.innerHTML = html;
  }

  function render() {
    renderChips();
    renderCards();
    updateURL();
  }

  function toggleFilter(type, value) {
    var bag = type === 'domain' ? state.domains : state.audiences;
    if (bag[value]) {
      delete bag[value];
    } else {
      bag[value] = true;
    }
    render();
  }

  function clearAll() {
    state.domains = {};
    state.audiences = {};
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    parseURLFilters();
    render();

    document.getElementById('domain-filters').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-ftype]');
      if (chip) toggleFilter(chip.dataset.ftype, chip.dataset.fval);
    });

    document.getElementById('audience-filters').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-ftype]');
      if (chip) toggleFilter(chip.dataset.ftype, chip.dataset.fval);
    });

    document.getElementById('ns-clear').addEventListener('click', clearAll);
    document.getElementById('ns-clear-2').addEventListener('click', clearAll);
  });
}());
