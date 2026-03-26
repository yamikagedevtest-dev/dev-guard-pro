export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Languages": ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "C#", "PHP", "Ruby", "Swift", "Kotlin"],
  "Frontend": ["React", "Next.js", "Vue", "Angular", "Svelte", "HTML/CSS", "Tailwind CSS", "SASS"],
  "Backend": ["Node.js", "Django", "Spring Boot", "Laravel", "Express", "FastAPI", "NestJS", "Rails"],
  "Mobile": ["Flutter", "React Native", "Kotlin", "Swift", "Ionic"],
  "Databases": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "SQLite", "DynamoDB"],
  "DevOps": ["Docker", "Kubernetes", "CI/CD", "AWS", "GCP", "Azure", "Terraform", "Jenkins"],
  "Other": ["System Design", "DSA", "AI/ML", "Web3", "GraphQL", "REST API", "Microservices", "Testing"],
};

export type SkillLevel = "beginner" | "intermediate" | "expert";

export interface SelectedSkill {
  name: string;
  category: string;
  level: SkillLevel;
}
