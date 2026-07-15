import { Suspense } from "react";
import AuthRouteOverlayEntry from "@/components/AuthRouteOverlayEntry";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthRouteOverlayEntry mode="login" />
    </Suspense>
  );
}
