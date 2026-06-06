"use client";
import { useState } from "react";
import { KanbanLane } from "../organisms/KanbanLane";

export default function KanbanBoard() {
  const [status, setStatus] = useState<string>('to-do');

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value);

  }

  return (
    <div className="mt-5 min-h-0 flex-1">
      <div className="w-full h-full md:flex-1 min-h-0 pt-5 md:hidden">
        <div className="flex min-h-0 flex-col gap-3 h-full min-h-0 md:flex-1">
          <select name="status" onChange={handleStatusChange} id="status" className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-100 px-4 pr-10 text-sm font-semibold text-gray-900 shadow-inner outline-none focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-900/5">
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <KanbanLane key={status} status={status}></KanbanLane>
        </div> 
      </div>
      <div className="hidden md:flex h-full w-full snap-x snap-mandatory gap-4 overflow-x-auto rounded-md bg-gray-50 md:grid md:grid-cols-3 md:overflow-hidden">
        <KanbanLane status="To Do" />
        <KanbanLane status="In Progress"  />
        <KanbanLane status="Done" />
      </div>
    </div>
  )
}