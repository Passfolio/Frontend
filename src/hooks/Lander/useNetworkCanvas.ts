import { useEffect, useRef } from 'react';

type NetNodeType = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

function runNetworkCanvasAnimation(
  canvasEl: HTMLCanvasElement,
  netCtx: CanvasRenderingContext2D,
) {
  const netNodeList: NetNodeType[] = [];
  let netW = 0;
  let netH = 0;
  let animationFrameId = 0;

  function computeNodeCount() {
    if (!netW || !netH) return 80;
    // area 기반으로 계산해 어떤 화면에서도 체감 조밀도를 비슷하게 유지
    const n = Math.round(netW * netH * 0.00012);
    return Math.min(170, Math.max(26, n));
  }

  function viewportScale() {
    if (!netW || !netH) return 1;
    const s = Math.min(netW, netH) / 720;
    return Math.min(1.15, Math.max(0.72, s));
  }

  function visibilityFactorAtX(x: number) {
    if (!netW) return 1;
    const t = x / netW;
    const leftStart = 0.38;
    const rightStart = 0.58;
    if (t <= leftStart) return 0.84;
    if (t >= rightStart) return 1;
    const blend = (t - leftStart) / (rightStart - leftStart);
    return 0.84 + (1 - 0.84) * blend;
  }

  function initNetNodes() {
    if (!netW || !netH) return;
    netNodeList.length = 0;
    const count = computeNodeCount();
    for (let i = 0; i < count; i++) {
      const n: NetNodeType = {
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
      };
      const t = Math.random();
      const leftBiasedT = t ** 1.22;
      n.x = leftBiasedT * netW;
      n.y = Math.random() * netH;
      netNodeList.push(n);
    }
  }

  function resizeNetworkCanvas() {
    const wrapper = canvasEl.parentElement;
    if (!wrapper) return;
    netW = wrapper.clientWidth;
    netH = wrapper.clientHeight;
    canvasEl.width = netW;
    canvasEl.height = netH;
    initNetNodes();
  }

  function updateNode(node: NetNodeType) {
    if (node.x < 0 || node.x > netW) node.vx *= -1;
    if (node.y < 0 || node.y > netH) node.vy *= -1;
    node.x += node.vx;
    node.y += node.vy;
  }

  function drawNode(node: NetNodeType) {
    netCtx.beginPath();
    netCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    const vis = visibilityFactorAtX(node.x);
    netCtx.fillStyle = `rgba(255, 255, 255, ${0.88 * vis})`;
    netCtx.fill();
  }

  function animateNetwork() {
    if (!netW || !netH) {
      animationFrameId = requestAnimationFrame(animateNetwork);
      return;
    }
    netCtx.clearRect(0, 0, netW, netH);
    const scale = viewportScale();
    const baseMaxD = 160 * scale;
    const leftMaxD = 188 * scale;
    const lineWidth = 1.24 * scale;

    for (let i = 0; i < netNodeList.length; i++) {
      for (let j = i + 1; j < netNodeList.length; j++) {
        const a = netNodeList[i];
        const b = netNodeList[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const midX = (a.x + b.x) * 0.5;
        const midT = netW ? midX / netW : 0.5;
        const localMaxD = midT < 0.45 ? leftMaxD : baseMaxD;
        if (d < localMaxD) {
          netCtx.beginPath();
          const op = 1 - d / localMaxD;
          const vis = visibilityFactorAtX(midX);
          netCtx.strokeStyle = `rgba(255, 255, 255, ${op * 0.23 * vis})`;
          netCtx.lineWidth = lineWidth;
          netCtx.moveTo(a.x, a.y);
          netCtx.lineTo(b.x, b.y);
          netCtx.stroke();
        }
      }
    }
    netNodeList.forEach((node) => {
      updateNode(node);
      drawNode(node);
    });
    animationFrameId = requestAnimationFrame(animateNetwork);
  }

  const handleResize = () => resizeNetworkCanvas();
  window.addEventListener('resize', handleResize);

  const startId = window.setTimeout(() => {
    resizeNetworkCanvas();
    animateNetwork();
  }, 150);

  return () => {
    window.removeEventListener('resize', handleResize);
    window.clearTimeout(startId);
    cancelAnimationFrame(animationFrameId);
  };
}

export function useNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return undefined;

    const netCtx = canvasEl.getContext('2d');
    if (!netCtx) return undefined;

    return runNetworkCanvasAnimation(canvasEl, netCtx);
  }, []);

  return canvasRef;
}
