import bread from "@/assets/cat-breads.jpg";
import pastry from "@/assets/cat-pastries.jpg";
import cake from "@/assets/cat-cakes.jpg";
import cookie from "@/assets/cat-cookies.jpg";

const map: Record<string, string> = {
  "/src/assets/cat-breads.jpg": bread,
  "/src/assets/cat-pastries.jpg": pastry,
  "/src/assets/cat-cakes.jpg": cake,
  "/src/assets/cat-cookies.jpg": cookie,
};

export function resolveImage(url: string | null | undefined): string | null {
  if (!url) return null;
  return map[url] ?? url;
}
