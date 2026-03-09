// Hero background videos by device type
// Vimeo IDs — vertical for mobile, mixed for tablet, landscape for desktop

export const heroVideosMobile: string[] = [
  "1119567207",
  "824804225",
  "727502042",
  "862756882",
];

export const heroVideosTablet: string[] = [
  "1119567207",
  "824804225",
  "727502042",
  "862756882",
];

export const heroVideosDesktop: string[] = [
  "1119567207",
  "824804225",
  "727502042",
  "862756882",
];

export function getRandomHeroVideo(
  type: "mobile" | "tablet" | "desktop"
): string {
  const list =
    type === "mobile"
      ? heroVideosMobile
      : type === "tablet"
        ? heroVideosTablet
        : heroVideosDesktop;
  return list[Math.floor(Math.random() * list.length)];
}
