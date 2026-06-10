import Navigator from "@/components/organisms/Navigator";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-dvh flex-col overflow-hidden pt-16 pb-[calc(env(safe-area-inset-bottom)+4rem)] md:pb-0">
      <Navigator />
      <div className="relative z-10 min-h-0 flex-1">
        {children}
      </div>
    </main>
  );
}
