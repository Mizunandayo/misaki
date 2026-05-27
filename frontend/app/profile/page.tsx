import { api } from '@/lib/api'
import { ProfileView } from '@/components/profile/ProfileView'

export default async function ProfilePage() {
  const profile = await api.profile.getDemo()
  return <ProfileView initial={profile} />
}
