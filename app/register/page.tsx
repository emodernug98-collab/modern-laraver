import { Suspense } from "react";
import AuthRouteOverlayEntry from "@/components/AuthRouteOverlayEntry";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthRouteOverlayEntry mode="register" />
    </Suspense>
  );
}
