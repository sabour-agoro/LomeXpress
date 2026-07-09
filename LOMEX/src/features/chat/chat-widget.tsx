"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWidget() {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button asChild className="rounded-full px-5 shadow-soft">
        <Link href="/chat">
          <MessageCircle className="h-4 w-4" />
          Chat integre
        </Link>
      </Button>
    </div>
  );
}
