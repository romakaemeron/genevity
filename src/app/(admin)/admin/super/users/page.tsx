import { getUsers } from "../../_actions/super";
import { requireSession } from "../../_actions/auth";
import UsersPanel from "./_components/users-panel";
import { AdminPageHeader } from "../../_components/admin-list";

export default async function UsersPage() {
  const [session, users] = await Promise.all([
    requireSession(),
    getUsers(),
  ]);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage CMS access — create accounts, assign roles, reset passwords."
      />
      <UsersPanel users={users as any[]} currentUserId={session.userId} />
    </div>
  );
}
