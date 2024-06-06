import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <main className="flex flex-col px-7 md:px-16">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}
