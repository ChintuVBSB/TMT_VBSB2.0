import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import axios from "../services/api";
import toast from "react-hot-toast";
import { getToken } from "../utils/token";
import { Clock, Loader, CheckCircle2 } from "lucide-react";

const KanbanView = ({ allTasks = [] }) => {
  const [columns, setColumns] = useState({
    pending: [],
    in_progress: [],
    completed: []
  });

  // ✅ Function to check if task is expired
  const isExpired = (task) => {
    const due = new Date(task.due_date);
    due.setHours(23, 59, 59, 999);
    return due < new Date();
  };

  // ✅ Only include non-expired tasks in Kanban
  useEffect(() => {
    const nonExpiredTasks = allTasks.filter((task) => !isExpired(task));

    const grouped = {
      pending: nonExpiredTasks.filter((t) => t.status === "Pending"),
      in_progress: nonExpiredTasks.filter((t) => t.status === "In Progress"),
      completed: nonExpiredTasks.filter((t) => t.status === "Completed")
    };
    setColumns(grouped);
  }, [allTasks]);

const handleDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  const fromCol = source.droppableId;
  const toCol = destination.droppableId;

  if (fromCol === toCol) return;

  // 🚫 Block Backward Movement
  const statusOrder = {
    pending: 1,
    in_progress: 2,
    completed: 3,
  };

  if (statusOrder[toCol] < statusOrder[fromCol]) {
    toast.error("Backward movement not allowed");
    return;
  }

  const movedTask = columns[fromCol].find((task) => task._id === draggableId);
  const newStatus =
    toCol === "in_progress" ? "In Progress" :
    toCol === "pending" ? "Pending" :
    "Completed";

  const updatedTask = { ...movedTask, status: newStatus };

  const newColumns = {
    ...columns,
    [fromCol]: columns[fromCol].filter((task) => task._id !== draggableId),
    [toCol]: [updatedTask, ...columns[toCol]],
  };

  setColumns(newColumns);

  try {
    await axios.patch(
      `/assign/tasks/${draggableId}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    toast.success("Task status updated");
  } catch (err) {
    console.error("❌ Status update failed", err);
    toast.error("Failed to update status");
  }
};

  const columnData = {
    pending: {
      title: "Pending",
      icon: <Clock className="text-yellow-500 w-5 h-5" />,
      color: "bg-yellow-100"
    },
    in_progress: {
      title: "In Progress",
      icon: <Loader className="text-blue-500 w-5 h-5" />,
      color: "bg-blue-100"
    },
    completed: {
      title: "Completed",
      icon: <CheckCircle2 className="text-green-600 w-5 h-5" />,
      color: "bg-green-100"
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto px-2 sm:px-4 py-6">
        {Object.keys(columns).map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`w-full md:w-[calc(100%/3-1rem)] min-w-[280px] flex-shrink-0 rounded-lg p-4 shadow-sm ${columnData[col].color} border`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {columnData[col].icon}
                  <h2 className="text-lg font-semibold">{columnData[col].title}</h2>
                </div>

                {columns[col].map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <p className="font-medium text-gray-800 mb-1">{task.title}</p>
                        <p className="text-sm text-gray-500 mb-2 truncate">{task.description}</p>
                        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                          Priority: {task.priority || "Medium"}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
