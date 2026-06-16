"use client";

import { Avatar } from "../tailgrids/core/avatar";
import { Button } from "../tailgrids/core/button";
import { useRouter, usePathname } from "next/navigation";
  
const navItems = [
  { label: "Eventos", path: "/home/events" },
  { label: "Reflexiones", path: "/home/thoughts" },
  { label: "Grupos", path: "/home/groups" },
];

export default function Navigator() {
  const pathname = usePathname();
  const router = useRouter();
  const renderButtons = (isMobile = false) =>
    navItems.map((item) => {
      const isActive = pathname === item.path;
      const classes = `${isActive ? "bg-[#9f5f45] text-[#fff8f0] hover:bg-[#8d4f38] hover:text-[#fff8f0]" : "text-[#6f5145]"} ${isMobile ? "flex-1 text-xs" : ""}`;
      return (
        <Button
          key={item.path}
          appearance="fill"
          variant={isActive ? "primary" : "ghost"}
          className={classes}
          onClick={() => { router.replace(item.path)}}
        >
          {item.label}
        </Button>
      );
    });

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 hidden h-16 w-full items-center justify-between border-b border-[#ead3c2]/70 bg-[#fff8f0]/70 px-5 backdrop-blur-xl md:flex">
        <h1 className="font-semibold text-[#5f3d31]">Life Tracker</h1>
        <div className="flex flex-row gap-2">
          {renderButtons(false)}
        </div>
        <div>
          <Avatar fallback="N"></Avatar>
        </div>
      </header>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#ead3c2]/70 bg-[#fff8f0]/70 px-5 backdrop-blur-xl md:hidden">
        <h1 className="font-semibold text-[#5f3d31]">Life Tracker</h1>
        <div>
          <Avatar fallback="N"></Avatar>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ead3c2]/70 bg-[#fff8f0]/75 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          {renderButtons(true)}
        </div>
      </nav>
    </>
  )
}