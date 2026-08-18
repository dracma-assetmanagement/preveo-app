import type { Metadata } from "next";
import { hayAdmin } from "@/lib/auth";
import { Login } from "@/components/Login";
import { PanelAdmin } from "@/components/PanelAdmin";
import { JUEGOS } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preveo · Administración",
  robots: { index: false, follow: false },
};

export default async function Admin() {
  const autorizado = await hayAdmin();
  return autorizado ? <PanelAdmin juegos={JUEGOS} /> : <Login />;
}
