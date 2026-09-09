import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>SOROBAN — چرتکه آنلاین</title>
        <meta
          name="description"
          content="SOROBAN یک بازی چرتکه با امتیازدهی، جدول رتبه‌ها و طراحی سوروبان واقعی است."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.hero} dir="rtl">
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroGrain} aria-hidden />

        <nav className={styles.nav}>
          <Link href="/abacus">
            <a className={styles.navCta}>شروع بازی</a>
          </Link>
        </nav>

        <section className={styles.heroStage}>
          <p className={styles.brand}>SOROBAN</p>
          <h1 className={styles.headline}>چرتکه را لمس کن. ذهن را تند کن.</h1>
          <p className={styles.lede}>
            جمع بزن، مهره‌ها را بلغزان، امتیاز بگیر — و در جدول رتبه‌ها بدرخش.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/abacus">
              <a className={styles.ctaPrimary}>وارد میدان شو</a>
            </Link>
            <a href="#how" className={styles.ctaGhost}>
              چطور بازی کنم؟
            </a>
          </div>
        </section>

        <div className={styles.heroVisual} aria-hidden>
          <div className={styles.fakeBoard}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.fakeCol}>
                <span
                  className={`${styles.fakeBead} ${styles.fakeHeaven} ${
                    i % 2 === 0 ? styles.on : ""
                  }`}
                />
                <i className={styles.fakeBar} />
                {[0, 1, 2, 3].map((j) => (
                  <span
                    key={j}
                    className={`${styles.fakeBead} ${styles.fakeEarth} ${
                      j < (i % 4) + 1 ? styles.on : ""
                    }`}
                    style={{ ["--i" as string]: j }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      <section id="how" className={styles.how} dir="rtl">
        <h2>یک قانون ساده</h2>
        <p>
          مهره قرمز بالا = ۵ · مهره‌های روشن پایین = ۱. حاصل مسئله را روی چرتکه بساز تا
          امتیاز بگیری.
        </p>
      </section>
    </>
  );
};

export default Home;
