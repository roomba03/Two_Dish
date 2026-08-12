export const metadata = {
  title: "Kitchen Dashboard — Two Dish",
};

export default function CookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
