"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const session: any = useSession();

  const fetchAllTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks/getAllTasks", {
      headers: {
        Authorization: `Bearer ${session?.data?.user?.token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchAllTasks();
  }, [session.status]);

  useEffect(() => {
    socket.on("newTask", (data) => {
      console.log("New Task received:", data);
      fetchAllTasks(); // Refresh tasks list on new task
    });

    socket.on("taskUpdated", (data) => {
      console.log("Task updated:", data);
      fetchAllTasks(); // Refresh tasks list on update
    });

    // Initial data load
    fetchAllTasks();

    return () => {
      socket.off("newTask");
      socket.off("taskUpdated");
    };
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tasks) &&
            tasks?.map((task: any) => (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.completed ? "Completed" : "Incomplete"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
