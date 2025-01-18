import { Slot } from "@radix-ui/react-slot"
import { clsx } from "clsx"

const buttonVariants = {
  default: "bg-black text-white hover:bg-gray-800",
  outline: "border border-black text-black hover:bg-gray-100"
}

export function Button({ className, variant = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  )
} 