import type { Dream } from "./types";
import astronaut from "@/content/astronaut.json";
import paleontologist from "@/content/paleontologist.json";
import artist from "@/content/artist.json";
import doctor from "@/content/doctor.json";
import musician from "@/content/musician.json";
import entrepreneur from "@/content/entrepreneur.json";

export const dreams: Dream[] = [
  astronaut,
  paleontologist,
  artist,
  doctor,
  musician,
  entrepreneur,
] as Dream[];

export function getDream(slug: string): Dream | undefined {
  return dreams.find((d) => d.slug === slug);
}
