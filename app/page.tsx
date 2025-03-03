"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status, data }: any = useSession();
  const user = data?.user?.user;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Welcome Back to TaskBuddy App</h1>

      {status == "authenticated" ? (
        <div className="flex flex-col items-center">
          <p className="text-xl font-semibold mb-4">
            Hello, {user?.fullName} 👋
          </p>

          {user?.role != "admin" ? (
            <Link href="/tasks">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Go to Tasks
              </button>
            </Link>
          ) : (
            <Link href="/admin">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-x-4">
          <Link href="/auth/login">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Login
            </button>
          </Link>
          <Link href="/auth/register">
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              Register
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
