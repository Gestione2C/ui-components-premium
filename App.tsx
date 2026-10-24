import { Spotlight } from "@/components/spotlight";
import { FloatingNav } from "@/components/floating-navbar";
import { CardContainer, CardBody, CardItem } from "@/components/3d-card-hover-tilt-effect";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingNav navItems={[{ name: "Gamma", link: "#gamma" }]} />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#ffd400" />
      <CardContainer>
        <CardBody>
          <CardItem translateZ={50}>Smoke test</CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}
