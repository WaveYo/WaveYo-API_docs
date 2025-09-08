import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

function HomeHero() {
  const { siteConfig } = useDocusaurusContext();
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText('pipx install yoapi-cli && yoapi init');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy command: ', err);
    }
  };

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
            href="/docs/start/overview"
          >
            快速开始
          </a>
        </div>
        <div className={styles.commandContainer}>
          <div className={styles.commandDisplay}>
            <code className={styles.commandText}>pipx install yoapi-cli && yoapi init</code>
            <button 
              className={styles.copyButton}
              onClick={copyCommand}
              aria-label="复制命令"
            >
              {copied ? '已复制!' : '复制'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
