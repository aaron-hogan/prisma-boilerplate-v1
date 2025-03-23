// app/(protected)/dashboard/page.tsx
export default function ProtectedDashboardPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <p>This page is accessible to any authenticated user</p>
    </div>
  );
}