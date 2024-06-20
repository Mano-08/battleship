import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="flex flex-col px-7 md:px-16">
      <Navbar />
      <Hero />
    </main>
  );
}
