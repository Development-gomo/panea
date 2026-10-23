export default function GenericFullWidthContent({ data }) {
  const content = data?.content || "";
  if (!content) return null;

  return (
    <section className="w-full py-[60px] md:py-[120px]">
      <div className="web-width-sm mx-auto px-6">
        <div
          className="insight-wysiwyg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
