import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VoiceAssistant } from "@/components/features/VoiceAssistant";
import { ProfileCompletion } from "@/components/features/ProfileCompletion";
import { RecommendedRoles } from "@/components/features/RecommendedRoles";
import { CareerDevelopment } from "@/components/features/CareerDevelopment";

const Index = () => {
  return (
    <div className="flex flex-col min-h-[screen] w-full bg-gray-50">
      <Header />
      <main className="flex flex-col flex-1">
        <VoiceAssistant />
        <ProfileCompletion />
        <RecommendedRoles />
        <CareerDevelopment />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
