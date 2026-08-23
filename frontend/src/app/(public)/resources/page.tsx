import { ResourceCard } from "@/components/public/ResourceCard";
import { EmptyState } from "@/components/ui/States";
import { getPublicResources } from "@/lib/public";

export default async function ResourcesPage() {
  const resources = await getPublicResources();
  const freeResources = resources.filter((r) => !r.price || r.price <= 0);
  const paidResources = resources.filter((r) => r.price && r.price > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="mt-2 text-sm text-gray-500">
          Notes, revision maps, question papers and exam packs — built from
          17+ years of classroom teaching. Message on WhatsApp to purchase;
          checkout is handled directly, no online payment yet.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Resources coming soon"
            description="Notes and free sample PDFs will be listed here shortly."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {freeResources.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Free Resources</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
                {freeResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
          {paidResources.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900">PDF Store</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
                {paidResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
