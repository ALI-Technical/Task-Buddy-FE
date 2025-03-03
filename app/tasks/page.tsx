"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import io from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_BASE_APIURL}`, {
  transports: ["websocket"],
});

interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  reminder?: boolean;
}

export default function TaskPage() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const session: any = useSession();

  const fetchTasks = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_APIURL}/api/tasks`,
      {
        headers: { Authorization: `Bearer ${session?.data?.user?.token}` },
      }
    );
    const data: Task[] = await res.json();
    setTasks(data);
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_BASE_APIURL}/api/tasks`, {
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

  const deleteTask = async (taskId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_APIURL}/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.data?.user?.token}` },
    });
    fetchTasks();
  };

  const toggleTaskStatus = async (taskId: string, completed: boolean) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_APIURL}/api/tasks/status/${taskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.data?.user?.token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      }
    );
    fetchTasks();
  };

  const updateTask = async (taskId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_APIURL}/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.data?.user?.token}`,
      },
      body: JSON.stringify({
        title: editedTitle,
        description: editedDescription,
      }),
    });
    setEditingTaskId(null);
    fetchTasks();
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchTasks();
    }
  }, [session.status]);

  useEffect(() => {
    socket.on(
      "taskStatusChanged",
      ({ taskId, completed }: { taskId: string; completed: boolean }) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, completed, reminder: false } : task
          )
        );
      }
    );

    socket.on("taskReminder", (data) => {
      // console.log("Task Reminder:", data);

      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          const isReminder = data.tasks.some(
            (reminderTask: Task) => reminderTask._id === task._id
          );
          return { ...task, reminder: isReminder };
        });
      });
    });

    return () => {
      socket.off("taskStatusChanged");
      socket.off("taskReminder");
    };
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center text-primary">
        Task Buddy
      </h1>

      {/* Create Task Form */}
      <form onSubmit={createTask} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full"
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Create Task
        </button>
      </form>

      {/* Tasks List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`card shadow-lg p-4 rounded-lg border 
            ${task.completed ? "border-green-500" : "border-red-500"}`}
          >
            {editingTaskId === task._id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="input input-bordered w-full"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="textarea textarea-bordered w-full"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTask(task._id)}
                    className="btn btn-sm btn-success"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="btn btn-sm btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">{task.title}</h3>
                <p className="text-sm">{task.description}</p>
                {task.reminder && (
                  <p className="text-red-500 font-bold">
                    Reminder: Complete this task!
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => toggleTaskStatus(task._id, task.completed)}
                    className="btn btn-sm btn-warning"
                  >
                    {task.completed ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTaskId(task._id);
                      setEditedTitle(task.title);
                      setEditedDescription(task.description);
                    }}
                    className="btn btn-sm btn-info"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
