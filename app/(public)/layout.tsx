import Navbar from "@/app/components/menu-navbar";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (

      <>
        <Navbar />
        {children}
      </>
  );
}