import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getPublicTenant } from "@/lib/public";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getPublicTenant();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar brandName={tenant?.brandName} />
      <main className="flex-1">{children}</main>
      <Footer tenant={tenant} />
    </div>
  );
}
