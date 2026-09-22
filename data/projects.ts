export type ProjectTakeaway = {
  label: string;
  value: string;
  detail: string;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  focus: string[];
  problemSummary: string;
  buildSummary: string;
  takeaway: ProjectTakeaway;
  overview: string;
  problem: string;
  approach: string;
  implementation: string[];
  results: string;
  status: string;
  technologies: string[];
  technologyLabel?: string;
  accent: 'project-sky' | 'project-lime';
  github?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    slug: 'flight-delay-prediction',
    number: '01',
    title: 'Flight Delay Prediction',
    shortDescription:
      'A machine-learning project for predicting U.S. flight delay and cancellation risk using historical flight and weather data.',
    focus: ['Machine learning', 'Aviation data'],
    problemSummary:
      'Airlines and passengers need earlier signals for flights at greater risk of disruption.',
    buildSummary:
      'A Python and SQLite pipeline combining BTS flight records with airport-level Open-Meteo weather observations for predictive modeling.',
    takeaway: {
      label: 'Model takeaway',
      value: 'Weather became the key second-iteration input',
      detail:
        'The flight-only baseline and prior research identified weather as an important missing predictor.',
    },
    overview:
      'Flight Delay Prediction combines historical U.S. flight-performance data with airport-level weather observations to study whether pre-departure information can identify flights at greater risk of delay or cancellation.',
    problem:
      'Flight disruptions create operational costs for airlines and uncertainty for passengers. The goal is not simply to describe past delays, but to determine whether information available before departure can identify higher-risk flights early enough to support planning.',
    approach:
      'The first iteration engineered flight features such as scheduled departure time and airline and evaluated supervised-learning models using precision, recall, F1-score, and RMSE. The current iteration expands the feature set by joining BTS flight records with hourly airport weather observations before retraining and evaluating the models.',
    implementation: [
      'Collect and normalize historical BTS flight-performance records.',
      'Ingest hourly airport weather observations from Open-Meteo.',
      'Persist repeatable datasets in SQLite for joining and feature engineering.',
      'Train and compare disruption models using metrics appropriate for imbalanced outcomes.',
    ],
    results:
      'Earlier tree-based models improved recall while reducing precision. That tradeoff, together with prior research, identified weather as an important missing signal and motivated the second modeling iteration.',
    status:
      'Flight and weather collection are in progress; the joined dataset and weather-aware model are the next milestones.',
    technologies: [
      'Python',
      'pandas',
      'scikit-learn',
      'SQLite',
      'SQL',
      'Open-Meteo API',
      'BTS Data',
      'GitHub Actions',
    ],
    accent: 'project-sky',
    github: 'https://github.com/ecillie/flight-delay-prediction',
  },
  {
    slug: 'airline-route-exit-analysis',
    number: '02',
    title: 'Airline Route Exit Analysis',
    shortDescription:
      'Economics research examining how low-cost carrier route exits affect airfares and competition in U.S. domestic aviation markets.',
    focus: ['Economics research', 'Aviation markets'],
    problemSummary:
      'Most airline-market research studies low-cost carrier entry; this project asks what happens when that competitive pressure disappears.',
    buildSummary:
      'A matched event-study pipeline combining T-100, DB1B, and On-Time Performance data into treatment and control market windows.',
    takeaway: {
      label: 'Original thesis finding',
      value: '7.15% associated fare increase',
      detail:
        'Average fares rose relative to matched Syracuse control routes after Frontier exited Albany.',
    },
    overview:
      'Airline Route Exit Analysis expands an undergraduate economics thesis on Frontier Airlines’ exit from Albany into a broader empirical study of low-cost carrier withdrawals across U.S. domestic routes.',
    problem:
      'Low-cost carriers can place significant downward pressure on airline fares, but much of the existing literature focuses on market entry. Studying exits provides a way to examine what happens to prices and competitive conditions when that pressure is removed.',
    approach:
      'The pipeline combines BTS T-100, DB1B, and On-Time Performance data, identifies eligible carrier-route exits, matches treatment markets with comparable controls, and constructs nine-quarter event windows containing four pre-event quarters, the exit quarter, and four post-event quarters. Difference-in-differences, event-study, parallel-trends, and robustness workflows support the analysis.',
    implementation: [
      'Build route-quarter panels from multiple large BTS datasets.',
      'Detect eligible carrier-route exits and construct matched control markets.',
      'Preserve marketing-versus-operating-carrier attribution through explicit crosswalks.',
      'Run difference-in-differences, event-study, spillover, and robustness analyses.',
    ],
    results:
      'The original Albany case study found that Frontier’s exit was associated with a 7.15% increase in average fares relative to matched Syracuse routes. The expanded analysis is testing whether similar effects appear across a broader set of low-cost carrier exits.',
    status:
      'The expanded research dataset and matched event-study workflow are under active development and validation.',
    technologies: [
      'Python',
      'pandas',
      'NumPy',
      'statsmodels',
      'SQL',
      'BTS T-100',
      'DB1B',
      'On-Time Performance Data',
      'Matplotlib',
    ],
    accent: 'project-lime',
    github: 'https://github.com/ecillie/airline-route-exit-analysis',
  },
  {
    slug: 'fbo-operations-platform',
    number: '03',
    title: 'FBO Operations Platform',
    shortDescription:
      'A full-stack airport operations platform for coordinating aircraft visits, services, fuel, staff, and daily FBO activity.',
    focus: ['Full-stack architecture', 'Airport operations'],
    problemSummary:
      'Ramp teams coordinate aircraft, fuel, parking, services, and staff across fast-moving and often fragmented workflows.',
    buildSummary:
      'A full-stack MVP architecture, relational data model, and workflow design for a centralized FBO operating system.',
    takeaway: {
      label: 'Current deliverable',
      value: 'End-to-end MVP architecture',
      detail:
        'Database, API, security, deployment, testing, reliability, and recovery decisions are documented before application implementation.',
    },
    overview:
      'FBO Operations Platform is a full-stack system designed for Fixed Base Operators to coordinate aircraft visits, parking, service requests, fuel operations, and workforce assignments from a centralized operating view.',
    problem:
      'FBO staff must coordinate aircraft movement, ramp space, fueling, services, equipment, customers, and personnel in real time. Disconnected systems and manual handoffs make activity harder to track, assign, audit, and recover when operational plans change.',
    approach:
      'The architecture uses a React and TypeScript frontend, a modular Java Spring Boot backend, and PostgreSQL for operational data. The design emphasizes bounded capabilities, transactional consistency, auditability, retained history, secure role-based workflows, and a staged path from local development to production deployment.',
    implementation: [
      'Map MVP actors, airport workflows, quality attributes, and operational data flows.',
      'Design the PostgreSQL relational model and schema baseline.',
      'Define frontend, backend, API, security, deployment, and observability boundaries.',
      'Translate architecture decisions into a testable solo-developer implementation plan.',
    ],
    results:
      'The project currently contains the architecture and database foundation for aircraft visits, parking, services, fuel inventory, workforce scheduling, and dispatch, establishing a clear implementation path for the full application.',
    status:
      'Architecture and the database baseline are complete; application and infrastructure implementation are the next phase.',
    technologies: [
      'Java',
      'Spring Boot',
      'Spring Modulith',
      'React',
      'TypeScript',
      'PostgreSQL',
      'Spring Data JPA',
      'Flyway',
      'Vite',
      'Material UI',
      'Docker',
      'GitHub Actions',
    ],
    technologyLabel: 'Planned stack',
    accent: 'project-sky',
    github: 'https://github.com/ecillie/fbo-operations-platform',
  },
  {
    slug: 'nhl-contract-valuation',
    number: '04',
    title: 'NHL Contract Valuation',
    shortDescription:
      'A full-stack hockey analytics application comparing NHL contracts with machine-learning estimates of player value.',
    focus: ['Full-stack ML', 'Hockey analytics'],
    problemSummary:
      'Goals and assists alone do not explain contract value across positions, seasons, and salary-cap environments.',
    buildSummary:
      'A React and FastAPI application with PostgreSQL data pipelines and position-specific contract valuation models.',
    takeaway: {
      label: 'Core capability',
      value: 'Position-specific contract estimates',
      detail:
        'The application compares actual and model-estimated cap hits season by season.',
    },
    overview:
      'NHL Contract Valuation is a full-stack analytics platform combining player performance, advanced statistics, contract history, salary-cap context, and machine learning to estimate expected NHL cap hits.',
    problem:
      'NHL contract value depends on position, performance, contract timing, advanced metrics, and the league salary-cap environment. Meaningful valuation requires consistent historical data and models that account for the substantially different statistical profiles of forwards, defensemen, and goalies.',
    approach:
      'Automated data pipelines load player, contract, salary, and performance data into PostgreSQL. Position-specific scikit-learn pipelines generate model artifacts, FastAPI exposes analysis and prediction endpoints, and the React interface allows users to explore players and compare actual versus expected cap hit by season.',
    implementation: [
      'Ingest public NHL performance, advanced-statistics, contract, and salary data.',
      'Model player, contract, season, and position data in PostgreSQL with SQLAlchemy.',
      'Train and serve separate forward, defenseman, and goalie valuation models.',
      'Connect prediction APIs to a searchable React interface and containerized application stack.',
    ],
    results:
      'The application produces position-specific cap-hit estimates and exposes season-by-season actual-versus-expected contract comparisons through both its API and user interface.',
    status:
      'Core data collection, database infrastructure, model training, prediction APIs, automated tests, Docker setup, and the player interface are implemented; model refinement continues.',
    technologies: [
      'Python',
      'FastAPI',
      'scikit-learn',
      'pandas',
      'PostgreSQL',
      'SQLAlchemy',
      'React',
      'Vite',
      'Docker',
      'NHL API',
    ],
    accent: 'project-lime',
    github: 'https://github.com/ecillie/hockey-analytics',
  },
];

