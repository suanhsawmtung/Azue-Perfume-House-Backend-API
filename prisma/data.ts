import { Concentration, Gender } from "@prisma/client";

// const getSeedImagePath = (path: string) =>
//   process.env.APP_ENV === "development" ? path.split("/").pop() ?? path : path;

const getSeedImagePath = (path: string) =>
  process.env.APP_ENV === "development" ? path : path;

export const brands = [
  { name: "Versace", slug: "versace" },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier" },
  { name: "Tom Ford", slug: "tom-ford" },
  { name: "Yves Saint Laurent", slug: "ysl" },
  { name: "Lancome", slug: "lancome" },
  { name: "Carolina Herrera", slug: "carolina-herrera" },
  { name: "Dior", slug: "dior" },
  { name: "Giorgio Armani", slug: "giorgio-armani" },
  { name: "Calvin Klein", slug: "calvin-klein" },
  { name: "Maison Francis Kurkdjian", slug: "maison-francis-kurkdjian" },
  { name: "Le Labo", slug: "le-labo" },
  { name: "Chanel", slug: "chanel" },
  { name: "Roja Parfums", slug: "roja-parfums" },
];

export const categories = [
  { name: "Guide", slug: "guide" },
  { name: "Trends", slug: "trends" },
  { name: "Tips", slug: "tips" },
  { name: "History", slug: "history" },
];

