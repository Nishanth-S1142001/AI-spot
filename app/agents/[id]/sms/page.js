import SmsTab from "../../../../components/agentTabs/SmsTab"

export default function SmsPage({ params }) {
  return <SmsTab agentId={params.id} userId={user.id} />
}