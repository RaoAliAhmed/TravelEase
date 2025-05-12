import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Layout from "../components/Layout";
import { BusProvider } from "@/context/BusContext";
import { FlightProvider } from "@/context/FlightContext";
import { TripProvider } from "@/context/TripContext";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <BusProvider>
        <FlightProvider>
          <TripProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </TripProvider>
        </FlightProvider>
      </BusProvider>
    </SessionProvider>
  );
}