const productSeedData = [
  {
    name: "Miss Dior",
    brandSlug: "dior",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "A colorful floral 'millefiori' scent with Centifolia rose, peony, and iris notes.",
    releasedYear: 2021,
    variants: [
      {
        size: 100,
        price: 680000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/miss-dior-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "J'adore",
    brandSlug: "dior",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "An iconic, opulent floral bouquet of Ylang-Ylang, Damascus Rose, and Jasmine.",
    releasedYear: 1999,
    variants: [
      {
        size: 100,
        price: 650000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/jadore-100.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Libre",
    brandSlug: "ysl",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "The fragrance of freedom, blending Moroccan orange blossom with French lavender.",
    releasedYear: 2019,
    variants: [
      {
        size: 90,
        price: 620000,
        discount: 0,
        stock: 20,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/libre-90.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Black Opium",
    brandSlug: "ysl",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "A captivating and energizing scent with notes of black coffee, white florals, and vanilla.",
    releasedYear: 2014,
    variants: [
      {
        size: 90,
        price: 580000,
        discount: 0,
        stock: 18,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/black-opium-90.jpg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },

  // 5 Pure Male Perfumes
  {
    name: "Y Eau de Parfum",
    brandSlug: "ysl",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description:
      "A bold and sophisticated fragrance with fresh bergamot, ginger, and sage.",
    releasedYear: 2018,
    variants: [
      {
        size: 100,
        price: 520000,
        discount: 0,
        stock: 25,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/y-eau-de-parfum-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Acqua di Giò Profondo",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description:
      "A deep, marine intensity with notes of green mandarin and mineral essences.",
    releasedYear: 2020,
    variants: [
      {
        size: 100,
        price: 480000,
        discount: 0,
        stock: 10,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/acqua-di-gi-profondo-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Stronger With You",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "A warm, spicy fragrance with notes of cardamom, pink pepper, and smoky vanilla.",
    releasedYear: 2017,
    variants: [
      {
        size: 100,
        price: 430000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/stronger-with-you-100.jpg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "CK One",
    brandSlug: "calvin-klein",
    concentration: Concentration.EDT,
    gender: Gender.UNISEX, // Although requested in male section, CK One is historically the iconic unisex
    description:
      "The original clean and fresh scent that defines shared fragrance with green tea and citrus.",
    releasedYear: 1994,
    variants: [
      {
        size: 100,
        price: 220000,
        discount: 0,
        stock: 30,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/ck-one-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "L'Homme",
    brandSlug: "ysl",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "A woody floral musk fragrance with ginger, bergamot, and cedar.",
    releasedYear: 2006,
    variants: [
      {
        size: 100,
        price: 410000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/lhomme-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },

  // 2 Unisex Perfumes
  {
    name: "Baccarat Rouge 540",
    brandSlug: "maison-francis-kurkdjian",
    concentration: Concentration.EDP,
    gender: Gender.UNISEX,
    description:
      "A highly concentrated, sophisticated scent with woody, amber, and jasmine accords.",
    releasedYear: 2015,
    variants: [
      {
        size: 70,
        price: 1250000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/baccarat-rouge-540-70.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Santal 33",
    brandSlug: "le-labo",
    concentration: Concentration.EDP,
    gender: Gender.UNISEX,
    description:
      "A woody aromatic fragrance that evokes the spirit of the American West with sandalwood and leather.",
    releasedYear: 2011,
    variants: [
      {
        size: 100,
        price: 1100000,
        discount: 0,
        stock: 7,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/santal-33-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Acqua di Giò Pour Homme",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "A classic aquatic fragrance that opens with a splash of fresh, calabrian bergamot, neroli and green tangerine.",
    releasedYear: 1996,
    variants: [
      {
        size: 100,
        price: 450000,
        discount: 0,
        stock: 10,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/acqua-di-gi-pour-homme-100.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Chanel N°5",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "The essence of femininity. A powdery floral bouquet housed in an iconic bottle with a minimalist design.",
    releasedYear: 1921,
    variants: [
      {
        size: 100,
        price: 650000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/chanel-n5-100.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Coco Chanel",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "A spicy, floral fragrance that reveals the contrasting notes of the ambery spirit. Intense and baroque.",
    releasedYear: 1984,
    variants: [
      {
        size: 100,
        price: 600000,
        discount: 0,
        stock: 8,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/coco-chanel-100.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Coco Noir",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "The magnetic and uncompromising modern ambery fragrance with luminous notes of May Rose and Geranium leaf.",
    releasedYear: 2012,
    variants: [
      {
        size: 100,
        price: 680000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/coco-noir-100.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Coco Mademoiselle",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "A vibrant, voluptuous ambery-fresh fragrance. Sparks of orange lead to a clear heart of May Rose and Jasmine.",
    releasedYear: 2001,
    variants: [
      {
        size: 100,
        price: 650000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/coco-mademoiselle-100.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Apex Eau Intense",
    brandSlug: "roja-parfums",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description:
      "A fresh and powerful chypré scent with vibrant citrus, pineapple, and deep woody notes of fir balsam and sandalwood.",
    releasedYear: 2023,
    variants: [
      {
        size: 100,
        price: 1350000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/apex-eau-intense-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Elysium Pour Homme",
    brandSlug: "roja-parfums",
    concentration: Concentration.PARFUM,
    gender: Gender.MALE,
    description:
      "An ultra-fresh citrus blend of lemon, bergamot, and lime, anchored by rich ambergris and leather.",
    releasedYear: 2017,
    variants: [
      {
        size: 100,
        price: 1150000,
        discount: 0,
        stock: 8,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/elysium-pour-homme-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Versace Eros Energy",
    brandSlug: "versace",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description:
      "A high-energy flanker of the Eros line, featuring a burst of citrus notes like blood orange and lime with a woody base.",
    releasedYear: 2024,
    variants: [
      {
        size: 100,
        price: 520000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/versace-eros-energy-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Acqua di Giò Eau de Parfum",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description:
      "A long-lasting masculine fragrance where the infinite spirit of the sea meets a powerful green mandarin opening. Clary sage and lavender provide a sophisticated aromatic heart, while sustainably sourced patchouli leaves a warm, mineral trail on the skin.",
    releasedYear: 2024,
    variants: [
      {
        size: 100,
        price: 550000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/acqua-di-gi-eau-de-parfum-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Acqua di Giò Profondo Eau de Parfum",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description:
      "Plunge into the deep blue with this intense marine interpretation of the original classic. It opens with salty aquatic notes and bergamot, evolving into an aromatic blend of rosemary and cypress, eventually settling into a profound base of mineral amber and musk.",
    releasedYear: 2020,
    variants: [
      {
        size: 100,
        price: 480000,
        discount: 0,
        stock: 10,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/acqua-di-gi-profondo-eau-de-parfum-100.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Acqua di Giò Profondo Parfum",
    brandSlug: "giorgio-armani",
    concentration: Concentration.PARFUM,
    gender: Gender.MALE,
    description:
      "An even more mysterious and addictive intensity that captures the absolute depth of the ocean. This parfum concentration amplifies the signature marine notes with a unique balsamic cistus and a mineral salty accord, creating a magnetic and enduring scent profile.",
    releasedYear: 2024,
    variants: [
      {
        size: 100,
        price: 680000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/acqua-di-gi-profondo-parfum-100.jpg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Versace Bright Crystal",
    brandSlug: "versace",
    concentration: Concentration.EDT,
    gender: Gender.FEMALE,
    description:
      "A fresh, floral-fruity fragrance with notes of yuzu, pomegranate, peony, and soft musk.",
    releasedYear: 2006,
    variants: [
      {
        size: 10,
        price: 150000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-10-1.jpg",
            isPrimary: true,
            order: 0,
          },
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-10-2.webp",
            isPrimary: false,
            order: 1,
          },
        ],
      },
      {
        size: 90,
        price: 480000,
        discount: 0,
        stock: 20,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-90-1.jpg",
            isPrimary: true,
            order: 0,
          },
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-90-2.png",
            isPrimary: false,
            order: 1,
          },
        ],
      },
    ],
  },
  {
    name: "Versace Bright Crystal Absolu",
    brandSlug: "versace",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description:
      "A more intense and long-lasting version of Bright Crystal with richer fruity and floral notes.",
    releasedYear: 2013,
    variants: [
      {
        size: 30,
        price: 340000,
        discount: 0,
        stock: 20,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-absolu-30-1.webp",
            isPrimary: true,
            order: 0,
          },
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-absolu-30-2.png",
            isPrimary: false,
            order: 1,
          },
        ],
      },
      {
        size: 90,
        price: 720000,
        discount: 0,
        stock: 8,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/versace-bright-crystal-absolu-90.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Le Male",
    brandSlug: "jean-paul-gaultier",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "Iconic lavender and mint blended with warm vanilla and woods.",
    releasedYear: 2015,
    variants: [
      {
        size: 40,
        price: 320000,
        discount: 0,
        stock: 40,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/le-male-40-1.webp",
            isPrimary: true,
            order: 0,
          },
          {
            path: "https://images.azueperfumehouse.store/product/le-male-40-2.avif",
            isPrimary: false,
            order: 1,
          },
        ],
      },
      {
        size: 75,
        price: 480000,
        discount: 5,
        stock: 9,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/le-male-75.webp",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
  {
    name: "Lost Cherry",
    brandSlug: "tom-ford",
    concentration: Concentration.EDP,
    gender: Gender.UNISEX,
    description:
      "Bold cherry and almond balanced with rich floral and amber accords.",
    releasedYear: 2020,
    variants: [
      {
        size: 50,
        price: 1400000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/lost-cherry-50.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
      {
        size: 30,
        price: 880000,
        discount: 0,
        stock: 50,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/lost-cherry-30-1.jpg",
            isPrimary: false,
            order: 0,
          },
          {
            path: "https://images.azueperfumehouse.store/product/lost-cherry-30-2.jpg",
            isPrimary: true,
            order: 1,
          },
        ],
      },
    ],
  },
  {
    name: "Versace Eros",
    brandSlug: "versace",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "A fresh, woody fragrance with vibrant citrus and warm amber notes.",
    releasedYear: 2019,
    variants: [
      {
        size: 50,
        price: 450000,
        discount: 0,
        stock: 25,
        images: [
          {
            path: "https://images.azueperfumehouse.store/product/versace-eros-50-1.avif",
            isPrimary: false,
            order: 1,
          },
          {
            path: "https://images.azueperfumehouse.store/product/versace-eros-50-2.avif",
            isPrimary: false,
            order: 2,
          },
          {
            path: "https://images.azueperfumehouse.store/product/versace-eros-50-3.avif",
            isPrimary: false,
            order: 3,
          },
          // {
          //   path: "https://cdn.paris-avenues.com/image/cache/catalog/Product2/8011003809202-Versace-Eros-EDT-50-Ml--1000x1000.jpg",
          //   isPrimary: true,
          //   order: 0
          // },
          {
            path: "https://images.azueperfumehouse.store/product/versace-eros-50-4.jpeg",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ],
  },
];

export const products = productSeedData.map((product) => ({
  ...product,
  variants: product.variants.map((variant) => ({
    ...variant,
    images: variant.images.map((image) => ({
      ...image,
      path: getSeedImagePath(image.path),
    })),
  })),
}));

const postSeedData = [
  {
    title: "The Art of Layering Fragrances: A Complete Guide",
    excerpt:
      "Discover how to combine multiple perfumes to create your own unique signature scent. Learn the techniques used by professional perfumers.",
    image:
      "https://images.azueperfumehouse.store/post/the-art-of-layering-fragrances-a-complete-guide.jpeg",
    categorySlug: "guide",
    content:
      "Fragrance layering is an art form that allows you to create a personalized scent that's uniquely yours. By combining different perfumes strategically, you can achieve a complexity and depth that single fragrances often can't provide.<br/><br/>" +
      "<h2>Understanding Fragrance Families</h2><br/>" +
      "Before you start layering, it's essential to understand the basic fragrance families:<br/>" +
      "<ul>" +
      "<li><strong>Citrus</strong>: Fresh, bright, and energizing</li>" +
      "<li><strong>Floral</strong>: Romantic, feminine, and elegant</li>" +
      "<li><strong>Oriental</strong>: Warm, sensual, and exotic</li>" +
      "<li><strong>Woody</strong>: Earthy, grounding, and sophisticated</li>" +
      "<li><strong>Fresh</strong>: Clean, aquatic, and invigorating</li>" +
      "</ul><br/>" +
      "<h2>Basic Layering Techniques</h2><br/>" +
      "<h3>1. Start with a Base</h3>" +
      "Begin with your heaviest, most long-lasting fragrance. This is typically an oriental or woody scent that will anchor your combination.<br/><br/>" +
      "<h3>2. Add Complementary Notes</h3>" +
      "Layer a lighter fragrance on top that shares at least one note with your base. This creates harmony between the scents.<br/><br/>" +
      "<h3>3. Apply Strategically</h3>" +
      "Apply different fragrances to different pulse points. Your base scent goes on your chest and wrists, while lighter scents can go behind your ears or in the crooks of your elbows.<br/><br/>" +
      "<h2>Tips for Success</h2><br/>" +
      "<ul>" +
      "<li>Start with just two fragrances before attempting more complex combinations</li>" +
      "<li>Test your combinations at home before wearing them out</li>" +
      "<li>Keep notes of successful combinations</li>" +
      "<li>Don't be afraid to experiment</li>" +
      "</ul><br/>" +
      "The beauty of layering is that there are no strict rules. Trust your nose and have fun creating something uniquely you.",
  },
  {
    title: "Top 10 Perfume Trends for 2024",
    excerpt:
      "From sustainable ingredients to nostalgic scents, explore the fragrance trends that are defining this year's perfume landscape.",
    image:
      "https://images.azueperfumehouse.store/post/top-10-perfume-trends-for-2024.jpeg",
    categorySlug: "trends",
    content:
      "The perfume industry is constantly evolving, and 2024 brings exciting new trends that reflect our changing world and values.<br/><br/>" +
      "<h2>1. Sustainable Luxury</h2>" +
      "Eco-conscious consumers are driving demand for perfumes made with sustainably sourced ingredients and recyclable packaging.<br/><br/>" +
      "<h2>2. Gender-Fluid Fragrances</h2>" +
      "The lines between masculine and feminine scents continue to blur, with more brands offering truly unisex options.<br/><br/>" +
      "<h2>3. Nostalgic Scents</h2>" +
      "Comforting, familiar scents that evoke memories are making a strong comeback, from fresh laundry to grandmother's kitchen.<br/><br/>" +
      "<h2>4. Wellness Fragrances</h2>" +
      "Perfumes designed to influence mood and promote well-being are increasingly popular.<br/><br/>" +
      "<h2>5. Rare Ingredients</h2>" +
      "Consumers are seeking out fragrances featuring unusual, hard-to-find ingredients for uniqueness.",
  },
  {
    title: "How to Make Your Perfume Last All Day",
    excerpt:
      "Expert tips and tricks to maximize the longevity of your favorite fragrances, from application techniques to storage solutions.",
    image:
      "https://images.azueperfumehouse.store/post/how-to-make-your-perfume-last-all-day.jpeg",
    categorySlug: "tips",
    content:
      "Nothing is more frustrating than spraying on your favorite perfume only to have it fade within a few hours. Here's how to make your scent last from morning to night.<br/><br/>" +
      "<h2>Prep Your Skin</h2>" +
      "Moisturized skin holds fragrance better than dry skin. Apply an unscented lotion or body oil before your perfume.<br/><br/>" +
      "<h2>Target Pulse Points</h2>" +
      "Apply perfume to areas where blood vessels are close to the skin:<br/>" +
      "<ul>" +
      "<li>Wrists</li>" +
      "<li>Behind ears</li>" +
      "<li>Base of throat</li>" +
      "<li>Inside elbows</li>" +
      "<li>Behind knees</li>" +
      "</ul><br/>" +
      "<h2>Don't Rub</h2>" +
      "Rubbing your wrists together after applying perfume breaks down the molecules and causes the scent to fade faster.<br/><br/>" +
      "<h2>Layer Your Products</h2>" +
      "Use matching body wash, lotion, and perfume from the same line to build intensity.<br/><br/>" +
      "<h2>Store Properly</h2>" +
      "Keep your perfumes away from heat, light, and humidity. A cool, dark drawer is ideal.",
  },
  {
    title: "The History of Oud: From Ancient Arabia to Modern Perfumery",
    excerpt:
      "Explore the fascinating journey of oud, one of the world's most precious and sought-after fragrance ingredients.",
    image:
      "https://images.azueperfumehouse.store/post/the-history-of-oud-from-ancient-arabia-to-modern-perfumery.jpeg",
    categorySlug: "history",
    content:
      "Oud, also known as agarwood, has been treasured for thousands of years. This precious ingredient has a rich history that spans continents and cultures.<br/><br/>" +
      "<h2>Origins</h2>" +
      "Oud is derived from the Aquilaria tree, native to Southeast Asia. When the tree becomes infected with a specific type of mold, it produces a dark, fragrant resin as a defense mechanism.<br/><br/>" +
      "<h2>Cultural Significance</h2>" +
      "In the Middle East, oud has been burned as incense for millennia and is deeply woven into cultural and religious practices. It symbolizes luxury, hospitality, and spirituality.<br/><br/>" +
      "<h2>Modern Renaissance</h2>" +
      "While oud has always been popular in the Middle East, it only entered Western perfumery in the early 2000s. Today, it's one of the most sought-after ingredients in luxury fragrances.",
  },
  {
    title: "Perfume Gifting Guide: Finding the Perfect Scent",
    excerpt:
      "Choosing a perfume for someone else can be daunting. Here's your comprehensive guide to selecting a fragrance gift they'll love.",
    image:
      "https://images.azueperfumehouse.store/post/perfume-gifting-guide-finding-the-perfect-scent.jpeg",
    categorySlug: "guide",
    content:
      "Gifting perfume can feel risky, but with the right approach, you can choose a fragrance that will delight your recipient.<br/><br/>" +
      "<h2>Know Their Preferences</h2>" +
      "Pay attention to:<br/>" +
      "<ul>" +
      "<li>Scents they already wear</li>" +
      "<li>Their personality and lifestyle</li>" +
      "<li>Seasons they prefer certain scents</li>" +
      "</ul><br/>" +
      "<h2>Safe Choices</h2>" +
      "When in doubt, consider these universally appealing options:<br/>" +
      "<ul>" +
      "<li>Light florals for spring/summer</li>" +
      "<li>Warm vanillas for fall/winter</li>" +
      "<li>Fresh citrus for active lifestyles</li>" +
      "</ul><br/>" +
      "<h2>Presentation Matters</h2>" +
      "A beautifully packaged perfume with a handwritten note shows extra thought and care.",
  },
];

export const posts = postSeedData.map((post) => ({
  ...post,
  image: getSeedImagePath(post.image),
}));
