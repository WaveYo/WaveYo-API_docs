import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomeHero from '@site/src/components/HomeHero';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Core-Plugin architecture high-performance API framework">
      <HomeHero />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
