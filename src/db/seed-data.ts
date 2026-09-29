/*
 * Seed input for `npm run db:seed` only. The storefront never imports this:
 * products are read from the database. Prices are whole USD; the seed
 * converts them to cents. Listed newest first.
 */

type SeedProduct = {
  slug: string;
  name: string;
  /* Category names; the first is the primary product type (Shoes, Outerwear, ...). */
  categories: [string, ...string[]];
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

/* Five consecutive EU sizes starting at `from`. */
const shoeSizes = (from: number, stock: [number, number, number, number, number]) =>
  stock.map((quantity, i) => ({ label: `EU ${from + i}`, stock: quantity }));

export const seedProducts: SeedProduct[] = [
  {
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    categories: ["Ready-to-wear", "Women"],
    price: 980,
    colour: "Black",
    description:
      "A bias-cut slip in heavy sandwashed silk that skims the body and falls just below the knee. Fine adjustable straps and a softly cowled neckline, made for evenings out.",
    details: [
      "100% silk charmeuse",
      "Bias cut with adjustable straps",
      "Unlined",
      "Midi length, true to size",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([2, 4, 3, 2, 1]),
    images: [
      {
        src: unsplash("1618037208874-021263b58d69"),
        alt: "Woman in a black silk slip dress leaning against a white window frame",
      },
    ],
  },
  {
    slug: "sequin-column-gown",
    name: "Sequin Column Gown",
    categories: ["Ready-to-wear", "Women"],
    price: 2450,
    colour: "Silver",
    description:
      "A floor-length column hand-embroidered with thousands of silver sequins. The off-the-shoulder neckline and fluid tulle base keep it light enough to dance in.",
    details: [
      "Hand-sewn sequins on a tulle base",
      "Lining: 100% silk",
      "Off-the-shoulder neckline",
      "Concealed back zip",
      "Specialist dry clean only",
      "Made in France",
    ],
    sizes: apparelSizes([1, 2, 2, 1, 0]),
    images: [
      {
        src: unsplash("1766282088783-8bc59121039d"),
        alt: "Woman in a silver sequinned off-the-shoulder gown against a white studio wall",
      },
    ],
  },
  {
    slug: "tiered-tulle-gown",
    name: "Tiered Tulle Gown",
    categories: ["Ready-to-wear", "Women"],
    price: 3200,
    colour: "Black",
    description:
      "Cascading tiers of embroidered tulle over a structured bodice, with a high front split and a full sweeping train. A statement piece for the most formal occasions.",
    details: [
      "100% polyamide tulle with tonal embroidery",
      "Boned bodice, lining: 100% silk",
      "Off-the-shoulder neckline with a front split",
      "Concealed back zip",
      "Specialist dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([0, 1, 2, 1, 1]),
    images: [
      {
        src: unsplash("1568251188392-ae32f898cb3b"),
        alt: "Woman in a black tiered tulle gown with a long train in a white panelled room",
      },
    ],
  },
  {
    slug: "crystal-evening-clutch",
    name: "Crystal Evening Clutch",
    categories: ["Bags", "Women"],
    price: 1150,
    colour: "Ivory / crystal",
    description:
      "A slim envelope clutch in smooth calfskin with a diagonal panel of hand-set crystals. Carry it in the hand or on the tucked-away silver chain.",
    details: [
      "Calfskin leather and hand-set crystals",
      "Lining: 100% satin",
      "Magnetic flap closure",
      "Removable 55 cm chain strap",
      "Dimensions: 24 x 14 x 4 cm",
      "Made in Italy",
    ],
    sizes: oneSize(4),
    images: [
      {
        src: unsplash("1783700549620-a6699881dc45"),
        alt: "Hands resting on an ivory clutch with a crystal-covered panel and silver chain",
      },
    ],
  },
  {
    slug: "crystal-bow-sandal",
    name: "Crystal Bow Sandal",
    categories: ["Shoes", "Women"],
    price: 890,
    colour: "Nude",
    description:
      "A high stiletto sandal in soft nappa, finished with a crystal-embellished bow across the toe. The adjustable ankle strap keeps it secure from dinner to the dance floor.",
    details: [
      "Nappa leather upper and lining",
      "Hand-applied crystal bow",
      "Heel height: 10 cm",
      "Adjustable ankle strap with buckle",
      "Leather sole",
      "Made in Italy",
    ],
    sizes: shoeSizes(36, [1, 3, 2, 2, 1]),
    images: [
      {
        src: unsplash("1590099033615-be195f8d575c"),
        alt: "Pair of nude stiletto sandals with crystal bows on an orange backdrop",
      },
    ],
  },
  {
    slug: "prince-of-wales-blazer",
    name: "Prince of Wales Blazer",
    categories: ["Ready-to-wear", "Women"],
    price: 1290,
    colour: "Grey check",
    description:
      "A relaxed double-breasted blazer in Prince of Wales check wool, with softly padded shoulders and a longer line. Wear it with the matching trouser or over denim.",
    details: [
      "100% virgin wool",
      "Lining: 100% cupro",
      "Double-breasted with horn buttons",
      "Relaxed fit, size down for a closer fit",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([2, 3, 4, 2, 1]),
    images: [
      {
        src: unsplash("1608234808654-2a8875faa7fd"),
        alt: "Woman in a grey Prince of Wales check double-breasted blazer with a white shirt",
      },
    ],
  },
  {
    slug: "pinstripe-double-breasted-jacket",
    name: "Pinstripe Double-Breasted Jacket",
    categories: ["Ready-to-wear", "Men"],
    price: 1650,
    colour: "Pale grey pinstripe",
    description:
      "Our signature six-button jacket in a lightweight pinstriped wool, with peak lapels and a sharp roped shoulder. Half-canvassed by hand so it moulds to you over time.",
    details: [
      "100% Super 120s wool",
      "Half-canvas construction",
      "Peak lapels, six-on-two buttoning",
      "Tailored fit, true to size",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([0, 2, 3, 3, 2]),
    images: [
      {
        src: unsplash("1480429370139-e0132c086e2a"),
        alt: "Man in a pale grey pinstripe double-breasted jacket with a navy tie in a garden",
      },
    ],
  },
  {
    slug: "charcoal-wool-suit-jacket",
    name: "Charcoal Wool Suit Jacket",
    categories: ["Ready-to-wear", "Men"],
    price: 1390,
    compareAtPrice: 1850,
    colour: "Charcoal",
    description:
      "A single-breasted two-button jacket in a year-round charcoal wool. Narrow notch lapels and a clean, close cut make it the foundation of a modern suit.",
    details: [
      "100% virgin wool",
      "Lining: 100% cupro",
      "Notch lapels, two-button fastening",
      "Slim fit, true to size",
      "Dry clean only",
      "Made in Portugal",
    ],
    sizes: apparelSizes([1, 2, 1, 0, 2]),
    images: [
      {
        src: unsplash("1622497170185-5d668f816a56"),
        alt: "Man in a charcoal suit jacket and black tie on white stone steps",
      },
    ],
  },
  {
    slug: "pinstripe-wide-leg-trouser",
    name: "Pinstripe Wide-Leg Trouser",
    categories: ["Ready-to-wear", "Women"],
    price: 590,
    colour: "Ivory / black stripe",
    description:
      "A high-rise trouser that falls straight and wide from the hip, cut in a crisp pinstriped cotton-wool blend. Pressed front creases lengthen the leg.",
    details: [
      "60% cotton, 40% wool",
      "High rise with a concealed hook-and-zip fly",
      "Side and back pockets",
      "Full length, true to size",
      "Dry clean only",
      "Made in Portugal",
    ],
    sizes: apparelSizes([2, 4, 4, 3, 1]),
    images: [
      {
        src: unsplash("1789110854083-e4752bded644"),
        alt: "Ivory high-waisted wide-leg trousers with thin black pinstripes",
      },
    ],
  },
  {
    slug: "cotton-poplin-shirt",
    name: "Cotton Poplin Shirt",
    categories: ["Ready-to-wear", "Men"],
    price: 320,
    colour: "White",
    description:
      "The white shirt, perfected: dense two-ply poplin, a semi-spread collar that holds its shape and mother-of-pearl buttons. Tuck it into tailoring or wear it loose.",
    details: [
      "100% two-ply cotton poplin",
      "Mother-of-pearl buttons",
      "Semi-spread collar, single cuffs",
      "Regular fit, true to size",
      "Machine wash at 30°C",
      "Made in Portugal",
    ],
    sizes: apparelSizes([4, 6, 8, 5, 3]),
    images: [
      {
        src: unsplash("1603252109612-24fa03d145c8"),
        alt: "Close crop of a crisp white cotton poplin shirt collar",
      },
    ],
  },
  {
    slug: "leather-derby-shoe",
    name: "Leather Derby Shoe",
    categories: ["Shoes", "Men"],
    price: 720,
    colour: "Tan",
    description:
      "A classic open-laced derby in burnished calf with a subtly perforated vamp. Goodyear welted, so it can be resoled for years of wear.",
    details: [
      "Calfskin upper, leather lining",
      "Goodyear-welted leather sole",
      "Hand-burnished finish",
      "Fits true to size",
      "Wipe clean and use shoe trees",
      "Made in Spain",
    ],
    sizes: shoeSizes(41, [2, 3, 4, 2, 1]),
    images: [
      {
        src: unsplash("1614252235316-8c857d38b5f4"),
        alt: "Close view of a pair of tan leather lace-up derby shoes",
      },
    ],
  },
  {
    slug: "linen-shirt-dress",
    name: "Linen Shirt Dress",
    categories: ["Ready-to-wear", "Women"],
    price: 540,
    colour: "Terracotta",
    description:
      "An easy button-through dress in washed linen with a camp collar, patch pockets and a self-tie belt. Made for long, warm days and cool evenings by the water.",
    details: [
      "100% European linen, garment washed",
      "Horn-effect buttons",
      "Self-tie belt",
      "Relaxed fit, knee length",
      "Machine wash at 30°C",
      "Made in Portugal",
    ],
    sizes: apparelSizes([3, 4, 5, 3, 2]),
    images: [
      {
        src: unsplash("1789110853872-f416085557fa"),
        alt: "Terracotta short-sleeved linen shirt dress with a tie belt",
      },
    ],
  },
  {
    slug: "palm-print-wide-leg-trouser",
    name: "Palm Print Wide-Leg Trouser",
    categories: ["Ready-to-wear", "Women"],
    price: 460,
    colour: "Rust / ivory",
    description:
      "A fluid pull-on trouser in a hand-painted palm print, with a paperbag waist and a soft self-tie. Light enough to pack, and easy from the beach to dinner.",
    details: [
      "100% viscose crepe",
      "Elasticated paperbag waist with tie",
      "Side pockets",
      "Relaxed fit, full length",
      "Hand wash cold",
      "Made in India",
    ],
    sizes: apparelSizes([2, 3, 3, 2, 2]),
    images: [
      {
        src: unsplash("1789110520665-f07353f0afbe"),
        alt: "Rust and ivory palm print wide-leg trousers with a tie waist",
      },
    ],
  },
  {
    slug: "linen-shift-dress",
    name: "Linen Shift Dress",
    categories: ["Ready-to-wear", "Women"],
    price: 490,
    compareAtPrice: 650,
    colour: "Sand",
    description:
      "A sleeveless shift with a round neck and a gently A-line skirt, cut from a crisp, breathable linen. Minimal, cool and quietly polished.",
    details: [
      "100% European linen",
      "Lining: 100% cotton voile",
      "Concealed back zip",
      "Straight fit, above the knee",
      "Machine wash at 30°C",
      "Made in Portugal",
    ],
    sizes: apparelSizes([1, 2, 0, 3, 1]),
    images: [
      {
        src: unsplash("1747396206869-75ea57b325ce"),
        alt: "Woman in a sleeveless sand linen shift dress against a white wall",
      },
    ],
  },
  {
    slug: "round-raffia-crossbody",
    name: "Round Raffia Crossbody",
    categories: ["Bags", "Women"],
    price: 380,
    colour: "Natural / berry",
    description:
      "A circular bag hand-coiled from raffia with a spiral of berry tones and a long woven strap. Each one is made by artisans, so no two are exactly alike.",
    details: [
      "100% natural raffia",
      "Lining: 100% cotton",
      "Zip-top closure",
      "Adjustable woven strap",
      "Diameter: 22 cm",
      "Handmade in Madagascar",
    ],
    sizes: oneSize(7),
    images: [
      {
        src: unsplash("1771237873540-4e4f4d5b0def"),
        alt: "Hands holding a round coiled raffia bag with a berry spiral",
      },
    ],
  },
  {
    slug: "leather-cross-strap-slide",
    name: "Leather Cross-Strap Slide",
    categories: ["Shoes", "Women"],
    price: 420,
    colour: "Cognac",
    description:
      "A flat slide with two wide crossed straps in soft vegetable-tanned leather and a square toe. A moulded footbed keeps it comfortable all day.",
    details: [
      "Vegetable-tanned leather upper",
      "Moulded leather footbed",
      "Square toe",
      "Rubber-tipped leather sole",
      "Fits true to size",
      "Made in Italy",
    ],
    sizes: shoeSizes(36, [2, 4, 5, 3, 2]),
    images: [
      {
        src: unsplash("1613662632164-7f2b081a5b46"),
        alt: "Pair of cognac leather slides with wide crossed straps and square toes",
      },
    ],
  },
  {
    slug: "cotton-gabardine-trench",
    name: "Cotton Gabardine Trench",
    categories: ["Outerwear", "Women"],
    price: 1690,
    colour: "Stone",
    description:
      "A double-breasted trench in water-repellent cotton gabardine, with storm flaps, buckled cuffs and a belted waist. Generously cut to layer over tailoring.",
    details: [
      "100% cotton gabardine, water repellent",
      "Lining: 100% cupro",
      "Storm flap, epaulettes and buckled cuffs",
      "Relaxed fit, true to size",
      "Dry clean only",
      "Made in England",
    ],
    sizes: apparelSizes([2, 3, 4, 2, 1]),
    images: [
      {
        src: unsplash("1676716105765-e19fe6a01851"),
        alt: "Woman in sunglasses walking in a stone cotton trench coat",
      },
    ],
  },
  {
    slug: "belted-wool-wrap-coat",
    name: "Belted Wool Wrap Coat",
    categories: ["Outerwear", "Women"],
    price: 1890,
    colour: "Camel",
    description:
      "A collarless wrap coat in double-faced wool, finished entirely by hand so there are no visible seams. Tie it at the waist or wear it loose.",
    details: [
      "90% virgin wool, 10% cashmere, double faced",
      "Unlined",
      "Self-tie belt and side pockets",
      "Relaxed fit, midi length",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([1, 3, 2, 2, 0]),
    images: [
      {
        src: unsplash("1539533113208-f6df8cc8b543"),
        alt: "Woman in a belted camel wool wrap coat in front of a grey stone wall",
      },
    ],
  },
  {
    slug: "camel-wool-overcoat",
    name: "Camel Wool Overcoat",
    categories: ["Outerwear", "Men"],
    price: 2100,
    colour: "Camel",
    description:
      "A single-breasted overcoat with a notch lapel and dropped shoulder, cut long and easy from a brushed wool and cashmere blend. Built for the coldest months.",
    details: [
      "80% virgin wool, 20% cashmere",
      "Lining: 100% cupro",
      "Three-button fastening, flap pockets",
      "Oversized fit, size down for a closer fit",
      "Dry clean only",
      "Made in Italy",
    ],
    sizes: apparelSizes([0, 2, 3, 3, 2]),
    images: [
      {
        src: unsplash("1619603364937-8d7af41ef206"),
        alt: "Man in a long camel wool overcoat and roll-neck against a beige wall",
      },
    ],
  },
  {
    slug: "shearling-teddy-jacket",
    name: "Shearling Teddy Jacket",
    categories: ["Outerwear", "Women"],
    price: 1450,
    compareAtPrice: 1950,
    colour: "Ecru",
    description:
      "A cropped jacket in curly merino shearling with smooth leather trims and a wide spread collar. Warm as a coat, light as a knit.",
    details: [
      "100% merino shearling",
      "Leather trims",
      "Concealed zip fastening",
      "Relaxed fit, true to size",
      "Specialist leather clean only",
      "Made in Spain",
    ],
    sizes: apparelSizes([1, 0, 2, 1, 0]),
    images: [
      {
        src: unsplash("1620247405612-18f042ea68cf"),
        alt: "Woman in glasses wearing an ecru shearling teddy jacket in a car park",
      },
    ],
  },
  {
    slug: "cashmere-crew-neck-sweater",
    name: "Cashmere Crew-Neck Sweater",
    categories: ["Knitwear", "Women", "Men"],
    price: 650,
    colour: "Oatmeal",
    description:
      "A true wardrobe essential knitted from Grade A Mongolian cashmere. Fine ribbed trims and a relaxed body make it easy to wear on its own or layered.",
    details: [
      "100% Grade A cashmere",
      "12-gauge knit",
      "Ribbed collar, cuffs and hem",
      "Regular fit, true to size",
      "Hand wash cold or dry clean",
      "Made in Scotland",
    ],
    sizes: apparelSizes([3, 5, 6, 4, 3]),
    images: [
      {
        src: unsplash("1604573824419-289a9a10672c"),
        alt: "Person in an oatmeal cashmere crew-neck sweater in a golden field",
      },
    ],
  },
  {
    slug: "chunky-rib-wool-jumper",
    name: "Chunky Rib Wool Jumper",
    categories: ["Knitwear", "Women", "Men"],
    price: 480,
    colour: "Ecru",
    description:
      "A heavyweight rib jumper in undyed British wool with dropped shoulders and a boxy shape. It only gets softer with age.",
    details: [
      "100% British wool, undyed",
      "5-gauge rib knit",
      "Dropped shoulders",
      "Boxy fit, size down for a closer fit",
      "Hand wash cold",
      "Made in England",
    ],
    sizes: apparelSizes([2, 4, 4, 3, 2]),
    images: [
      {
        src: unsplash("1631541909061-71e349d1f203"),
        alt: "Ecru chunky ribbed wool jumper hanging on a hook",
      },
    ],
  },
  {
    slug: "organic-cotton-t-shirt",
    name: "Organic Cotton T-Shirt",
    categories: ["Ready-to-wear", "Men"],
    price: 120,
    colour: "White",
    description:
      "A heavyweight crew-neck tee in organic cotton jersey, garment dyed and pre-washed so it keeps its shape. The one to buy in multiples.",
    details: [
      "100% organic cotton jersey, 220 gsm",
      "Garment dyed and pre-washed",
      "Ribbed crew neck",
      "Regular fit, true to size",
      "Machine wash at 30°C",
      "Made in Portugal",
    ],
    sizes: apparelSizes([6, 9, 12, 8, 5]),
    images: [
      {
        src: unsplash("1521572163474-6864f9cf17ab"),
        alt: "Man wearing a white organic cotton crew-neck T-shirt",
      },
    ],
  },
  {
    slug: "straight-leg-selvedge-jeans",
    name: "Straight-Leg Selvedge Jeans",
    categories: ["Ready-to-wear", "Women", "Men"],
    price: 340,
    colour: "Mid wash",
    description:
      "A mid-rise straight leg in rigid Japanese selvedge denim, washed for a lived-in mid blue. Cut to sit easily at the waist and break just above the shoe.",
    details: [
      "100% cotton selvedge denim, 13.5 oz",
      "Button fly",
      "Five-pocket styling",
      "Straight fit, true to size",
      "Machine wash cold, inside out",
      "Made in Japan",
    ],
    sizes: apparelSizes([2, 5, 6, 4, 2]),
    images: [
      {
        src: unsplash("1754555009601-498e9873197e"),
        alt: "Mid-wash straight-leg jeans hanging on a wooden hanger",
      },
    ],
  },
  {
    slug: "leather-chelsea-boot",
    name: "Leather Chelsea Boot",
    categories: ["Shoes", "Men"],
    price: 780,
    colour: "Dark brown",
    description:
      "A sleek Chelsea boot in hand-burnished calf with tonal elastic gussets and a pull tab. Goodyear welted on a slim leather sole.",
    details: [
      "Calfskin upper, leather lining",
      "Elastic side gussets and pull tab",
      "Goodyear-welted leather sole",
      "Fits true to size",
      "Wipe clean and use shoe trees",
      "Made in Spain",
    ],
    sizes: shoeSizes(41, [1, 3, 3, 2, 1]),
    images: [
      {
        src: unsplash("1777987601423-f350ac29b3e9"),
        alt: "Pair of dark brown leather Chelsea boots on a slab of polished wood",
      },
    ],
  },
  {
    slug: "zip-ankle-boot",
    name: "Zip Ankle Boot",
    categories: ["Shoes", "Women"],
    price: 690,
    colour: "Black",
    description:
      "A clean ankle boot in polished calfskin with twin silver zips and a low stacked heel. Sturdy enough for every day, smart enough for the evening.",
    details: [
      "Calfskin upper, leather lining",
      "Twin side zips",
      "Heel height: 3.5 cm",
      "Rubber-tipped leather sole",
      "Fits true to size",
      "Made in Italy",
    ],
    sizes: shoeSizes(36, [2, 3, 4, 3, 2]),
    images: [
      {
        src: unsplash("1605732440685-d0654d81aa30"),
        alt: "Black leather ankle boot with two silver side zips",
      },
    ],
  },
  {
    slug: "pointed-leather-pump",
    name: "Pointed Leather Pump",
    categories: ["Shoes", "Women"],
    price: 650,
    colour: "Ivory",
    description:
      "A timeless pointed pump in grained calfskin on a slender stiletto heel. The low-cut vamp lengthens the leg.",
    details: [
      "Grained calfskin upper, leather lining",
      "Heel height: 9 cm",
      "Cushioned footbed",
      "Leather sole",
      "Fits true to size",
      "Made in Italy",
    ],
    sizes: shoeSizes(36, [1, 2, 0, 2, 1]),
    images: [
      {
        src: unsplash("1535043934128-cf0b28d52f95"),
        alt: "Pair of ivory pointed stiletto pumps on a dark surface",
      },
    ],
  },
  {
    slug: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    categories: ["Outerwear", "Men"],
    price: 1450,
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
    categories: ["Jewellery", "Women"],
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
    categories: ["Outerwear", "Women", "Men"],
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
    categories: ["Accessories", "Women", "Men"],
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
    categories: ["Bags", "Women"],
    price: 1280,
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
    categories: ["Ready-to-wear", "Women"],
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
    categories: ["Knitwear", "Women"],
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
    categories: ["Jewellery", "Women"],
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
