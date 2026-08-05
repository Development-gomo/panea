export default function NumberedListItem({ index, children }) {
  return (
    <article
      className={`grid grid-cols-[28px_minmax(0,1fr)] gap-1 md:grid-cols-[32px_minmax(0,1fr)] ${
        index > 0 ? "pt-5" : ""
      }`}
    >
      <span className="ff-larken pt-[10px] text-[16px] leading-none font-light text-(--color-body) italic">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="border-b border-[#1E2E31]/20 pb-4">{children}</div>
    </article>
  );
}
