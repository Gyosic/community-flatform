"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const menuItems = [
  {
    type: "dropdown" as const,
    trigger: "Products",
    items: [
      { label: "Analytics", href: "#" },
      { label: "Marketing", href: "#" },
      { label: "Commerce", href: "#" },
    ],
  },
  {
    type: "link" as const,
    label: "Pricing",
    href: "#",
  },
  {
    type: "link" as const,
    label: "About",
    href: "#",
  },
  {
    type: "dropdown" as const,
    trigger: "Support",
    items: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export function AppTopbar() {
  return (
    <div className="w-full max-w-md rounded-md bg-background p-px">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          {menuItems.map((section, index) =>
            section?.items?.length ? (
              <NavigationMenuItem key={index}>
                <NavigationMenuTrigger>{section.trigger}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-2">
                    {(section?.items ?? []).map((item, itemIndex) => (
                      <NavigationMenuLink href={item.href} key={itemIndex}>
                        {item.label}
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href={section.href}>
                  {section.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ),
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
