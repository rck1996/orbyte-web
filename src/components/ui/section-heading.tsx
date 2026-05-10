import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-12">
      <Badge tone="accent" className="w-fit">
        {badge}
      </Badge>
      <div className="grid gap-8">
        <h2 className="text-balance text-2xl leading-[1.1] font-semibold tracking-[-0.04em] text-foreground sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-[1.65] text-muted-strong md:text-lg md:leading-[1.7]">
          {description}
        </p>
      </div>
    </div>
  );
}
