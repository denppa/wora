import "../styles/globals.css";
import Actions from "@/components/ui/actions";
import Navbar from "@/components/main/navbar";
import Player from "@/components/main/player";
import Head from "next/head";
import { PlayerProvider } from "@/context/playerContext";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/themeProvider";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className="select-none rounded-lg bg-white font-sans text-xs text-black antialiased dark:bg-black dark:text-white">
        <Head>
          <title>Wora</title>
        </Head>
        {["/setup"].includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <PlayerProvider>
            <div className="h-dvh w-dvw">
              <div>
                <Actions />
                <Toaster position="top-right" />
                <div className="flex gap-8">
                  <div className="sticky top-0 z-50 h-dvh p-8 pr-0 pt-12">
                    <Navbar />
                  </div>
                  <div className="h-screen flex-grow p-8 pl-0 pt-10">
                    <div className="wora-transition relative flex h-full w-full flex-col">
                      <Component {...pageProps} />
                      <Player />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PlayerProvider>
        )}
      </main>
    </ThemeProvider>
  );
}
