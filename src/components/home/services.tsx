const services = [
  {
    title: "Complimentary shipping",
    body: "Free express delivery on every order, packed in our signature box.",
  },
  {
    title: "Easy returns",
    body: "Return or exchange within 30 days, with collection from your door.",
  },
  {
    title: "Gift wrapping",
    body: "Add a handwritten note and ribbon at checkout, at no extra cost.",
  },
  {
    title: "Client services",
    body: "Our advisors are available seven days a week by phone or chat.",
  },
];

export function Services() {
  return (
    <section aria-label="Our services" className="border-t">
      <ul className="container-page grid gap-x-gutter gap-y-10 py-section sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <li key={service.title}>
            <h3 className="type-label">{service.title}</h3>
            <p className="type-small mt-2 max-w-xs text-ink-muted">{service.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
