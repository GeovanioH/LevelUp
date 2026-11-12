import React from "react";
import { CircularCarousel, CarouselItem } from "./CircularCarousel";

export interface QuestsCircularCarouselProps {
  quests: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    base?: string;
    type?: string;
    xp?: number;
    crystals?: number;
    completed?: boolean;
    image?: string;
  }[];
  onSelectQuest?: (questId: string) => void;
  className?: string;
}

export const QuestsCircularCarousel: React.FC<QuestsCircularCarouselProps> = ({
  quests,
  onSelectQuest,
  className = "",
}) => {
  const items: CarouselItem[] = quests.map((q) => ({
    id: q.id,
    title: q.title,
    subtitle: `${q.base || "SYSTEM"} // +${q.xp || 100} XP`,
    description: q.description,
    base: q.base,
    xpReward: q.xp,
    completed: q.completed,
    src:
      q.image ||
      (q.base === "SEC"
        ? "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80&auto=format&fit=crop"
        : q.base === "AI_ENG"
          ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80&auto=format&fit=crop"
          : q.base === "STR"
            ? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80&auto=format&fit=crop"),
  }));

  return (
    <div
      className={`quests-circular-carousel-wrap relative w-full h-[580px] overflow-hidden rounded-2xl ${className}`}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.08) 0%, rgba(2, 8, 24, 0.95) 75%)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        boxShadow: "inset 0 0 50px rgba(2, 8, 24, 0.9)",
      }}
    >
      <div className="absolute top-4 left-6 z-20 pointer-events-none">
        <div className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
          CYLINDRE 3D // SYSTÈME DE QUÊTES IMMERSIF
        </div>
        <div className="text-sm text-slate-400">
          Glissez pour faire pivoter le cylindre ou cliquez pour engager la quête
        </div>
      </div>

      <CircularCarousel
        items={items}
        preset="cylinder"
        intro="rise"
        cardWidth={260}
        aspectRatio={0.7}
        speed={14}
        captions={true}
        gap={30}
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
        fadeColor="#020818"
        depthFade={0.6}
        innerShade={0.7}
        cornerRadius={14}
        onItemClick={(item) => {
          if (item.id && onSelectQuest) {
            onSelectQuest(item.id);
          }
        }}
      />
    </div>
  );
};

export default QuestsCircularCarousel;
