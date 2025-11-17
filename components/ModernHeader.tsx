"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Menu, X, CheckCircle2, RefreshCw, LogOut, LayoutDashboard, Users, Swords } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ModernHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const isYahooConnected = useQuery(api.yahoo.isYahooConnected);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/free-agents", label: "Free Agents", icon: Users },
    { href: "/opponents", label: "Opponents", icon: Swords },
  ];

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/dashboard" className="mr-6 flex items-center">
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image
              src="/pbc.png"
              alt="Pyongyang Bicycle Club"
              width={48}
              height={48}
              className="rounded-full object-cover"
              priority
            />
          </div>
        </Link>

        {/* Yahoo Status & Refresh */}
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <>
              {isYahooConnected && (
                <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Yahoo</span>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="h-9 w-9"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Hamburger Menu */}
          {isAuthenticated && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4">
                  {/* Logo in drawer */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src="/pbc.png"
                        alt="Pyongyang Bicycle Club"
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Pyongyang Bicycle Club</h2>
                      <p className="text-sm text-muted-foreground">Fantasy Hockey</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Yahoo Status */}
                  {isYahooConnected && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Yahoo Connected</span>
                      </div>
                    </div>
                  )}

                  {/* Sign Out */}
                  <div className="pt-4 border-t mt-auto">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}

