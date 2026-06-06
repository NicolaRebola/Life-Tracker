import Navigator from "@/components/organisms/Navigator";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-dvh overflow-hidden flex flex-col">
      <Navigator></Navigator>
      <div className="min-h-0 flex-1">
        {children}
      </div>
    </main>
  );
}