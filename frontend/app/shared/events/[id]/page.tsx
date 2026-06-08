import SharedEventContent from "@/components/templates/SharedEventContent";

type SharedEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SharedEventPage({ params }: SharedEventPageProps) {
  const { id } = await params;
  return <SharedEventContent eventId={id} />;
}
