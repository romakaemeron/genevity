import Script from "next/script";
import { Mulish, Tenor_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ChatWidget from "@/components/chat/ChatWidget";

// Downloaded at build time, self-hosted on Vercel CDN as WOFF2 with subsetting.
// No runtime Google Fonts connection.
const tenorSans = Tenor_Sans({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
  preload: true,
});

const mulish = Mulish({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={cn(tenorSans.variable, mulish.variable)}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://widgets.binotel.com" />
      </head>
      <body className="antialiased">
        {/* GTM: dataLayer init must run before gtm.js — Script must be in body, not head */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'})`}
        </Script>
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-PGGK275D"
        />
        {children}
        <Script id="binotel-widget" strategy="afterInteractive">
          {`if(!window.location.pathname.startsWith('/admin')){var _bLoaded=false;function _bLoad(){if(_bLoaded)return;_bLoaded=true;(function(d,w,s){var widgetHash='Af6We2GQH21N1uJMFTL1',bch=d.createElement(s);bch.type='text/javascript';bch.async=true;bch.src='//widgets.binotel.com/chat/widgets/'+widgetHash+'.js';var sn=d.getElementsByTagName(s)[0];sn.parentNode.insertBefore(bch,sn);})(document,window,'script');}['mousemove','touchstart','keydown','click'].forEach(function(e){window.addEventListener(e,_bLoad,{once:true,passive:true});});}`}
        </Script>
        <ChatWidget />
      </body>
    </html>
  );
}
