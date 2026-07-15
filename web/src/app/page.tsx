import AmbientBackground from "@/components/AmbientBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import PredictSection from "@/components/PredictSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <AboutSection />
        <PredictSection />
      </main>
      <Footer />
    </>
  );
}
