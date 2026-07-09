import type { Metadata } from "next";
import { CartView } from "@/features/cart/cart-view";

export const metadata: Metadata = {
  title: "Panier",
  description: "Validez votre commande LomExpress et payez à la livraison ou via WhatsApp.",
};

export default function CartPage() {
  return <CartView />;
}
