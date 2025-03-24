export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col gap-12 items-center">
      <div className="max-w-md w-full">{children}</div>
    </div>
  );
}
