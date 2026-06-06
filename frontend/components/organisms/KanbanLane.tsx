import EventCard from "../molecules/EventCard";

export type KanbanLaneProps = {
  status: string;
}

export function KanbanLane(props: KanbanLaneProps) {
  console.info(props);
  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white md:min-w-0">
    <div className="shrink-0 border-b border-gray-200 bg-white p-3 text-center text-lg font-bold">
      {props.status}
    </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-5">
        
      </div>
    </section>
  )
}