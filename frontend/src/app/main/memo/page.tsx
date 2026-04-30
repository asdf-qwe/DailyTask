"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/main/chat");
  }, [router]);
  return null;
}
