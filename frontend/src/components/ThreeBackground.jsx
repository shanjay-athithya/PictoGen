import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function ThreeBackground() {
  const mountRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1200;
    const starPositions = [];

    for (let i = 0; i < starsCount; i++) {
      starPositions.push(
        THREE.MathUtils.randFloatSpread(600),
        THREE.MathUtils.randFloatSpread(600),
        THREE.MathUtils.randFloatSpread(600)
      );
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8,
    });

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // GSAP twinkling animation
    const animateOpacity = () => {
      gsap.to(starsMaterial, {
        opacity: 0.2 + Math.random() * 0.6,
        duration: 2,
        ease: "sine.inOut",
        onComplete: animateOpacity,
      });
    };
    animateOpacity();

    const animate = () => {
      requestAnimationFrame(animate);
      starField.rotation.y += 0.0004;
      starField.rotation.x += 0.0002;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
}
