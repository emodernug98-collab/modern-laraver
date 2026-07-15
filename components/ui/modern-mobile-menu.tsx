"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Briefcase, Calendar, Home, Settings, Shield } from "lucide-react";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  href?: string;
  badge?: number | string;
  active?: boolean;
  ariaLabel?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  onSelect?: (item: InteractiveMenuItem, index: number) => void;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: "home", icon: Home },
  { label: "strategy", icon: Briefcase },
  { label: "period", icon: Calendar },
  { label: "security", icon: Shield },
  { label: "settings", icon: Settings },
];

const defaultAccentColor = "var(--component-active-color-default)";

function getInitialActiveIndex(items: InteractiveMenuItem[]) {
  const activeIndex = items.findIndex((item) => item.active);
  return activeIndex >= 0 ? activeIndex : 0;
}

export function InteractiveMenu({
  items,
  accentColor,
  onSelect,
}: InteractiveMenuProps) {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const controlledActiveIndex = finalItems.findIndex((item) => item.active);
  const [activeIndex, setActiveIndex] = useState(() => getInitialActiveIndex(finalItems));
  const safeActiveIndex = Math.min(activeIndex, finalItems.length - 1);
  const resolvedActiveIndex = controlledActiveIndex >= 0 ? controlledActiveIndex : safeActiveIndex;

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[resolvedActiveIndex];
      const activeTextElement = textRefs.current[resolvedActiveIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener("resize", setLineWidth);
    return () => window.removeEventListener("resize", setLineWidth);
  }, [resolvedActiveIndex, finalItems]);

  const handleItemClick = (item: InteractiveMenuItem, index: number) => {
    setActiveIndex(index);
    onSelect?.(item, index);
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { "--component-active-color": activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav className="menu" role="navigation" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === resolvedActiveIndex;
        const IconComponent = item.icon;
        const commonProps = {
          className: `menu__item ${isActive ? "active" : ""}`,
          onClick: () => handleItemClick(item, index),
          ref: (el: HTMLElement | null) => {
            itemRefs.current[index] = el;
          },
          style: { "--lineWidth": "0px" } as React.CSSProperties,
          "aria-label": item.ariaLabel || item.label,
        };
        const content = (
          <>
            <div className="menu__icon">
              <IconComponent className="icon" />
              {item.badge ? (
                <span className="menu__badge">{item.badge}</span>
              ) : null}
            </div>
            <strong
              className={`menu__text ${isActive ? "active" : ""}`}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
            >
              {item.label}
            </strong>
          </>
        );

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} {...commonProps}>
              {content}
            </Link>
          );
        }

        return (
          <button key={item.label} type="button" {...commonProps}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
