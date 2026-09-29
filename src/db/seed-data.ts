/*
 * Seed input for `npm run db:seed` only. The storefront never imports this:
 * products are read from the database. Prices are whole USD; the seed
 * converts them to cents. Listed newest first.
 */

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  colour: string;
  description: string;
  details: string[];
  sizes: { label: string; stock: number }[];
  images: { src: string; alt: string }[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=2000&q=80&fm=jpg`;

const apparelSizes = (stock: [number, number, number, number, number]) =>
  ["XS", "S", "M", "L", "XL"].map((label, i) => ({ label, stock: stock[i] }));

const oneSize = (stock: number) => [{ label: "One size", stock }];

export const seedProducts: SeedProduct[] = [
  {
    slug: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    category: "Outerwear",
    price: 1450,
    badge: "New",
    colour: "Black",
    description:
      "A classic biker cut in vegetable-tanned lambskin that softens with every wear. Asymmetric zip, notched lapels and a belted hem, finished by hand in our Tuscan workshop.",
    details: [
      "100% lambskin leather, vegetable tanned",
      "Lining: 100% cupro",
      "Silver-tone metal hardware",
      "Regular fit, true to size",
      "Professional leather clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([1, 4, 0, 2, 3]),
    images: [
      {
        src: unsplash("1520975954732-35dd22299614"),
        alt: "Man in sunglasses wearing the black leather biker jacket on a rooftop ledge",
      },
    ],
  },
  {
    slug: "sapphire-drop-earrings",
    name: "Sapphire Drop Earrings",
    category: "Jewellery",
    price: 2100,
    colour: "Sapphire / silver",
    description:
      "Statement drops set with a deep blue stone framed by a halo of hand-set crystals. Made to catch the light at every turn, from day into evening.",
    details: [
      "Sterling silver with rhodium plating",
      "Lab-grown sapphire and crystal",
      "Length: 5.5 cm",
      "Post fastening for pierced ears",
      "Presented in an Atelier jewellery box",
    ],
    sizes: oneSize(2),
    images: [
      {
        src: unsplash("1535632066927-ab7c9ab60908"),
        alt: "Pair of blue stone and crystal drop earrings on a monstera leaf",
      },
    ],
  },
  {
    slug: "satin-bomber-jacket",
    name: "Satin Bomber Jacket",
    category: "Outerwear",
    price: 890,
    colour: "Rust",
    description:
      "An easy bomber in fluid duchess satin with a soft sheen. Ribbed trims and a two-way zip keep it relaxed; a lightweight quilted lining makes it a year-round layer.",
    details: [
      "Outer: 100% silk satin",
      "Lining: 100% cupro, lightly quilted",
      "Two-way zip, ribbed collar, cuffs and hem",
      "Relaxed fit; size down for a closer fit",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([0, 3, 5, 4, 0]),
    images: [
      {
        src: unsplash("1591047139829-d91aecb6caea"),
        alt: "Rust satin bomber jacket on a hanger",
      },
    ],
  },
  {
    slug: "round-metal-sunglasses",
    name: "Round Metal Sunglasses",
    category: "Accessories",
    price: 290,
    compareAtPrice: 410,
    colour: "Gold / green",
    description:
      "Slim round frames in lightweight titanium with green mineral glass lenses. A timeless shape that sits comfortably all day.",
    details: [
      "Titanium frame with gold finish",
      "Mineral glass lenses, 100% UV protection",
      "Lens width 49 mm, bridge 21 mm",
      "Includes leather case and cleaning cloth",
      "Made in Japan",
    ],
    sizes: oneSize(12),
    images: [
      {
        src: unsplash("1511499767150-a48a237f0083"),
        alt: "Round sunglasses with thin gold frames and green lenses",
      },
    ],
  },
  {
    slug: "woven-leather-tote",
    name: "Woven Leather Tote",
    category: "Bags",
    price: 1280,
    badge: "New",
    colour: "Cognac",
    description:
      "Wide bands of supple calfskin, hand-woven into a soft, slouchy tote. Carry it by the gold-tone chain or tuck it under the arm; it holds everything a long day needs.",
    details: [
      "100% calfskin leather, hand woven",
      "Unlined, with a detachable zip pouch",
      "Gold-tone chain strap, 60 cm drop",
      "W 44 x H 30 x D 14 cm",
      "Made in Italy",
    ],
    sizes: oneSize(0),
    images: [
      {
        src: unsplash("1598532163257-ae3c6b2524b6"),
        alt: "Cognac woven leather tote with a gold chain strap",
      },
    ],
  },
  {
    slug: "silk-jogger-trouser",
    name: "Silk Jogger Trouser",
    category: "Ready-to-wear",
    price: 620,
    colour: "Dusty rose",
    description:
      "Tailoring meets ease: a washed-silk jogger with a clean front, patch pockets and cuffed ankles. Wear with heels or flats.",
    details: [
      "100% washed silk",
      "Elasticated waist with drawstring",
      "Patch pockets and elasticated cuffs",
      "Relaxed fit through the leg",
      "Dry clean or cool hand wash",
      "Made in Portugal",
    ],
    sizes: apparelSizes([2, 0, 3, 1, 6]),
    images: [
      {
        src: unsplash("1594633312681-425c7b97ccd1"),
        alt: "Model wearing dusty pink silk jogger trousers and heels",
      },
    ],
  },
  {
    slug: "crochet-knit-poncho",
    name: "Crochet Knit Poncho",
    category: "Knitwear",
    price: 540,
    compareAtPrice: 720,
    colour: "Ecru",
    description:
      "An open crochet poncho in soft organic cotton with a V-neck and hand-knotted fringe. Throw it over a slip dress or a crisp shirt.",
    details: [
      "100% organic cotton",
      "Hand-crocheted, hand-knotted fringe",
      "One size, fits UK 6 to 16",
      "Hand wash cold, dry flat",
      "Made in Peru",
    ],
    sizes: oneSize(6),
    images: [
      {
        src: unsplash("1434389677669-e08b4cac3105"),
        alt: "Cream crochet knit poncho with fringe on a wooden hanger",
      },
    ],
  },
  {
    slug: "pearl-pendant-necklace",
    name: "Pearl Pendant Necklace",
    category: "Jewellery",
    price: 380,
    colour: "Gold / pearl",
    description:
      "A single freshwater pearl suspended from a fine trace chain. Delicate enough for every day, and made for layering.",
    details: [
      "18k gold vermeil on sterling silver",
      "Freshwater pearl, approx. 8 mm",
      "Chain length 42 cm with 5 cm extender",
      "Lobster clasp",
      "Presented in an Atelier jewellery box",
    ],
    sizes: oneSize(9),
    images: [
      {
        src: unsplash("1611085583191-a3b181a88401"),
        alt: "Fine gold chain with a single pearl pendant worn at the collarbone",
      },
    ],
  },
];
