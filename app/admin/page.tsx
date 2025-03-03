"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_BASE_APIURL}`);

interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const session: any = useSession();

  const fetchAllTasks = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_APIURL}/api/tasks/getAllTasks`,
      {
        headers: {
          Authorization: `Bearer ${session?.data?.user?.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data: Task[] = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchAllTasks();
    }
  }, [session.status]);

  useEffect(() => {
    socket.on("newTask", (newTask: Task) => {
      console.log("New Task received:", newTask);
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on("taskUpdated", (updatedTask: Task) => {
      console.log("Task updated:", updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.on(
      "taskStatusChanged",
      ({ taskId, completed }: { taskId: string; completed: boolean }) => {
        console.log("Task status changed:", taskId, completed);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, completed } : task
          )
        );
      }
    );

    socket.on("taskDeleted", (taskId: string) => {
      console.log("Task deleted:", taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    });

    return () => {
      socket.off("newTask");
      socket.off("taskUpdated");
      socket.off("taskStatusChanged");
      socket.off("taskDeleted");
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
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const creationDate = new Date(task.createdAt);
            const updatedDate = new Date(task.updatedAt);
            return (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td className={task.completed ? "text-success" : "text-error"}>
                  {task.completed ? "Completed" : "Incomplete"}
                </td>
                <td>{`${creationDate.getDate()}-${creationDate.getMonth()}-${creationDate.getFullYear()}`}</td>
                <td>{`${updatedDate.getDate()}-${updatedDate.getMonth()}-${updatedDate.getFullYear()}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
