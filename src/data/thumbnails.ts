// Thumbnail map for projects with generated images
// Import all available thumbnails
import audiThumb from "@/assets/thumbnails/audi.jpg";
import nataliaOreiro from "@/assets/thumbnails/natalia-oreiro.jpg";
import mercadoPago from "@/assets/thumbnails/mercado-pago.jpg";
import higuita from "@/assets/thumbnails/higuita.jpg";
import colombia from "@/assets/thumbnails/colombia.jpg";

export const thumbnails: Record<string, string> = {
  audi: audiThumb,
  "natalia-oreiro": nataliaOreiro,
  "mercado-pago": mercadoPago,
  higuita: higuita,
  colombia: colombia,
};

export const getThumbnail = (slug: string): string | undefined => thumbnails[slug];
