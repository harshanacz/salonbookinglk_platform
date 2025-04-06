import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CategoryButtonProps {
  name: string;
  icon: string;
}

export function CategoryButton({ name, icon }: CategoryButtonProps) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link href={`/services/${slug}`}>
      <Button
        variant="outline"
        className="rounded-full px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
      >
        <span className="mr-2">{icon}</span>
        {name}
      </Button>
    </Link>
  );
}
