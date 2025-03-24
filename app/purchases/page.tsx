// app/purchases/page.tsx
import { redirect } from "next/navigation";

export default async function PurchasesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Get success message from URL if present
  const successMessage = typeof searchParams?.success === 'string' ? searchParams.success : null;
  
  // Redirect to the user dashboard with the purchases tab active
  const redirectUrl = `/user?tab=purchases${successMessage ? `&success=${encodeURIComponent(successMessage)}` : ''}`;
  
  return redirect(redirectUrl);
}