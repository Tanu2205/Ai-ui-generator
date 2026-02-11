export default function Chart({ title }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="h-32 bg-blue-200 rounded" />
    </div>
  );
}
