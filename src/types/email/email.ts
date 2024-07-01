export type EmailContents = {
  name: string;
  body: string;
  cta?: EmailCTA;
};

export type EmailCTA = {
  href: string;
  name: string;
};
