import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";

const tenorSans = localFont({
  src: "../../public/fonts/TenorSans-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
});

const mulish = localFont({
  src: [
    { path: "../../public/fonts/Mulish-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Mulish-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Mulish-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/Mulish-Bold.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${tenorSans.variable} ${mulish.variable}`}>
      <head>
        {/* Preconnect for third-party origins used after load */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://widgets.binotel.com" />
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-PGGK275D"
        />
        <Script id="gtm-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'})`}
        </Script>
      </head>
      <body className="antialiased">
        {children}
        <Script id="binotel-widget" strategy="afterInteractive">
          {`if(!window.location.pathname.startsWith('/admin')){var _bLoaded=false;function _bLoad(){if(_bLoaded)return;_bLoaded=true;(function(d,w,s){var widgetHash='Af6We2GQH21N1uJMFTL1',bch=d.createElement(s);bch.type='text/javascript';bch.async=true;bch.src='//widgets.binotel.com/chat/widgets/'+widgetHash+'.js';var sn=d.getElementsByTagName(s)[0];sn.parentNode.insertBefore(bch,sn);})(document,window,'script');}window.addEventListener('scroll',_bLoad,{once:true,passive:true});setTimeout(_bLoad,5000);}`}
        </Script>
      </body>
    </html>
  );
}
