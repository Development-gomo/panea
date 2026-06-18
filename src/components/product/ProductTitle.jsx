export default function ProductTitle({ title }) {
  if (!title) return null;

  return (
    <h1
      className="text-4xl md:text-6xl font-semibold leading-tight"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}
