// MonitorScreen.jsx - VERSI FINAL DENGAN FIX ASPECT RATIO

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const MonitorScreen = ({ type, cameraIndex }) => {
  const [boxes, setBoxes] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameDimensions = useRef({ width: 1, height: 1 });

  useEffect(() => {
    const socket = io("http://127.0.0.1:8000");

    socket.on("connect", () => console.log("Terhubung ke WebSocket Server"));
    socket.on("disconnect", () => console.log("Terputus dari WebSocket Server"));

    socket.on("detection_data", (data) => {
      setBoxes(data.boxes);
      frameDimensions.current = {
        width: data.frame_width,
        height: data.frame_height,
      };
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const drawBoxes = () => {
      const videoElement = videoRef.current;
      const canvas = canvasRef.current;
      if (!videoElement || !canvas || videoElement.clientWidth === 0) return;

      const ctx = canvas.getContext("2d");
      const containerWidth = videoElement.clientWidth;
      const containerHeight = videoElement.clientHeight;

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      const frameWidth = frameDimensions.current.width;
      const frameHeight = frameDimensions.current.height;

      const frameAspectRatio = frameWidth / frameHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      let renderedWidth, renderedHeight, offsetX, offsetY;

      if (frameAspectRatio > containerAspectRatio) {
        renderedWidth = containerWidth;
        renderedHeight = renderedWidth / frameAspectRatio;
        offsetX = 0;
        offsetY = (containerHeight - renderedHeight) / 2;
      } else {
        renderedHeight = containerHeight;
        renderedWidth = renderedHeight * frameAspectRatio;
        offsetY = 0;
        offsetX = (containerWidth - renderedWidth) / 2;
      }

      const scaleX = renderedWidth / frameWidth;
      const scaleY = renderedHeight / frameHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      boxes.forEach((box) => {
        const x = box.x1 * scaleX + offsetX;
        const y = box.y1 * scaleY + offsetY;
        const width = (box.x2 - box.x1) * scaleX;
        const height = (box.y2 - box.y1) * scaleY;

        const color = box.logged ? "red" : "lime";
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = color;
        ctx.font = "14px Arial";
        const text = `${box.label}: ${box.confidence}`;
        
        const textMetrics = ctx.measureText(text);
        const textBgX = x;
        const textBgY = y > 15 ? y - 15 : y + 5;
        const textBgWidth = textMetrics.width + 4;
        const textBgHeight = 14;

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(textBgX, textBgY, textBgWidth, textBgHeight);

        ctx.fillStyle = color;
        ctx.fillText(text, x + 2, y > 15 ? y - 3 : y + 15);
      });
    };

    drawBoxes();
    const handleResize = () => drawBoxes();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [boxes]);

  return (
    <div className="w-full h-full relative bg-black">
      <img
        ref={videoRef}
        src={`http://127.0.0.1:8000/video_feed/${type}/${cameraIndex}`}
        alt={`Video Stream from Camera ${cameraIndex}`}
        className="w-full h-full object-contain"
        key={`${type}-${cameraIndex}`}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default MonitorScreen;