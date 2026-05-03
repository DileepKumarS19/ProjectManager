import React from 'react';
import TaskCard from './TaskCard.jsx';

const KanbanBoard = ({ tasks, onMoveTask }) => {
  const columns = [
    { id: 'todo', title: 'To Do', bgColor: 'bg-gray-100' },
    { id: 'inprogress', title: 'In Progress', bgColor: 'bg-blue-50' },
    { id: 'done', title: 'Done', bgColor: 'bg-green-50' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {columns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className={`flex-1 w-full rounded-lg p-4 min-h-[500px] ${col.bgColor} border border-gray-200`}>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg text-gray-700">{col.title}</h3>
              <span className="bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-sm font-bold">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex flex-col">
              {columnTasks.map(task => (
                <TaskCard key={task._id} task={task} onMove={onMoveTask} />
              ))}
              {columnTasks.length === 0 && (
                <p className="text-gray-400 text-center italic mt-10">No tasks</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
