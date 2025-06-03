import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  className = "",
  ...props
}) => {
  return (
    <a href={href} className={`relative group ${className}`} {...props}>
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
    </a>
  );
};
