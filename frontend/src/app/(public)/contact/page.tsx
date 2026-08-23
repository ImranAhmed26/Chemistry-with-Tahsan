import { ContactForm } from "@/components/public/ContactForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { getPublicTenant } from "@/lib/public";

export default async function ContactPage() {
  const tenant = await getPublicTenant();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Contact</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-500">
        The fastest way to reach us is WhatsApp. You can also send a quick
        inquiry below.
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Get in touch</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>WhatsApp: +{tenant?.whatsapp || "8801805722207"}</li>
            {tenant?.phone && <li>Phone: {tenant.phone}</li>}
            {tenant?.email && <li>Email: {tenant.email}</li>}
            <li>Location: {tenant?.address || "Uttara, Dhaka"}</li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {tenant?.facebookUrl && (
              <a href={tenant.facebookUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
                Facebook
              </a>
            )}
            {tenant?.instagramUrl && (
              <a href={tenant.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
                Instagram
              </a>
            )}
            {tenant?.youtubeUrl && (
              <a href={tenant.youtubeUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
                YouTube
              </a>
            )}
          </div>

          <WhatsAppButton className="mt-6" message="Hi, I'd like to get in touch." />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Send an inquiry</h2>
          <div className="mt-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
