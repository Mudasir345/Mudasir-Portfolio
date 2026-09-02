import { isAdminAuthenticated } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return children;
}
