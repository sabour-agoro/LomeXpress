import type { Metadata } from "next";
// import { ChatInterface } from "@/features/chat/chat-interface";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat integre",
  description: "Discutez avec Lome Xpress, partagez votre panier et poursuivez si besoin sur WhatsApp.",
};

export default function ChatPage() {
  notFound();
  // return <ChatInterface />;
}
