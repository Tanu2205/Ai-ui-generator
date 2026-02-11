export default function Table({ headers, rows }) {
  return (
    <table className="w-full border border-gray-300">
      <thead>
        <tr>
          {headers?.map((h, i) => (
            <th key={i} className="border p-2 bg-gray-200">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows?.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border p-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
