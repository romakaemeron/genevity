import Script from "next/script";
import { Mulish, Tenor_Sans } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import ChatWidget from "@/components/chat/ChatWidget";

const GTM_ID = "GTM-PGGK275D";
/** Only this host feeds the production GA4 property. */
const GTM_HOST = "genevity.com.ua";

// Downloaded at build time, self-hosted on Vercel CDN as WOFF2 with subsetting.
// No runtime Google Fonts connection.
const tenorSans = Tenor_Sans({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
  preload: true,
});

// Variable font (wght 200-1000) rather than the four static instances, so
// font-weight interpolates: the mega-menu rail animates 500 -> 600, and static
// faces can only step between the weights they ship. Payload is a wash —
// 8 subset files, ~140 KB, same as before.
const mulish = Mulish({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

/**
 * The `<html>`/`<body>` shell, shared by the two root layouts (public site and
 * admin). It lives here rather than in an `app/layout.tsx` so `lang` can carry
 * the real locale: a single root layout cannot read the `[locale]` param, which
 * left every RU and EN page served as `lang="uk"` to crawlers.
 *
 * `chrome` covers the marketing tag manager, call tracking and chat widget —
 * off for the admin panel, which is noindex and shouldn't feed analytics.
 */
export default function RootHtml({
  lang,
  chrome = true,
  children,
}: {
  lang: string;
  chrome?: boolean;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} className={cn(tenorSans.variable, mulish.variable)}>
      {/* eslint-disable-next-line @next/next/no-head-element -- App Router root
          layouts render <head> directly; next/head is Pages Router only. */}
      <head>
        {chrome && <link rel="preconnect" href="https://www.googletagmanager.com" />}
        {chrome && <link rel="dns-prefetch" href="https://widgets.binotel.com" />}
      </head>
      <body className="antialiased">
        {chrome && (
          <>
            {/* GTM, gated to the live domain. Previews, localhost and the bare
                genevity.vercel.app alias share this container, so without the
                hostname check our own test traffic lands in the production
                property. The dataLayer init has to run before gtm.js, so the
                loader is inlined here rather than split across two Scripts. */}
            <Script id="gtm-init" strategy="afterInteractive">
              {`(function(){var h=location.hostname;if(h!=='${GTM_HOST}'&&h!=='www.${GTM_HOST}')return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';document.head.appendChild(s)})()`}
            </Script>
          </>
        )}
        {children}
        {chrome && (
          <>
            <Script id="binotel-calltracking" strategy="afterInteractive">
              {`(function(d,w,s){var widgetHash='fx083acd84tcu2jfnais',ctw=d.createElement(s);ctw.type='text/javascript';ctw.async=true;ctw.src='//widgets.binotel.com/calltracking/widgets/'+widgetHash+'.js';var sn=d.getElementsByTagName(s)[0];sn.parentNode.insertBefore(ctw,sn);})(document,window,'script');`}
            </Script>
            <Script
              id="binotel-getcall"
              strategy="afterInteractive"
              src="https://widgets.binotel.com/getcall/widgets/qhffh6f0lda5b209o83d.js"
            />
            <Script id="binotel-widget" strategy="afterInteractive">
              {`if(!window.location.pathname.startsWith('/admin')){var _bLoaded=false;function _bLoad(){if(_bLoaded)return;_bLoaded=true;(function(d,w,s){var widgetHash='Af6We2GQH21N1uJMFTL1',bch=d.createElement(s);bch.type='text/javascript';bch.async=true;bch.src='//widgets.binotel.com/chat/widgets/'+widgetHash+'.js';var sn=d.getElementsByTagName(s)[0];sn.parentNode.insertBefore(bch,sn);})(document,window,'script');}['mousemove','touchstart','keydown','click'].forEach(function(e){window.addEventListener(e,_bLoad,{once:true,passive:true});});}`}
            </Script>
            <ChatWidget />
          </>
        )}
      </body>
    </html>
  );
}

/**
 * Font CSS variables, for trees that render outside a root layout — the
 * not-found boundary is rendered without one, so it has to bring its own.
 */
export const fontVariables = cn(tenorSans.variable, mulish.variable);

/** `ua` is the CMS/router code; `uk` is the ISO 639-1 tag browsers and crawlers expect. */
export function htmlLang(locale: string): string {
  return locale === "ua" ? "uk" : locale;
}
