export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex justify-center items-start pt-20">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