export type OtherProject = {
  title: string;
  description: string;
  status: string;
  technologies: string[];
  link?: string;
};

export const otherProjects: OtherProject[] = [
  {
    title: 'Flight Deal Tracker',
    description:
      'A configurable Python flight-deal tracker that searches flexible routes, ranks flight options, tracks fare history, and distributes automated email reports.',
    status: 'Active project',
    technologies: ['Python', 'SerpApi', 'GitHub Actions'],
    link: 'https://github.com/ecillie/flight-deal-tracker',
  },
  {
    title: 'Crowd Group Detection Capstone',
    description:
      'Computer science capstone using YOLO and DeepSORT to detect, track, and classify groups of people in video based on spatial proximity and movement patterns.',
    status: 'Completed June 2026',
    technologies: ['Python', 'YOLO', 'DeepSORT', 'Computer Vision'],
    link: 'https://github.com/ecillie/crowd-group-detection-capstone',
  },
  {
    title: 'Robot Jump Rope',
    description:
      'Programmed a TurtleBot with ROS 2 to play jump rope using a laser, dynamically adjusting its speed to challenge a human participant.',
    status: 'Completed June 2026',
    technologies: ['ROS 2', 'TurtleBot'],
  },
  {
    title: 'NHL Contract-Year Performance',
    description:
      'Led a three-person econometric study testing whether NHL players outperform their career baselines during contract years, consolidating more than 70 datasets for the analysis.',
    status: 'Completed June 2025',
    technologies: ['Python', 'pandas', 'Econometrics'],
  },
  {
    title: 'U.S. Airline Industry Analysis',
    description:
      'Analyzed national, airport, and route-level airline concentration using HHI and CR4, then evaluated mergers through antitrust and competition frameworks.',
    status: 'Completed March 2026',
    technologies: ['HHI', 'CR4', 'Economics research'],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}