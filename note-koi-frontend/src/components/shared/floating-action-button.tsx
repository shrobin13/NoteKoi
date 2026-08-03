import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  href: string;
}

export function FloatingActionButton({ href }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
      <Link href={href} aria-label="Upload resource">
        <Button variant="primary" className="rounded-full px-5 py-4 shadow-2xl">
          Upload
        </Button>
      </Link>
    </div>
  );
}
