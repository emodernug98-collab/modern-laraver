import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to the admin dashboard as the default dashboard route
  redirect("/admin");
}
