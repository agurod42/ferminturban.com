export type HeroVideo = {
  id: string;
  projectSlug: string;
  startAtSeconds: number;
};

// Hero background videos by device type.
// Mobile uses the only portrait Vimeo assets we scraped.
// Tablet favors less panoramic frames.
// Desktop stays on clean landscape / widescreen shots.
const HERO_TARGET_START_SECONDS = 30;
const HERO_MIN_REMAINING_SECONDS = 12;

const createHeroVideo = (
  id: string,
  projectSlug: string,
  durationSeconds: number
): HeroVideo => ({
  id,
  projectSlug,
  // Shorter clips still start later, but keep enough runtime left to avoid a jarring near-end loop.
  startAtSeconds: Math.max(
    0,
    Math.min(HERO_TARGET_START_SECONDS, durationSeconds - HERO_MIN_REMAINING_SECONDS)
  ),
});

export const heroVideosMobile: HeroVideo[] = [
  createHeroVideo("1111397503", "mercado-libre-bicho", 46),
  createHeroVideo("844032084", "pilsen", 17),
];

export const heroVideosTablet: HeroVideo[] = [
  createHeroVideo("1111395985", "stadium", 43),
  createHeroVideo("1120210224", "jack-backspring-summer", 53),
  createHeroVideo("844034498", "natalia-oreiro", 27),
  createHeroVideo("884446816", "higuita", 117),
];

export const heroVideosDesktop: HeroVideo[] = [
  createHeroVideo("1048141828", "jack-stay-true", 45),
  createHeroVideo("992797912", "audi", 44),
  createHeroVideo("1120206992", "mercado-pago", 20),
  createHeroVideo("1150093961", "farmashop-navidad", 88),
  createHeroVideo("960540239", "colombia", 105),
];

export function getHeroVideoPool(
  type: "mobile" | "tablet" | "desktop"
): HeroVideo[] {
  return type === "mobile"
    ? heroVideosMobile
    : type === "tablet"
      ? heroVideosTablet
      : heroVideosDesktop;
}

export function getRandomHeroVideo(
  type: "mobile" | "tablet" | "desktop"
): HeroVideo {
  const list = getHeroVideoPool(type);
  return list[Math.floor(Math.random() * list.length)];
}
