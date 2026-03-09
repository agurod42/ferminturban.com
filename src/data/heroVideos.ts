// Hero background videos by device type.
// Mobile uses the only portrait Vimeo assets we scraped.
// Tablet favors less panoramic frames.
// Desktop stays on clean landscape / widescreen shots.

export const heroVideosMobile: string[] = [
  "1111397503", // mercado-libre-bicho
  "844032084", // pilsen
];

export const heroVideosTablet: string[] = [
  "1111395985", // stadium
  "1120210224", // jack-backspring-summer
  "844034498", // natalia-oreiro
  "884446816", // higuita
];

export const heroVideosDesktop: string[] = [
  "1048141828", // jack-stay-true
  "992797912", // audi
  "1120206992", // mercado-pago
  "1150093961", // farmashop-navidad
  "960540239", // colombia
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
