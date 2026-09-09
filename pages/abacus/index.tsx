import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

const GameShell = dynamic(() => import("../../app/abacus/GameShell"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#1c110a",
        color: "#e4c76b",
        fontFamily: "Vazirmatn, sans-serif",
      }}
    >
      در حال آماده‌سازی چرتکه…
    </div>
  ),
});

const AbacusPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>SOROBAN — بازی چرتکه</title>
        <meta
          name="description"
          content="با چرتکه سوروبان جمع بزن، امتیاز بگیر و در جدول رتبه‌ها بدرخش."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GameShell />
    </>
  );
};

export default AbacusPage;
