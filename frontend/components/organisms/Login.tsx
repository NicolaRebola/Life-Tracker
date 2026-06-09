"use client";

import { Google } from "@tailgrids/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../tailgrids/core/card";
import { SocialButton } from "../tailgrids/core/social-button";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const validateExistingSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { authenticated?: boolean };

        if (data.authenticated) {
          router.replace("/home");
          return;
        }
      } catch {
        // The user can still sign in manually if the session check fails.
      }

      if (isMounted) {
        setIsCheckingSession(false);
      }
    };

    void validateExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();
      const res = await fetch("/api/auth/google/start", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setErrorMessage("No pudimos iniciar sesión. Intentalo nuevamente.");
        return;
      }

      router.replace("/home");
    } catch {
      setErrorMessage("El inicio de sesión fue cancelado o falló. Probá otra vez.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const isLoginDisabled = isCheckingSession || isSigningIn;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10 text-title-50 sm:px-6 lg:px-8">
      <Card className="relative z-10 mx-auto w-full max-w-2xl gap-0 overflow-hidden border border-[#fff8f0]/80 bg-[#fff8f0]/85 p-0 shadow-[0_28px_80px_rgba(126,78,57,0.18)] backdrop-blur-xl">
        <CardHeader className="px-6 pt-8 text-center sm:px-10 sm:pt-10">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#a86449] text-2xl font-bold text-[#fff8f0] shadow-lg shadow-[#a86449]/25">
            LT
          </div>
          <CardTitle className="text-4xl font-black tracking-tight text-title-50 sm:text-5xl">
            Life Tracker
          </CardTitle>
          <CardDescription className="mx-auto mt-3 max-w-md text-base font-medium text-text-50 sm:text-lg">
            Ordená tus días, entendé tus hábitos y convertí tu rutina en progreso real.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pt-7 sm:px-10">
          <div className="rounded-3xl border border-[#ead3c2] bg-[#fff8f0]/70 p-5 shadow-sm sm:p-6">
            <p className="text-center text-sm leading-6 text-text-50 sm:text-base">
              Registrá eventos personales, organizá actividades importantes, agregá contexto con etiquetas y comentarios, e invitá a otras personas cuando tu planificación lo necesite.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-text-50 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f0d7c5] px-4 py-3">
                <span className="block font-semibold text-[#8d4f38]">Eventos</span>
                Capturá lo importante.
              </div>
              <div className="rounded-2xl bg-[#dfe5cf] px-4 py-3">
                <span className="block font-semibold text-[#667449]">Hábitos</span>
                Detectá patrones.
              </div>
              <div className="rounded-2xl bg-[#ead7b8] px-4 py-3">
                <span className="block font-semibold text-[#946b33]">Progreso</span>
                Mirá tu evolución.
              </div>
            </div>

            {errorMessage ? (
              <p className="mt-5 rounded-2xl border border-error-500/20 bg-error-500/10 px-4 py-3 text-center text-sm font-medium text-error-500">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-6 pb-8 pt-6 sm:px-10 sm:pb-10">
          <SocialButton
            className="max-w-none border-[#d9bba4] bg-[#fff8f0] py-3.5 text-base font-semibold text-[#5f3d31] shadow-sm hover:bg-[#f0d7c5] disabled:opacity-70"
            disabled={isLoginDisabled}
            onClick={handleLogin}
          >
            <Google />
            {isCheckingSession
              ? "Validando sesión..."
              : isSigningIn
                ? "Conectando..."
                : "Continuar con Google"}
          </SocialButton>
          <span className="text-center text-xs text-text-100">
            Acceso seguro con Google. Tu sesión se guarda en una cookie protegida.
          </span>
        </CardFooter>
      </Card>
    </main>
  );
}
