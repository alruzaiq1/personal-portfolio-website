(() => {
  "use strict";

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");

  if (sections.length && navLinks.length) {
    const linksBySectionId = new Map(
      navLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]),
    );
    const linkedSections = sections
      .filter((section) => linksBySectionId.has(section.id))
      .map((section) => ({ section, link: linksBySectionId.get(section.id) }));

    let navFrame = 0;

    const updateActiveNavLink = () => {
      navFrame = 0;
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
      const activationLine = headerHeight + Math.min(120, window.innerHeight * 0.2);
      const atPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let activeLink = null;

      if (atPageBottom && linkedSections.length) {
        activeLink = linkedSections[linkedSections.length - 1].link;
      } else {
        linkedSections.forEach(({ link, section }) => {
          if (section.getBoundingClientRect().top <= activationLine) {
            activeLink = link;
          }
        });
      }

      navLinks.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const requestNavUpdate = () => {
      if (!navFrame) {
        navFrame = window.requestAnimationFrame(updateActiveNavLink);
      }
    };

    window.addEventListener("scroll", requestNavUpdate, { passive: true });
    window.addEventListener("resize", requestNavUpdate, { passive: true });
    window.addEventListener("load", requestNavUpdate, { once: true });
    requestNavUpdate();
  }

  if (navToggle && navMenu) {
    const mobileNav = window.matchMedia("(max-width: 700px)");
    document.documentElement.classList.add("js-nav");

    const setMenuState = (isOpen, restoreFocus = false) => {
      navMenu.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );

      if (restoreFocus) {
        navToggle.focus();
      }
    };

    setMenuState(false);

    navToggle.addEventListener("click", () => {
      setMenuState(!navMenu.classList.contains("is-open"));
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenuState(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navMenu.classList.contains("is-open") &&
        !navMenu.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        setMenuState(false, true);
      }
    });

    mobileNav.addEventListener?.("change", (event) => {
      if (!event.matches) {
        setMenuState(false);
      }
    });
  }

  const heroArt = document.querySelector(".hero-art");
  const canvas = heroArt?.querySelector("canvas#particle-field");
  const motionToggle = heroArt?.querySelector(".motion-toggle");

  if (!heroArt || !canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    return;
  }

  try {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 700px)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let particles = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastTime = 0;
    let phase = 0;
    let isIntersecting = true;
    let isManuallyPaused = false;

    const createParticles = () => {
      const count = smallScreen.matches ? 840 : 1760;
      const goldenRatio = 0.618033988749895;
      const silverRatio = 0.414213562373095;

      particles = Array.from({ length: count }, (_, index) => ({
        u: Math.PI * 2 * ((index * goldenRatio) % 1),
        v: Math.PI * 2 * ((index * silverRatio + index / count) % 1),
        shimmer: (index * 47) % 101,
      }));
    };

    const drawFrame = () => {
      context.clearRect(0, 0, width, height);

      const centerX = width * (smallScreen.matches ? 0.52 : 0.54);
      const centerY = height * 0.5;
      const scale = Math.min(width * 0.29, height * 0.36);
      const tiltX = -0.78 + pointer.y * 0.12;
      const tiltY = 0.62 + pointer.x * 0.16;
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);
      const projected = [];

      particles.forEach((particle) => {
        const wave = Math.sin(particle.u * 3 - phase * 1.35 + particle.v) * 0.09;
        const minorRadius = 0.43 + wave;
        const ringRadius = 1.06 + minorRadius * Math.cos(particle.v);
        let x = ringRadius * Math.cos(particle.u);
        let y = minorRadius * Math.sin(particle.v);
        let z = ringRadius * Math.sin(particle.u);

        const rotatedY = y * cosX - z * sinX;
        const rotatedZ = y * sinX + z * cosX;
        y = rotatedY;
        z = rotatedZ;

        const rotatedX = x * cosY + z * sinY;
        z = -x * sinY + z * cosY;
        x = rotatedX;
        y += Math.sin(x * 2.2 + phase) * 0.12;

        const perspective = 3.5 / (3.5 + z);
        projected.push({
          x: centerX + x * scale * perspective,
          y: centerY + y * scale * perspective,
          z,
          size: Math.max(0.45, 1.25 * perspective),
          shimmer: particle.shimmer,
        });
      });

      projected.sort((a, b) => b.z - a.z);
      projected.forEach((point) => {
        const depth = Math.max(0, Math.min(1, (1.8 - point.z) / 3.6));
        const alpha = 0.18 + depth * 0.72;
        const green = Math.round(74 + depth * 58 + (point.shimmer > 94 ? 34 : 0));
        context.beginPath();
        context.arc(point.x, point.y, point.size * (0.75 + depth * 0.55), 0, Math.PI * 2);
        context.fillStyle = `rgba(255, ${green}, 24, ${alpha})`;
        context.fill();
      });
    };

    const resizeCanvas = () => {
      const bounds = heroArt.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      if (
        nextWidth === width &&
        nextHeight === height &&
        canvas.width === Math.round(nextWidth * dpr)
      ) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
    };

    const canAnimate = () =>
      !reducedMotion.matches && !isManuallyPaused && !document.hidden && isIntersecting;

    const updateMotionControl = () => {
      if (!motionToggle) {
        return;
      }

      const isPaused = reducedMotion.matches || isManuallyPaused;
      const label = isPaused ? "Play particle animation" : "Pause particle animation";
      motionToggle.textContent = isPaused ? "Play motion" : "Pause motion";
      motionToggle.setAttribute("aria-label", label);
      motionToggle.setAttribute("aria-pressed", String(isPaused));
      motionToggle.hidden = reducedMotion.matches;
    };

    const animate = (time) => {
      animationFrame = 0;
      const elapsed = lastTime ? Math.min(32, time - lastTime) : 16;
      lastTime = time;
      phase += elapsed * 0.00018;
      pointer.x += (pointer.targetX - pointer.x) * 0.035;
      pointer.y += (pointer.targetY - pointer.y) * 0.035;
      drawFrame();

      if (canAnimate()) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const syncAnimation = () => {
      if (canAnimate()) {
        if (!animationFrame) {
          lastTime = 0;
          animationFrame = window.requestAnimationFrame(animate);
        }
      } else {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastTime = 0;
        drawFrame();
      }
    };

    createParticles();
    resizeCanvas();
    canvas.setAttribute("aria-hidden", "true");
    heroArt.classList.add("has-canvas");
    updateMotionControl();
    syncAnimation();

    motionToggle?.addEventListener("click", () => {
      isManuallyPaused = !isManuallyPaused;
      updateMotionControl();
      syncAnimation();
    });

    heroArt.addEventListener(
      "pointermove",
      (event) => {
        if (reducedMotion.matches) {
          return;
        }

        const bounds = heroArt.getBoundingClientRect();
        pointer.targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        pointer.targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      },
      { passive: true },
    );

    heroArt.addEventListener("pointerleave", () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });

    document.addEventListener("visibilitychange", syncAnimation);

    reducedMotion.addEventListener?.("change", () => {
      pointer.x = 0;
      pointer.y = 0;
      pointer.targetX = 0;
      pointer.targetY = 0;
      updateMotionControl();
      syncAnimation();
    });

    smallScreen.addEventListener?.("change", () => {
      createParticles();
      resizeCanvas();
      drawFrame();
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeCanvas).observe(heroArt);
    } else {
      window.addEventListener("resize", resizeCanvas, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting;
          syncAnimation();
        },
        { threshold: 0.02 },
      ).observe(heroArt);
    }
  } catch (error) {
    heroArt.classList.remove("has-canvas");
    console.warn("Particle field could not be initialized.", error);
  }
})();
