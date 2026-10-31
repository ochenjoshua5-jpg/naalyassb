"use client";

import { useEffect } from "react";
import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { SCHOOL } from "@/lib/site";

/*
 * Cookie banner (vanilla-cookieconsent v3). Essential storage is ticked and cannot be switched off.
 * Analytics and marketing start unticked, and nothing in those categories loads without a tick.
 * The wording below must stay true to what the site actually does. If that changes, update it here
 * and in the privacy notice.
 */
const T = {
  consentModal: {
    title: "Cookies on this site",
    description:
      "We use only essential storage. It keeps the site working and remembers this choice. We do not use analytics or marketing cookies on this site at present.",
    acceptAllBtn: "Accept all",
    acceptNecessaryBtn: "Only essential",
    showPreferencesBtn: "Manage choices",
    footer: `<a href="/privacy">Privacy notice</a>`,
  },
  preferencesModal: {
    title: "Cookie choices",
    acceptAllBtn: "Accept all",
    acceptNecessaryBtn: "Only essential",
    savePreferencesBtn: "Save my choices",
    closeIconLabel: "Close",
    sections: [
      {
        title: "Essential",
        description: "Needed for the site to work, for example to remember your cookie choice. These cannot be switched off.",
        linkedCategory: "necessary",
      },
      {
        title: "Analytics",
        description: "Helps us understand how the site is used. Off unless you turn it on. Not used at present.",
        linkedCategory: "analytics",
      },
      {
        title: "Marketing",
        description: "Used for advertising. Off unless you turn it on. Not used at present.",
        linkedCategory: "marketing",
      },
      {
        title: "More information",
        description: `Read the <a href="/privacy">privacy notice</a> for ${SCHOOL.name}, ${SCHOOL.campus}.`,
      },
    ],
  },
};

export function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      mode: "opt-in",
      revision: 1,
      autoShow: true,
      hideFromBots: true,
      cookie: { name: "naalya_cookie_consent", expiresAfterDays: 180, sameSite: "Lax", secure: true },
      guiOptions: {
        consentModal: { layout: "box", position: "bottom left", equalWeightButtons: true, flipButtons: false },
        preferencesModal: { layout: "box", equalWeightButtons: true, flipButtons: false },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: { enabled: false, readOnly: false },
        marketing: { enabled: false, readOnly: false },
      },
      language: { default: "en", translations: { en: T } },
    });
  }, []);

  return null;
}
