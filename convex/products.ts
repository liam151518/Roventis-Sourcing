import { query, mutation } from "./_generated/server";
import { v, Id } from "convex/values";

// Get all products (for both admin and user pages - show everything)
export const getAllProducts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .order("desc")
      .collect();
  },
});

// Get all products including inactive (for admin management)
export const getAllProductsAdmin = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .order("desc")
      .collect();
  },
});

// Get product by ID
export const getProductById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id as Id<"products">);
  },
});

// Create a new product
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    colors: v.array(v.object({
      name: v.string(),
      imageUrl: v.string(),
    })),
    pricing: v.optional(v.object({
      price50: v.number(),
      price100: v.number(),
      price500: v.number(),
      confirmed: v.boolean(),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      category: args.category || "general",
      colors: args.colors || [],
      pricing: args.pricing,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a product
export const updateProduct = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    colors: v.optional(v.array(v.object({
      name: v.string(),
      imageUrl: v.string(),
    }))),
    pricing: v.optional(v.object({
      price50: v.number(),
      price100: v.number(),
      price500: v.number(),
      confirmed: v.boolean(),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id as Id<"products">, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete (soft delete) a product
export const deleteProduct = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id as Id<"products">, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Seed initial products from JSON (for initial setup)
export const seedProducts = mutation({
  handler: async (ctx) => {
    // Check if products already exist
    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) {
      return { message: "Products already exist", count: 0 };
    }

    // Sample products to seed
    const sampleProducts = [
      {
        name: "100% Cotton Tshirt",
        description: "High-quality cotton t-shirt with custom branding options",
        category: "apparel",
        colors: [
          { name: "Black", imageUrl: "/product-images/100-Cotton-Tshirt-Black.jpeg" },
          { name: "Stone", imageUrl: "/product-images/100-Cotton-Tshirt-Stone.jpeg" },
          { name: "Khaki", imageUrl: "/product-images/100-Cotton-Tshirt-Khaki.jpeg" },
        ],
        pricing: { price50: 284.90, price100: 240.50, price500: 169.28, confirmed: true },
      },
      {
        name: "Forecast Beanie",
        description: "Warm beanie for outdoor activities",
        category: "apparel",
        colors: [
          { name: "Black", imageUrl: "/product-images/BeanieBlack.jpeg" },
          { name: "Blaze Orange", imageUrl: "/product-images/BeanieBlaze-Orange.jpeg" },
          { name: "Olive", imageUrl: "/product-images/BeanieOlive.png" },
        ],
        pricing: { price50: 140.60, price100: 111.00, price500: 85.10, confirmed: true },
      },
      {
        name: "Fishing Shirt",
        description: "UV-protective fishing shirt",
        category: "apparel",
        colors: [
          { name: "Black", imageUrl: "/product-images/Fishing-Shirt-Black.jpeg" },
          { name: "Gunmetal", imageUrl: "/product-images/Fishing-Shirt-Gunmetal.jpeg" },
          { name: "Major Brown", imageUrl: "/product-images/Fishing-Shirt-Major-Brown.jpeg" },
          { name: "Navy Blue", imageUrl: "/product-images/Fishing-Shirt-Navy-Blue.jpeg" },
        ],
        pricing: { price50: 569.80, price100: 444.00, price500: 339.48, confirmed: true },
      },
      {
        name: "Forge Heavyweight Hoodie",
        description: "Heavyweight hoodie for cold weather",
        category: "apparel",
        colors: [
          { name: "Black", imageUrl: "/product-images/Hoodie-Black.jpeg" },
          { name: "Brown", imageUrl: "/product-images/Hoodie-Brown.jpeg" },
          { name: "Olive Green", imageUrl: "/product-images/Hoodie-Olive-Green.jpeg" },
        ],
        pricing: { price50: 569.80, price100: 492.10, price500: 398.68, confirmed: true },
      },
      {
        name: "UV Fishing Hoodie",
        description: "UV-protective fishing hoodie with sublimation options",
        category: "apparel",
        colors: [
          { name: "Black", imageUrl: "/product-images/UV-Fishing-Hoodie-Black.jpeg" },
          { name: "Stone", imageUrl: "/product-images/UV-Fishing-Hoodie-Stone.jpeg" },
          { name: "Sublimation", imageUrl: "/product-images/UV-Fishing-Hoodie-Sublimation.jpeg" },
          { name: "White", imageUrl: "/product-images/UV-Fishing-Hoodie-White.jpeg" },
        ],
        pricing: { price50: 773.30, price100: 684.50, price500: 593.85, confirmed: true },
      },
    ];

    const now = Date.now();
    let count = 0;
    
    for (const product of sampleProducts) {
      await ctx.db.insert("products", {
        ...product,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    return { message: "Products seeded successfully", count };
  },
});
