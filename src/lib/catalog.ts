/*
 * Static editorial content for the homepage and collection pages: hero,
 * shop-by tiles, collections and campaign blocks. Products live in the
 * database (src/db/queries/products.ts); collections only curate them by slug. Images are Unsplash photos served through
 * next/image (the host is allowed in next.config.ts).
 */

export type Collection = {
  slug: string;
  name: string;
  description: string;
  image: { src: string; alt: string };
  /* Product slugs in display order. Slugs missing from the database are skipped. */
  productSlugs: string[];
};

export type Category = {
  slug: string;
  name: string;
  image: { src: string; alt: string };
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=2000&q=80&fm=jpg`;

export const hero = {
  eyebrow: "Autumn / Winter 2026",
  title: "The Outerwear Edit",
  description:
    "Tailored wool, oversized checks and soft leather, cut for the season ahead.",
  href: "/collections/outerwear",
  images: [
    {
      src: unsplash("1539109136881-3be0616acf4b"),
      alt: "Woman in a pale blue wool coat standing in a cathedral square",
    },
    {
      src: unsplash("1485968579580-b6d095142e6e"),
      alt: "Woman in a checked coat carrying a burgundy bag on a city street",
    },
  ],
};

export const categories: Category[] = [
  {
    slug: "women",
    name: "Women",
    image: {
      src: unsplash("1509631179647-0177331693ae"),
      alt: "Model in striped wide-leg trousers against a green wall",
    },
  },
  {
    slug: "men",
    name: "Men",
    image: {
      src: unsplash("1617137968427-85924c800a22"),
      alt: "Man in a navy suit walking past a glass building",
    },
  },
  {
    slug: "bags",
    name: "Bags",
    image: {
      src: unsplash("1594223274512-ad4803739b7c"),
      alt: "Teal grained-leather top-handle bag with a gold clasp",
    },
  },
  {
    slug: "shoes",
    name: "Shoes",
    image: {
      src: unsplash("1543163521-1bf539c55dd2"),
      alt: "Pair of floral print stilettos on a pale blue set",
    },
  },
];


export const collections: Collection[] = [
  {
    slug: "evening",
    name: "Evening",
    description: "Sequins, pleats and colour made for after dark.",
    image: {
      src: unsplash("1550614000-4895a10e1bfd"),
      alt: "Two women in red sequinned and pleated eveningwear",
    },
    productSlugs: [
      "silk-slip-dress",
      "sequin-column-gown",
      "tiered-tulle-gown",
      "crystal-evening-clutch",
      "crystal-bow-sandal",
      "pointed-leather-pump",
      "sapphire-drop-earrings",
      "pearl-pendant-necklace",
    ],
  },
  {
    slug: "tailoring",
    name: "Tailoring",
    description: "Sharp shoulders and clean lines in Italian wool.",
    image: {
      src: unsplash("1507679799987-c73779587ccf"),
      alt: "Man buttoning a dark suit jacket with a striped tie",
    },
    productSlugs: [
      "prince-of-wales-blazer",
      "pinstripe-double-breasted-jacket",
      "charcoal-wool-suit-jacket",
      "pinstripe-wide-leg-trouser",
      "cotton-poplin-shirt",
      "leather-derby-shoe",
    ],
  },
  {
    slug: "resort",
    name: "Resort",
    description: "Light florals and easy silhouettes for warmer days.",
    image: {
      src: unsplash("1496747611176-843222e1e57c"),
      alt: "Woman in a floral wrap dress by the sea",
    },
    productSlugs: [
      "linen-shirt-dress",
      "palm-print-wide-leg-trouser",
      "linen-shift-dress",
      "round-raffia-crossbody",
      "leather-cross-strap-slide",
      "crochet-knit-poncho",
      "round-metal-sunglasses",
    ],
  },
];

/* Linked from the hero and campaign banner rather than the featured tiles. */
const campaignCollections: Collection[] = [
  {
    slug: "outerwear",
    name: "The Outerwear Edit",
    description: "Tailored wool, oversized checks and soft leather, cut for the season ahead.",
    image: {
      src: unsplash("1539109136881-3be0616acf4b"),
      alt: "Woman in a pale blue wool coat standing in a cathedral square",
    },
    productSlugs: [
      "cotton-gabardine-trench",
      "belted-wool-wrap-coat",
      "camel-wool-overcoat",
      "shearling-teddy-jacket",
      "leather-biker-jacket",
      "satin-bomber-jacket",
    ],
  },
  {
    slug: "essentials",
    name: "Considered Essentials",
    description: "The pieces you reach for every day, made to last for years.",
    image: {
      src: unsplash("1558769132-cb1aea458c5e"),
      alt: "Rail of knitwear in cream, camel and taupe beside dried pampas grass",
    },
    productSlugs: [
      "cashmere-crew-neck-sweater",
      "chunky-rib-wool-jumper",
      "organic-cotton-t-shirt",
      "straight-leg-selvedge-jeans",
      "cotton-poplin-shirt",
      "leather-chelsea-boot",
    ],
  },
];

export const allCollections = [...collections, ...campaignCollections];

export const getCollection = (slug: string) =>
  allCollections.find((collection) => collection.slug === slug);

/*
 * Intro copy for category pages that need more than the generic line. Which
 * products belong to a category lives in the database (product_categories).
 */
export const categoryIntros: Record<string, string> = {
  women:
    "Ready-to-wear, shoes, bags and jewellery for women, from everyday essentials to evening.",
  men: "Tailoring, outerwear, knitwear and shoes for men, cut to last.",
};

export const editorial = {
  eyebrow: "The Atelier Journal",
  title: "Leather, reconsidered",
  body: "Our leather comes from a single family-run tannery in Tuscany. Each hide is vegetable tanned over forty days, then cut and finished by hand, so every jacket softens and darkens in its own way.",
  href: "/journal/leather-reconsidered",
  image: {
    src: unsplash("1487222477894-8943e31ef7b2"),
    alt: "Man in sunglasses and a tan leather jacket against a pink backdrop",
  },
};

export const banner = {
  eyebrow: "Considered essentials",
  title: "A wardrobe built to last",
  href: "/collections/essentials",
  image: {
    src: unsplash("1558769132-cb1aea458c5e"),
    alt: "Rail of knitwear in cream, camel and taupe beside dried pampas grass",
  },
};

