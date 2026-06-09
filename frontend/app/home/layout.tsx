import AppBackground from "@/components/atoms/AppBackground";
import Navigator from "@/components/organisms/Navigator";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-dvh overflow-hidden flex flex-col">
      <Navigator></Navigator>
      <AppBackground />
      <div className="min-h-0 flex-1 z-10">
        {children}
      </div>
    </main>
  );
}