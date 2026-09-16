export default function ProductTitle({ title }) {
  if (!title) return null;

  return (
    <h1
      className="text-4xl font-light leading-tight"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}
