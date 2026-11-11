export const LINKEDIN_JOBS_SEARCH_URL = 'https://www.linkedin.com/jobs/search/';

// Builds a LinkedIn job search URL for a job title and company.
// The keywords are always passed through encodeURIComponent, so job fields can never
// add extra query parameters or change the address.
export function buildLinkedInJobSearchUrl(jobTitle, companyName) {
  const keywords = `${jobTitle ?? ''} ${companyName ?? ''}`.trim();
  return `${LINKEDIN_JOBS_SEARCH_URL}?keywords=${encodeURIComponent(keywords)}`;
}
