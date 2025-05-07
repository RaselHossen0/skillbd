"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/shared/Header";
import { useAuth } from "@/components/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { user, login, loading, error } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoginError(null);
      setIsEmailUnconfirmed(false);
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      console.error("Login page error:", error);

      // Check if this is an email confirmation issue
      if (error.message === "Email not confirmed") {
        setIsEmailUnconfirmed(true);
        setUnconfirmedEmail(data.email);
        setLoginError(
          "Please check your email for a confirmation link before logging in."
        );
      } else {
        setLoginError(error.message || "Failed to login");
      }
    }
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;

    try {
      // You'll need to create this endpoint in your API
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: unconfirmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || "Failed to resend confirmation email");
        return;
      }

      setLoginError("Confirmation email sent! Please check your inbox.");
    } catch (error: any) {
      setLoginError(error.message || "Failed to resend confirmation email");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.svg"
                alt="IndustryHuntBD Logo"
                width={64}
                height={64}
                className="h-16 w-16 "
              />
            </div>
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {(loginError || error) && (
                <Alert variant={isEmailUnconfirmed ? "default" : "destructive"}>
                  <AlertDescription>
                    {loginError || error}
                    {isEmailUnconfirmed && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendConfirmation}
                          type="button"
                        >
                          Resend confirmation email
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full" type="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="21.17" x2="12" y1="8" y2="8"></line>
                    <line x1="3.95" x2="8.54" y1="6.06" y2="14"></line>
                    <line x1="10.88" x2="15.46" y1="21.94" y2="14"></line>
                  </svg>
                  Google
                </Button>
              </div>
            </CardContent>
          </form>
          <CardFooter>
            <div className="text-center text-sm text-muted-foreground w-full">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
