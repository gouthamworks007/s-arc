import { FEATURED_PROJECTS } from "@/lib/data";
import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  return FEATURED_PROJECTS.map((project) => ({
    id: project.id,
  }));
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />;
}
