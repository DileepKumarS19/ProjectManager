import React from 'react';

const TaskCard = ({ task, onMove }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white p-4 rounded-md shadow border border-gray-200 mb-3 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-800">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3 flex-grow">{task.description}</p>
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span>
        <span>Assignee: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
      </div>

      <div className="flex justify-between border-t pt-2 mt-auto">
        {task.status !== 'todo' ? (
          <button 
            onClick={() => onMove(task._id, task.status === 'done' ? 'inprogress' : 'todo')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← Move Back
          </button>
        ) : <div/>}

        {task.status !== 'done' && (
          <button 
            onClick={() => onMove(task._id, task.status === 'todo' ? 'inprogress' : 'done')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Move Forward →
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
