import { getProjects } from "./sanity.ts";

/** One gallery slot in a case study, shaped like the Studio's project images. */
export type StudyImage = {
  /** `default` sits in the two-column grid; `fullWidth` spans both columns. */
  layout: "default" | "fullWidth";
};

/** A case study, as the studies pages read it. */
export type Study = {
  title: string;
  slug: string;
  /** The project description, as Home shows it. */
  description?: string;
  /** How the work was taken on, such as "Freelance". */
  engagement: string;
  services: string[];
  /** The brief, shown above the problem gallery. */
  problem: string;
  problemGallery: StudyImage[];
  /** The approach, shown above the solution gallery. */
  solution: string;
  solutionGallery: StudyImage[];
};

const problem =
  "Problem rem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat.";

const solution =
  "Solution rem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat.";

const half: StudyImage = { layout: "default" };
const full: StudyImage = { layout: "fullWidth" };

// The galleries follow the Figma layout
const problemGallery: StudyImage[] = [half, half, full];

const solutionGallery: StudyImage[] = [
  half,
  half,
  half,
  half,
  full,
  full,
  full,
  full,
  half,
  half,
  half,
  half,
];

// Stand-ins until the Studio's projects have these fields
const standIns = {
  engagement: "Freelance",
  problem,
  problemGallery,
  solution,
  solutionGallery,
};

/**
 * Case studies for the brand projects, in the order set in the Studio. Title,
 * slug, description and services come from the project, as on Home.
 */
export async function getStudies(): Promise<Study[]> {
  const projects = await getProjects("brand");
  return projects.map(({ title, slug, description, services }) => ({
    title,
    slug,
    description: description ?? undefined,
    services: services ?? [],
    ...standIns,
  }));
}
