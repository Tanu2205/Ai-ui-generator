export default function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
