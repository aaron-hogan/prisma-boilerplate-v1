// app/purchases/page.tsx
import { redirect } from "next/navigation";

export default async function PurchasesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Get success message from URL if present
  const successMessage = typeof searchParams?.success === 'string' ? searchParams.success : null;
  const tab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'purchases';
  
  // Allow overriding the tab (for membership purchases)
  const redirectUrl = `/user?tab=${tab}${successMessage ? `&success=${encodeURIComponent(successMessage)}` : ''}`;
  
  return redirect(redirectUrl);
}