import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FoundationSection from "@/components/FoundationSection";
import ScheduleSection from "@/components/ScheduleSection";
import ProjectsSection from "@/components/ProjectsSection";
import VersesSection from "@/components/VersesSection";
import PrayerSection from "@/components/PrayerSection";
// import HistorySection from "@/components/HistorySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <FoundationSection />
        <ScheduleSection />
        <ProjectsSection />
        <VersesSection />
        <PrayerSection />
        {/* <HistorySection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
