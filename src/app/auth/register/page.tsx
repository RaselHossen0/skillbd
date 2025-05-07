"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/shared/Header";
import { useAuth } from "@/components/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define roles here instead of importing from @/types to avoid TypeScript issues
type RegisterRole = "STUDENT" | "MENTOR" | "EMPLOYER";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["STUDENT", "MENTOR", "EMPLOYER"] as const),
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const { user, register: registerUser, loading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get role from URL and validate it's one of our allowed roles
  const initialRole = (() => {
    const param = searchParams.get("role")?.toUpperCase();
    if (param === "STUDENT" || param === "MENTOR" || param === "EMPLOYER") {
      return param;
    }
    return "STUDENT";
  })() as RegisterRole;

  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: initialRole,
    },
  });

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setRegisterError(null);
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });
    } catch (error: any) {
      setRegisterError(error.message || "Failed to register");
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
                alt="IndustryHuntBD BD Logo"
                width={64}
                height={64}
                className="h-16 w-16"
              />
            </div>
            <CardTitle className="text-2xl text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Join IndustryHunt Bangladesh today
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {(registerError || error) && (
                <Alert variant="destructive">
                  <AlertDescription>{registerError || error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
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
                <Label htmlFor="password">Password</Label>
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
              <div className="space-y-2">
                <Label>I'm joining as</Label>
                <RadioGroup
                  className="flex flex-col space-y-2 mt-2"
                  defaultValue={initialRole}
                  onValueChange={(value: RegisterRole) =>
                    setValue("role", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="STUDENT" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MENTOR" id="mentor" />
                    <Label htmlFor="mentor">Mentor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EMPLOYER" id="employer" />
                    <Label htmlFor="employer">Employer</Label>
                  </div>
                </RadioGroup>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-xs text-center text-muted-foreground">
                By clicking "Create Account", you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </CardContent>
          </form>
          <CardFooter>
            <div className="text-center text-sm text-muted-foreground w-full">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
