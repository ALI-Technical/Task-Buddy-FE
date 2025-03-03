"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Login() {
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const session: any = useSession();

  useEffect(() => {
    if (session?.status == "authenticated") {
      if (session?.data?.user?.user?.role == "admin") {
        router.push("/admin");
      } else {
        router.push("/tasks");
      }
    }
  }, [session?.status]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_APIURL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        }
      );
      if (res?.ok) {
        toast("Registered Succesfully!", {
          type: "success",
        });
        router.push("/auth/login");
      } else {
        throw await res.json();
      }
    } catch (error: any) {
      //   console.log(error);
      toast(error?.message, { type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleRegister}
        className="p-6 rounded-lg shadow-2xl border border-gray-600 w-80"
      >
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={fullName}
          onChange={(e) => setFullname(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <button type="submit" className="btn btn-primary w-full">
          Register
        </button>
      </form>
    </div>
  );
}
