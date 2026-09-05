import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false },
};

export default function ChatPage() {
  redirect("/contact");
}
