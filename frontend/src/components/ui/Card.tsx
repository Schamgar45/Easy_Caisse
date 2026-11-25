import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, header, footer, className, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden
        ${className || ""}
      `}
      {...props}
    >
      {header && <div className="border-b border-slate-50 px-6 py-4">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t border-slate-50 px-6 py-4 bg-slate-50">{footer}</div>}
    </div>
  );
};

export { Card };