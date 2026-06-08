import AcceptEventInvitation from "@/components/organisms/AcceptEventInvitation";

type EventInvitationPageProps = {
  params: Promise<{ token: string }>;
};

export default async function EventInvitationPage({
  params,
}: EventInvitationPageProps) {
  const { token } = await params;
  return <AcceptEventInvitation token={token} />;
}
