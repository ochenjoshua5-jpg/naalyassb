import { Hero } from "@/components/sections/hero";
import { Welcome } from "@/components/sections/welcome";
import { Programmes } from "@/components/sections/programmes";
import { News } from "@/components/sections/news";
import { Admissions } from "@/components/sections/admissions";
import { Visit } from "@/components/sections/visit";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Welcome />
      <Programmes />
      <News />
      <Admissions />
      <Visit />
    </>
  );
}
