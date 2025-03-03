import { signOut, useSession } from "next-auth/react";
import React from "react";

const Header: React.FC = () => {
  const session: any = useSession();

  return (
    <header className="bg-primary text-white py-4 px-6 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">Task Manager</h1>
      {session?.status == "authenticated" && (
        <div className="flex flex-col justify-center">
          <p className="text-lg font-semibold">
            Welcome {session?.data?.user?.user?.fullName}
          </p>
          <button
            onClick={() => {
              signOut();
            }}
            className="btn btn-error text-white"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
