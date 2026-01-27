import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import ProjectsSection from "@/components/ProjectsSection";
import VersesSection from "@/components/VersesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ScheduleSection />
        <ProjectsSection />
        <VersesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
