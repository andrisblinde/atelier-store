import { CampaignBanner } from "@/components/home/campaign-banner";
import { CategoryGrid } from "@/components/home/category-grid";
import { EditorialFeature } from "@/components/home/editorial-feature";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Services } from "@/components/home/services";

// New arrivals come from the database; regenerate the page at most every 5 minutes.
export const revalidate = 300;

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <CategoryGrid />
      <NewArrivals />
      <EditorialFeature />
      <FeaturedCollections />
      <CampaignBanner />
      <Services />
    </main>
  );
}
