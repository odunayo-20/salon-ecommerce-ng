import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const isPublished = searchParams.get("isPublished");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (slug) {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      await prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
      return NextResponse.json({
        post: { ...post, tags: JSON.parse(post.tags || "[]"), viewCount: post.viewCount + 1 },
      });
    }

    const where: Record<string, unknown> = {};
    if (isPublished !== null && isPublished !== undefined) where.isPublished = isPublished === "true";
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map((p) => ({ ...p, tags: JSON.parse(p.tags || "[]") })),
      total, page, totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Blog fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, authorId, category, tags, isPublished, isFeatured } = body;

    if (!title || !slug || !content || !authorId) {
      return NextResponse.json({ error: "Title, slug, content, and author are required" }, { status: 400 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });

    const post = await prisma.blogPost.create({
      data: {
        title, slug, excerpt: excerpt || null, content,
        coverImage: coverImage || null, authorId,
        category: category || "General",
        tags: tags ? JSON.stringify(tags) : "[]",
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ post: { ...post, tags: JSON.parse(post.tags || "[]") } }, { status: 201 });
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
