import React from "react";
import classnames from "classnames";

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: "xs" | "sm" | "md" | "xl";
  level?: "primary" | "danger" | "success" | "warning";
  className?: string;
  children?: string;
  props?: object;
}

export default function Button({
  size,
  level,
  className,
  children,
  ...props
}: ButtonProps) {
  // return (
  //   <button
  //     className={` bg-blue-600 rounded-md
  //     text-blue-300 text-xl shadow-sm hover:shadow-md
  //     transition-all hover:bg-blue-700 active:bg-blue-800
  //     font-light disabled:bg-neutral-600 disabled:text-neutral-400
  //       ${className}`}
  //     {...props}
  //   >
  //     {children}
  //   </button>
  // );

  return (
    <button
      className={classnames(
        // Generic properties for button
        "rounded-md",
        "shadow-sm",
        "hover:shadow-md",
        "transition-all ease-in-out",
        "font-light disabled:bg-neutral-600 disabled:text-neutral-400",
        // Size
        { "px-2 py-1 text-sm": size === "xs" },
        { "px-1 py-2 text-sm": size === "sm" },
        { "px-2 py-3 text-md": size === "md" },
        { "px-3 py-4 text-xl": size === "xl" },
        // Decoration colors
        {
          "bg-blue-700 text-blue-200 hover:bg-blue-600 hover:text-blue-200":
            level === "primary",
        },
        {
          "bg-red-700 text-red-200 hover:bg-red-600 hover:text-red-200":
            level === "danger",
        },
        {
          "bg-green-700 text-green-200 hover:bg-green-600 hover:text-green-200":
            level === "success",
        },
        {
          "bg-yellow-700 text-yellow-200 hover:bg-yellow-600 hover:text-yellow-800":
            level === "warning",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
