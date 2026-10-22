import type { ButtonHTMLAttributes } from "react"

export type ButtonVariant = "primary" | "secondary" | "teal" | "light"

export function buttonVariants(
  variant: ButtonVariant = "primary",
  className = "",
) {
  return [
    "button",
    `button--${variant}`,
    "inline-flex items-center justify-center rounded-full transition-transform hover:-translate-y-0.5",
    className,
  ]
    .filter(Boolean)
    .join(" ")
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={buttonVariants(variant, className)} {...props} />
}
