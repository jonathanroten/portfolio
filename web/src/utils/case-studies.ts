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
 * left empty in the Studio come back empty, and the page leaves them out. A
 * case study is `ready` once it has a Hero Image and its Brief or Approach has
 * text or images; only ready ones get a page. The Studio requires a Hero Image,
 * but documents published before that rule may still lack one, so it can be
 * `null` here.
 */
export async function getCaseStudies() {
  const caseStudies = await getCaseStudyDocuments();
  return caseStudies.map((caseStudy, i) => {
    const heroImage: typeof caseStudy.heroImage | null = caseStudy.heroImage;
    const brief = paragraphs(caseStudy.brief);
    const briefGallery = caseStudy.briefGallery ?? [];
    const approach = paragraphs(caseStudy.approach);
    const approachGallery = caseStudy.approachGallery ?? [];
    return {
      ...caseStudy,
      heroImage,
      number: i + 1,
      description: caseStudy.description ?? undefined,
      engagement: caseStudy.engagement
        ? engagements[caseStudy.engagement]
        : undefined,
      services: caseStudy.services ?? [],
      featureGallery: caseStudy.featureGallery ?? [],
      brief,
      briefGallery,
      approach,
      approachGallery,
      ready:
        !!heroImage &&
        [brief, briefGallery, approach, approachGallery].some(
          (part) => part.length > 0,
        ),
    };
  });
}

/** A case study, as Home and the case study pages read it. */
export type CaseStudy = Awaited<ReturnType<typeof getCaseStudies>>[number];
