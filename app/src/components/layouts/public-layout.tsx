import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

interface PublicLayoutProps {
  children: React.ReactNode;
  hero?: React.ReactNode;
  showFooter?: boolean;
}

export function PublicLayout({
  children,
  hero,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background w-full">
      <PublicHeader className="w-full" />
      {hero}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      {showFooter && <PublicFooter />}
    </div>
  );
}
