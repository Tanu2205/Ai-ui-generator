export default function Sidebar({ items }) {
  return (
    <div className="w-48 bg-gray-800 text-white p-4">
      {items?.map((item, index) => (
        <div key={index} className="mb-2 cursor-pointer hover:text-gray-300">
          {item}
        </div>
      ))}
    </div>
  );
}
