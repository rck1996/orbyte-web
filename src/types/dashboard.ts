export type Highlight = {
  label: string;
  value: string;
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  detail: string;
  tone: "accent" | "success" | "warning";
};

export type ActivityItem = {
  title: string;
  timestamp: string;
  summary: string;
  status: "Live" | "Review" | "Resolved";
};

export type HealthItem = {
  label: string;
  value: string;
  progress: number;
};

export type Automation = {
  title: string;
  description: string;
  icon: "chart" | "orbit" | "shield" | "database";
};

export type Release = {
  title: string;
  stage: string;
  owner: string;
};

export type ExperienceState = {
  title: string;
  description: string;
  tone: "empty" | "success" | "error";
};

export type DashboardData = {
  highlights: Highlight[];
  metrics: Metric[];
  activity: ActivityItem[];
  health: HealthItem[];
  automations: Automation[];
  releases: Release[];
  states: ExperienceState[];
};
