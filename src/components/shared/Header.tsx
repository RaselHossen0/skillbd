"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const isAuthRoute = pathname.includes("/auth");

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="SkillBridge Logo" width={40} height={40} className="h-8 w-8" />
          <span className="text-xl font-bold">SkillBridge BD</span>
        </Link>
        
        {!isAuthRoute && (
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 