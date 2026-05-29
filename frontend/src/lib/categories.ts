export const CATEGORIES = [
  { id: "networking", label: "Networking", emoji: "🌐", color: "#a78bfa" },
  { id: "cloud", label: "Cloud", emoji: "☁️", color: "#34d399" },
  { id: "devops", label: "DevOps", emoji: "⚙️", color: "#60a5fa" },
  { id: "devsecops", label: "DevSecOps", emoji: "🔒", color: "#f472b6" },
  { id: "linux", label: "Linux", emoji: "🐧", color: "#fbbf24" },
  { id: "cicd", label: "CI/CD", emoji: "🔄", color: "#818cf8" },
  { id: "kubernetes", label: "Kubernetes / K8s", emoji: "☸️", color: "#38bdf8" },
  { id: "terraform", label: "Terraform", emoji: "🏗️", color: "#c084fc" },
  { id: "monitoring", label: "Monitoring", emoji: "📊", color: "#fb923c" },
  { id: "scripting", label: "Scripting", emoji: "📜", color: "#a3e635" },
  { id: "python", label: "Python", emoji: "🐍", color: "#facc15" },
  { id: "tech", label: "Tech", emoji: "⚡", color: "#00D4FF" },
  { id: "basketball", label: "Basketball", emoji: "🏀", color: "#FF6B1A" },
  { id: "life", label: "Life", emoji: "✨", color: "#f78ca0" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"] | string;

export function getCategoryMeta(id: string) {
  return (
    CATEGORIES.find((c) => c.id === id) ?? {
      id,
      label: id,
      emoji: "📝",
      color: "#8b949e",
    }
  );
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function calcReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}
