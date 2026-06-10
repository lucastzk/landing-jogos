import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Painel do site",
  robots: { index: false, follow: false },
};

// O painel lê/grava em runtime — nunca prerenderizar.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard />;
}
