"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart, type CartItem } from "@/features/cart/cart-provider";

type Props = {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  label?: string;
} & Pick<ButtonProps, "size" | "variant" | "className">;

export function AddToCartButton({ product, quantity = 1, label, size, variant, className }: Props) {
  const { addItem } = useCart();
  const isOutOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={isOutOfStock}
      onClick={() => {
        addItem(product, quantity);
        toast.success("Ajouté au panier", {
          description: product.name,
        });
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {label ?? "Ajouter au panier"}
    </Button>
  );
}
