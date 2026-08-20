export const CATEGORIES = [
  { id: "kitob", label: "Kitoblar" },
  { id: "video", label: "Video darslar" },
  { id: "kiyim", label: "Kiyim-kechak" },
  { id: "maktab", label: "Maktab buyumlari" },
  { id: "royzgor", label: "Uy-ro'zg'or" },
  { id: "oyin", label: "O'yinchoqlar" },
] as const;

export const VILOYATLAR = [
  "Toshkent shahri", "Toshkent viloyati", "Samarqand", "Buxoro", "Andijon",
  "Farg'ona", "Namangan", "Xorazm", "Qashqadaryo", "Surxondaryo",
  "Navoiy", "Jizzax", "Sirdaryo", "Qoraqalpog'iston",
] as const;

export const HOLAT = ["Yangidek", "Yaxshi", "O'rtacha"] as const;

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
