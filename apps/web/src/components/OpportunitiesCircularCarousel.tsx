import React from "react";
import { CircularCarousel, CarouselItem } from "./CircularCarousel";

export interface OpportunityItem {
  id: string;
  title: string;
  type: string;
  portal: string;
  amount: string;
  deadline: string;
  status: string;
  matchScore: number;
  url: string;
  image?: string;
}

export interface OpportunitiesCircularCarouselProps {
  opportunities?: OpportunityItem[];
  onSelectOpportunity?: (opportunityId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-eiffel-2027",
    title: "Bourse Eiffel d'Excellence Master IA 2027",
    type: "BOURSE",
    portal: "Campus France",
    amount: "14 000 €",
    deadline: "10 Janvier 2027",
    status: "NOUVELLE",
    matchScore: 96.5,
    url: "https://www.campusfrance.org/fr/bourses-etudiants-etrangers",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "opp-devpost-agentic",
    title: "Devpost Global Agentic AI Hackathon 48h",
    type: "HACKATHON",
    portal: "Devpost / MLH",
    amount: "25 000 $ en crédits GPU",
    deadline: "30 Novembre 2026",
    status: "EN_COURS",
    matchScore: 98.0,
    url: "https://devpost.com/hackathons",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "opp-cambridge-c1",
    title: "Certification Cambridge English C1 Advanced (CAE)",
    type: "CERTIFICATION",
    portal: "Cambridge Assessment",
    amount: "Validation Rang B Indispensable",
    deadline: "15 Décembre 2026",
    status: "SOUMIS",
    matchScore: 99.0,
    url: "https://www.cambridgeenglish.org",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "opp-deepmind-fellowship",
    title: "DeepMind AI Research Fellowship 2027",
    type: "BOURSE",
    portal: "Google DeepMind",
    amount: "50 000 £ + GPU Compute Cluster",
    deadline: "15 Février 2027",
    status: "OUVERT",
    matchScore: 97.8,
    url: "https://deepmind.google/fellowships",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "opp-mistral-hackathon",
    title: "Mistral AI Hackathon Paris // Le Chat Agents",
    type: "HACKATHON",
    portal: "Station F / Mistral",
    amount: "30 000 € Cash Prize",
    deadline: "20 Décembre 2026",
    status: "NOUVELLE",
    matchScore: 95.4,
    url: "https://mistral.ai",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop",
  },
  {
    id: "opp-aws-architect",
    title: "AWS Certified Solutions Architect — Professional",
    type: "CERTIFICATION",
    portal: "Amazon Web Services",
    amount: "Certification Cloud & DevOps",
    deadline: "31 Janvier 2027",
    status: "EN_COURS",
    matchScore: 94.0,
    url: "https://aws.amazon.com/certification",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format&fit=crop",
  },
];

export const OpportunitiesCircularCarousel: React.FC<
  OpportunitiesCircularCarouselProps
> = ({
  opportunities = DEFAULT_OPPORTUNITIES,
  onSelectOpportunity,
  className = "",
  style,
}) => {
  const items: CarouselItem[] = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    subtitle: `${o.portal} • ${o.amount}`,
    alt: o.title,
    src:
      o.image ||
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&auto=format&fit=crop",
  }));

  return (
    <div
      style={{ width: "100%", height: "560px", position: "relative", ...style }}
      className={className}
    >
      <CircularCarousel
        items={items}
        preset="cylinder"
        intro="rise"
        cardWidth={220}
        aspectRatio={1}
        speed={14}
        captions={false}
        gap={25}
        tilt={-5}
        curve={1}
        perspective={2500}
        autoplay="drift"
        interval={3}
        direction="left"
        momentum={0.6}
        snap={true}
        pauseOnHover={true}
        focusOnClick={true}
        draggable={true}
        parallax={0.3}
        stretch={0.5}
        fadeColor="#000000"
        depthFade={0.55}
        innerShade={0.6}
        cornerRadius={12}
        onItemClick={(item) => {
          if (item.id && onSelectOpportunity) {
            onSelectOpportunity(item.id);
          }
        }}
      />
    </div>
  );
};

export default OpportunitiesCircularCarousel;
