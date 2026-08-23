import { whatsappLink } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Two complete color sets, not overridable pieces — mixing "bg-brand" (base)
// with a caller-supplied "bg-white" override is a real bug: both classes
// exist on the element and Tailwind's generated stylesheet order (not the
// order they're listed in the class attribute) decides which one wins, so an
// override can silently lose and produce white-on-white. A closed set of
// variants sidesteps that entirely.
const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  inverted: "bg-white text-brand-dark hover:bg-gray-100",
} as const;

export function WhatsAppButton({
  message,
  className,
  variant = "primary",
  children = "Contact on WhatsApp",
}: {
  message?: string;
  className?: string;
  variant?: keyof typeof VARIANTS;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </a>
  );
}
