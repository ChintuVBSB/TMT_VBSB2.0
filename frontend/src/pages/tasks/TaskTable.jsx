import React from "react";

const TaskTable = ({ tasks, loading, onLoadMore }) => {
  if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
  if (!loading && tasks.length === 0) return <p>No tasks found.</p>;
    
    
  return (
    <div>
      {loading && tasks.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full border mb-4">
            <thead>
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Assignee</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td className="border p-2">{task.title}</td>
                  <td className="border p-2">{task.assignee}</td>
                  <td className="border p-2">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Load More
          </button>
        </>
      )}
    </div>
  );
};

export default TaskTable;
