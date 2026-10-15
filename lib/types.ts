export type Profile = {
  id: string;
  full_name: string;
  region: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  condition: "Yangidek" | "Yaxshi" | "O'rtacha";
  region: string;
  image_url: string | null;
  status: "faol" | "band" | "berildi";
  created_at: string;
  profiles?: Pick<Profile, "full_name">;
  price_type?: "bepul" | "set_price" | "kelishilgan";
  price?: number | null;
};

export type ItemRequest = {
  id: string;
  item_id: string;
  requester_id: string;
  message: string;
  status: "kutilmoqda" | "qabul_qilindi" | "rad_etildi";
  created_at: string;
  items?: Pick<Item, "title" | "image_url">;
};
