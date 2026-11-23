import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../firebase";
import api from "../lib/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from "../shared";
import { useNavigate } from "react-router-dom";

function GoogleIcon() {
  return <FcGoogle size={20} aria-hidden="true" />;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log(`Initiating Google Login...`);
      const firbaseData = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await firbaseData.user.getIdToken();
      console.log(`Received Firebase Token:`, firebaseToken);

      const {data} = await api.post("auth/login", { token: firebaseToken });
      toast.add({
        title: "Login Successful",
        description: data.message || "You have been logged in successfully.",
        type: "success",
      });
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.add({
          title: "Login Failed",
          description:
            error.message || "An error occurred during login. Please try again.",
          type: "error",
        });
        console.error("Login Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader align="center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-bold">
              A
            </div>

            <div className="space-y-2">
              <CardTitle size="lg" as="h1">
                Automata AI
              </CardTitle>

              <CardDescription>
                Your intelligent workspace starts here. Sign in to continue.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              iconStart={<GoogleIcon />}
              onClick={onGoogleLogin}
              disabled={loading}
            >
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a
                href="/terms"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Login;
