import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
      },
    });

    if (!customerProfile?.cart) {
      return NextResponse.json({ cart: null, items: [] });
    }

    return NextResponse.json({ cart: customerProfile.cart });
  } catch (error) {
    console.error("Fetch cart error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = cartItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity } = validation.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { customerProfileId: customerProfile.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerProfileId: customerProfile.id },
      });
    }

    // Add or update cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json({ cart: updatedCart }, { status: 201 });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
  }
}
