
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import api from "../lib/api";
import { toast } from "../components/ui/toast";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.05 13.22l7.98 6.19C12.97 13.72 18.01 9.5 24 9.5Z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.85 46.98 24.55Z"/>
      <path fill="#FBBC05" d="M10.03 28.59A14.4 14.4 0 0 1 9.25 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.93 23.93 0 0 0 0 24c0 3.88.93 7.55 2.58 10.78l7.45-6.19Z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.94-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.9 2.3-8.18 2.3-5.99 0-11.03-4.22-12.97-9.91l-7.45 6.19C7.04 42.6 14.95 48 24 48Z"/>
    </svg>
  );
}


const Login = () => {

    const [loading, setLoading] = useState(false);
    // const [logoutLoading, setLogoutLoading] = useState(false);
    
    const onGoogleLogin = async () => {
        setLoading(true);
        try {
            console.log(`Initiating Google Login...`);
            const firbaseData = await signInWithPopup(auth, googleProvider);
            const firebaseToken = await firbaseData.user.getIdToken();
            console.log(`Received Firebase Token:`, firebaseToken);

            const data = await api.post("auth/login", { token: firebaseToken });
            toast.add({
                title: "Login Successful",
                description: "You have been logged in successfully.",
                type: "success",
            });
            console.log("Login Response:", data);
        } 
        catch (error) {
            if(error instanceof Error){
                toast.add({
                    title: "Login Failed",
                    description: error.message ||"An error occurred during login. Please try again.",
                    type: "error",
                });
                console.error("Login Error:", error);
            }

        } finally {
            setLoading(false);
        }
    };

    // const onLogout = async () => {
    //     try {
    //         setLogoutLoading(true);
    //         const {data} = await api.post("/auth/logout");
    //         toast.add({
    //             title: "Logout Successful",
    //             description: data.message || "You have been logged out successfully.",
    //             type: "success",
    //         });
    //     } 
    //     catch (error) {
    //         if(error instanceof Error){
    //             toast.add({
    //                 title: "Logout Failed",
    //                 description: error.message ||"An error occurred during logout. Please try again.",
    //                 type: "error",
    //             });
    //         }
    //     }
    //     finally {
    //         setLogoutLoading(false);
    //     }
    // }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">

    <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-lg">

        <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-bold">
            A
        </div>

        <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
            Automata AI
            </CardTitle>

            <CardDescription>
            Your intelligent workspace starts here.
            Sign in to continue.
            </CardDescription>
        </div>
        </CardHeader>

        <CardContent className="space-y-5">
        <Button
            type="button"
            variant="outline"
            className="h-12 w-full gap-3"
            onClick={onGoogleLogin}
            disabled={loading}
        >
            <GoogleIcon />
            {loading ? "Connecting..." : "Continue with Google"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
            </a>.
        </p>
        </CardContent>

    </Card>
    </main>
  );

};

export default Login;