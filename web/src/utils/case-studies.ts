import { getCaseStudyDocuments } from "./sanity.ts";

/** Labels for the Studio's `engagement` values. */
const engagements = { freelance: "Freelance", agency: "Agency" };

/** A Studio text field as paragraphs, one per line, skipping blank lines. */
const paragraphs = (text: string | null) =>
  text
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean) ?? [];

/**
 * The case studies, in the order set in the Studio and numbered from 1. Fields
 * left empty in the Studio come back empty, and the page leaves them out.
 */
export async function getCaseStudies() {
  const caseStudies = await getCaseStudyDocuments();
  return caseStudies.map((caseStudy, i) => ({
    ...caseStudy,
    number: i + 1,
    description: caseStudy.description ?? undefined,
    engagement: caseStudy.engagement
      ? engagements[caseStudy.engagement]
      : undefined,
    services: caseStudy.services ?? [],
    featureGallery: caseStudy.featureGallery ?? [],
    brief: paragraphs(caseStudy.brief),
    briefGallery: caseStudy.briefGallery ?? [],
    approach: paragraphs(caseStudy.approach),
    approachGallery: caseStudy.approachGallery ?? [],
  }));
}

/** A case study, as Home and the case study pages read it. */
export type CaseStudy = Awaited<ReturnType<typeof getCaseStudies>>[number];
