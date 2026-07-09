export default function ProductTitle({ title }) {
  if (!title) return null;

  return (
    <h1
      className="text-4xl font-semibold leading-tight"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}
