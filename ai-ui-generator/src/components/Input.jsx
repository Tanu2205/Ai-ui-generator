export default function Input({ placeholder }) {
  return (
    <input
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
    />
  );
}
