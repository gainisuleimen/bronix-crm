export type ContactLink = {
  id: string;
  label: string;
  value: string;
  href: string;
};

export const CONTACT_LINKS: ContactLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    value: "@bronix_crm",
    href: "https://www.instagram.com/",
  },
  {
    id: "telegram",
    label: "Telegram",
    value: "@bronix_crm",
    href: "https://web.telegram.org/",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+7 (999) 123-45-67",
    href: "https://www.whatsapp.com/?lang=ru",
  },
  {
    id: "gmail",
    label: "Gmail",
    value: "info@bronix-crm.ru",
    href: "https://www.gmail.com/mail/help/intl/ru/about.html?de.",
  },
  {
    id: "phone",
    label: "Телефон",
    value: "+7 (999) 123-45-67",
    href: "tel:+79991234567",
  },
];

export const EXTERNAL_LINK_PROPS = {
  target: "_blank" as const,
  rel: "noopener noreferrer",
};
