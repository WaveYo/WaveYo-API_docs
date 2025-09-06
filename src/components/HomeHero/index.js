import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

function HomeHero() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();

  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.logoContainer}>
          <img
            src="/img/logo.svg"
            alt={siteConfig.title}
            className={styles.logo}
          />
        </div>
        <h1 className={styles.title}>{siteConfig.title}</h1>
        <p className={styles.tagline}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <a
            className={styles.ctaButton}
            href="/docs/intro"
          >
            快速开始
          </a>
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
