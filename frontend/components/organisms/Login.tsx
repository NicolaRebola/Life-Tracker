"use client";

import { Google } from "@tailgrids/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../tailgrids/core/card";
import { SocialButton } from "../tailgrids/core/social-button";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/firebase";

export default function Login() {

  const handleLogin = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();
    const res = await fetch("/api/auth/google/start", {
      method: "POST",
      body: JSON.stringify({ idToken}),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return;
    window.location.href = '/home';
  }

  return (
    <Card className="w-87.5 h-80-5 m-auto bg-white p-6">
      <CardHeader className="mb-5">
        <CardTitle className="text-center text-2xl font-bold text-black">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center text-sm text-gray-600">Comienza a usar Life Tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <SocialButton className="w-full bg-white text-black" onClick={handleLogin}>
          <Google />
          Continuar con Google
        </SocialButton>
      </CardContent>
      <CardFooter className="flex justify-between mt-5">
        <span className="w-full text-center text-sm text-gray-600">Bienvenido a tu proceso transformador</span>
      </CardFooter>
    </Card>
  );
}