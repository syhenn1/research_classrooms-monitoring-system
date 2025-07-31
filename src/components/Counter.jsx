import { useEffect, useState } from "react";

const Counter = () => {
  const [totalCount, setTotalCount] = useState(0);

  const fetchTotal = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/total");
      const data = await response.json();

      // Gunakan `data.person` atau `data.total`, tergantung isi backend
      setTotalCount(data.person || data.total || 0);
    } catch (error) {
      console.error("Gagal ambil total:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchTotal, 3000); // ambil tiap 3 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-lg font-semibold">
      Total Deteksi: {totalCount}
    </div>
  );
};

export default Counter;
