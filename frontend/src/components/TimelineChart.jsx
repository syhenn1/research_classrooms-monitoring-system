import React, { useEffect, useRef, useState } from "react";

export default function TimelineLineChart() {
  const canvasRef = useRef(null);
  const [logs, setLogs] = useState([]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const middleY = height / 2;
    ctx.beginPath();
    ctx.moveTo(0, middleY);
    ctx.lineTo(width, middleY);
    ctx.strokeStyle = "#CCCCCC";
    ctx.lineWidth = 2;
    ctx.stroke();

    const grouped = {};
    logs.forEach((log) => {
      const time = new Date(log.time);
      const key = time.toISOString().slice(0, 19); // yyyy-mm-ddThh:mm:ss
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });

    const logTimes = Object.keys(grouped).sort();
    if (logTimes.length === 0) return;

    const spacingX = width / (logTimes.length - 1 || 1);

    const theoryPoints = [];
    const quizPoints = [];

    const maxY = Math.max(...Object.values(grouped).map((logs) => logs.length));
    const yScale = (height / 2 - 20) / (maxY || 1);

    logTimes.forEach((timeKey, index) => {
      const logsAtTime = grouped[timeKey];
      const x = spacingX * index;

      const theoryCount = logsAtTime.filter(
        (log) => log.classtype.toLowerCase() === "theory"
      ).length;
      const quizCount = logsAtTime.filter(
        (log) => log.classtype.toLowerCase() === "quiz"
      ).length;

      theoryPoints.push({ x, y: middleY - theoryCount * yScale });
      quizPoints.push({ x, y: middleY - quizCount * yScale });
    });

    const drawLineWithFill = (points, color, fillColor) => {
      ctx.beginPath();
      points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.lineTo(points[points.length - 1].x, middleY);
      ctx.lineTo(points[0].x, middleY);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    };

    drawLineWithFill(theoryPoints, "#16A34A", "rgba(22,163,74,0.2)"); // Green
    drawLineWithFill(quizPoints, "#DC2626", "rgba(220,38,38,0.2)"); // Red

    // X-axis labels
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    logTimes.forEach((timeKey, index) => {
      const x = spacingX * index;
      const timeObj = new Date(timeKey);
      const timeStr = timeObj.toTimeString().slice(0, 8);
      ctx.fillText(timeStr, x, middleY + 20);
    });
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    drawChart();
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [logs]);

  return (
    <div className="w-full h-64 bg-white rounded-xl shadow-md p-4 relative">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Log Timeline</h2>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
    </div>
  );
}
