import { getAdminUsers } from '@/lib/actions/admin'
import AdminUsersClient from './client-page'

export const metadata = { title: 'Users Admin - DudeChat' }

export default async function AdminUsersPage() {
  const users = await getAdminUsers()
  return <AdminUsersClient users={users} />
}
