import Navbar from "@/components/Navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col  md:mx-auto lg:mx-auto min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <Navbar />
      {children}
    </div>
  );
}
