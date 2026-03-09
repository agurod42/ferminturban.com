export type HeroVideo = {
  id: string;
  projectSlug: string;
};

// Hero background videos by device type.
// Mobile uses the only portrait Vimeo assets we scraped.
// Tablet favors less panoramic frames.
// Desktop stays on clean landscape / widescreen shots.

export const heroVideosMobile: HeroVideo[] = [
  { id: "1111397503", projectSlug: "mercado-libre-bicho" },
  { id: "844032084", projectSlug: "pilsen" },
];

export const heroVideosTablet: HeroVideo[] = [
  { id: "1111395985", projectSlug: "stadium" },
  { id: "1120210224", projectSlug: "jack-backspring-summer" },
  { id: "844034498", projectSlug: "natalia-oreiro" },
  { id: "884446816", projectSlug: "higuita" },
];

export const heroVideosDesktop: HeroVideo[] = [
  { id: "1048141828", projectSlug: "jack-stay-true" },
  { id: "992797912", projectSlug: "audi" },
  { id: "1120206992", projectSlug: "mercado-pago" },
  { id: "1150093961", projectSlug: "farmashop-navidad" },
  { id: "960540239", projectSlug: "colombia" },
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
