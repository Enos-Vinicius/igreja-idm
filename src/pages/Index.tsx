import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VersesSection from "@/components/VersesSection";
import HistorySection from "@/components/HistorySection";
import PrayerSection from "@/components/PrayerSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <VersesSection />
        <HistorySection />
        <PrayerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
