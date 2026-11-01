/**
 * Publication gate for campus photographs (Google Drive "pics website" folder).
 *
 * Flip a flag to `true` ONLY after the matching approval is recorded:
 * - CHILD_PHOTOS_APPROVED: recorded guardian consent for every identifiable student shown.
 * - HEADTEACHER_PHOTO_APPROVED: the headteacher's written approval of his portrait.
 *
 * While a flag is `false`, its photos are replaced by the neutral placeholder, so nothing
 * unapproved is published. Unknown photos are hidden by default.
 */
export const CHILD_PHOTOS_APPROVED = false;
export const HEADTEACHER_PHOTO_APPROVED = false;

const CAMPUS_ONLY_PHOTOS = new Set<string>([
  "/images/naalya-school-overview.jpg",
  "/images/NAALYA-building.jpg",
]);

const CHILD_PHOTOS = new Set<string>([
  "/images/class-time.jpg",
  "/images/ICT-LAB.jpg",
  "/images/arts-and-crafts.jpg",
  "/images/robotics-club.jpg",
  "/images/hockey-wins-main.jpg",
  "/images/trophy-wins.jpg",
  "/images/mdd-dance.jpg",
  "/images/mdd.jpg",
  "/images/DANCE.jpg",
  "/images/prefects-pics.jpg",
]);

const HEADTEACHER_PHOTO = "/images/hm.jpg";

export function isPublishable(src: string): boolean {
  if (CAMPUS_ONLY_PHOTOS.has(src)) return true;
  if (src === HEADTEACHER_PHOTO) return HEADTEACHER_PHOTO_APPROVED;
  if (CHILD_PHOTOS.has(src)) return CHILD_PHOTOS_APPROVED;
  return false;
}
