"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const session: any = useSession();

  const fetchTasks = async () => {
    // Replace with your API endpoint
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${session?.data?.user?.token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.data?.user?.token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    setTitle("");
    setDescription("");
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Task Buddy</h1>
      <form onSubmit={createTask} className="mb-6">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full mb-2"
        />
        <button type="submit" className="btn btn-primary">
          Create Task
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
        <ul>
          {Array.isArray(tasks) && tasks?.map((task: any) => (
            <li key={task._id} className="p-2 border rounded mb-2 bg-white">
              <h3 className="font-bold">{task.title}</h3>
              <p>{task.description}</p>
              <span className="text-sm text-gray-500">
                {task.completed ? "Completed" : "Incomplete"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
