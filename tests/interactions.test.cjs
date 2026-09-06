const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

class EventTargetStub {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, event = {}) {
    event.type = type;
    event.target ||= this;
    for (const listener of this.listeners.get(type) || []) {
      listener(event);
    }
  }
}

class ClassListStub {
  constructor() {
    this.values = new Set();
  }

  add(name) {
    this.values.add(name);
  }

  remove(name) {
    this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.contains(name) : force;
    enabled ? this.add(name) : this.remove(name);
    return enabled;
  }
}

class ElementStub extends EventTargetStub {
  constructor({ id = "", hash = "", top = 0, width = 640, height = 480 } = {}) {
    super();
    this.id = id;
    this.hash = hash;
    this.top = top;
    this.width = width;
    this.height = height;
    this.offsetHeight = height;
    this.attributes = new Map();
    this.classList = new ClassListStub();
    this.hidden = false;
    this.focused = false;
    this.parent = null;
    this.textContent = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  getBoundingClientRect() {
    return { top: this.top, left: 0, width: this.width, height: this.height };
  }

  contains(element) {
    for (let current = element; current; current = current.parent) {
      if (current === this) return true;
    }
    return false;
  }

  closest(selector) {
    return selector === "a" && this.hash ? this : null;
  }

  focus() {
    this.focused = true;
  }
}

function createEnvironment({ sections = [], navLinks = [], mobile = true, reduced = false, canvas = false } = {}) {
  const window = new EventTargetStub();
  const document = new EventTargetStub();
  const header = new ElementStub({ height: 64 });
  const navToggle = navLinks.length ? new ElementStub() : null;
  const navMenu = navLinks.length ? new ElementStub() : null;
  const documentElement = new ElementStub();
  documentElement.scrollHeight = 2600;
  document.documentElement = documentElement;
  document.hidden = false;

  if (navMenu) {
    navLinks.forEach((link) => {
      link.parent = navMenu;
    });
  }

  let heroArt = null;
  let canvasElement = null;
  let motionToggle = null;
  let drawCount = 0;

  if (canvas) {
    heroArt = new ElementStub({ width: 720, height: 520 });
    canvasElement = new ElementStub();
    motionToggle = new ElementStub();
    motionToggle.hidden = true;
    canvasElement.getContext = () => ({
      clearRect() {},
      setTransform() {},
      beginPath() {},
      arc() {},
      fill() {
        drawCount += 1;
      },
      set fillStyle(value) {
        this.color = value;
      },
    });
    heroArt.querySelector = (selector) =>
      selector === "canvas#particle-field" ? canvasElement : motionToggle;
  }

  document.querySelectorAll = (selector) => {
    if (selector === "main section[id]") return sections;
    if (selector === ".nav-links a[href^='#']") return navLinks;
    return [];
  };
  document.querySelector = (selector) => {
    if (selector === ".site-header") return header;
    if (selector === ".nav-toggle") return navToggle;
    if (selector === ".nav-links") return navMenu;
    if (selector === ".hero-art") return heroArt;
    return null;
  };
  document.getElementById = (id) => sections.find((section) => section.id === id) || null;

  const media = new Map();
  window.matchMedia = (query) => {
    if (!media.has(query)) {
      const target = new EventTargetStub();
      target.matches = query.includes("prefers-reduced-motion") ? reduced : mobile;
      target.emit = (matches) => {
        target.matches = matches;
        target.dispatch("change", { matches });
      };
      media.set(query, target);
    }
    return media.get(query);
  };

  let nextFrameId = 1;
  const frames = new Map();
  window.requestAnimationFrame = (callback) => {
    const id = nextFrameId++;
    frames.set(id, callback);
    return id;
  };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  window.flushAnimationFrames = (time = 16) => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(time));
  };
  window.innerHeight = 800;
  window.scrollY = 0;
  window.devicePixelRatio = 2;

  const intersectionObservers = [];
  class IntersectionObserverStub {
    constructor(callback) {
      this.callback = callback;
      intersectionObservers.push(this);
    }

    observe(target) {
      this.target = target;
    }
  }

  class ResizeObserverStub {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.target = target;
    }
  }

  window.IntersectionObserver = IntersectionObserverStub;
  window.ResizeObserver = ResizeObserverStub;

  vm.runInNewContext(script, {
    console,
    document,
    window,
    IntersectionObserver: IntersectionObserverStub,
    ResizeObserver: ResizeObserverStub,
  });

  return {
    canvasElement,
    document,
    drawCount: () => drawCount,
    frames,
    heroArt,
    intersectionObservers,
    media,
    motionToggle,
    navMenu,
    navToggle,
    window,
  };
}

test("active navigation follows section document order, not link order", () => {
  const hero = new ElementStub({ id: "hero", top: -900 });
  const projects = new ElementStub({ id: "projects", top: -300 });
  const about = new ElementStub({ id: "about", top: -100 });
  const skills = new ElementStub({ id: "skills", top: 600 });
  const contact = new ElementStub({ id: "contact", top: 1200 });
  const links = ["about", "skills", "projects", "contact"].map(
    (id) => new ElementStub({ hash: `#${id}` }),
  );
  const environment = createEnvironment({
    sections: [hero, projects, about, skills, contact],
    navLinks: links,
  });

  environment.window.flushAnimationFrames();

  assert.equal(links[0].getAttribute("aria-current"), "location");
  assert.equal(links[2].getAttribute("aria-current"), null);
  assert.equal(links[0].classList.contains("is-active"), true);
});

test("mobile menu closes for selection, Escape, and desktop resize", () => {
  const section = new ElementStub({ id: "about" });
  const link = new ElementStub({ hash: "#about" });
  const environment = createEnvironment({ sections: [section], navLinks: [link] });

  environment.navToggle.dispatch("click");
  assert.equal(environment.navMenu.classList.contains("is-open"), true);
  assert.equal(environment.navToggle.getAttribute("aria-label"), "Close navigation menu");

  environment.navMenu.dispatch("click", { target: link });
  assert.equal(environment.navMenu.classList.contains("is-open"), false);

  environment.navToggle.dispatch("click");
  environment.document.dispatch("keydown", { key: "Escape" });
  assert.equal(environment.navMenu.classList.contains("is-open"), false);
  assert.equal(environment.navToggle.focused, true);

  environment.navToggle.dispatch("click");
  environment.media.get("(max-width: 700px)").emit(false);
  assert.equal(environment.navMenu.classList.contains("is-open"), false);
  assert.equal(environment.navToggle.getAttribute("aria-expanded"), "false");
});

test("reduced motion renders a static canvas without scheduling animation", () => {
  const environment = createEnvironment({ canvas: true, reduced: true });

  assert.equal(environment.heroArt.classList.contains("has-canvas"), true);
  assert.equal(environment.canvasElement.getAttribute("aria-hidden"), "true");
  assert.equal(environment.motionToggle.hidden, true);
  assert.ok(environment.drawCount() > 0);
  assert.equal(environment.frames.size, 0);
});

test("motion control and lifecycle signals stop and resume animation", () => {
  const environment = createEnvironment({ canvas: true });

  assert.equal(environment.motionToggle.hidden, false);
  assert.equal(environment.motionToggle.getAttribute("aria-pressed"), "false");
  assert.ok(environment.frames.size > 0);

  environment.motionToggle.dispatch("click");
  assert.equal(environment.motionToggle.textContent, "Play motion");
  assert.equal(environment.motionToggle.getAttribute("aria-pressed"), "true");
  assert.equal(environment.frames.size, 0);

  environment.motionToggle.dispatch("click");
  assert.ok(environment.frames.size > 0);

  environment.intersectionObservers[0].callback([{ isIntersecting: false }]);
  assert.equal(environment.frames.size, 0);

  environment.intersectionObservers[0].callback([{ isIntersecting: true }]);
  assert.ok(environment.frames.size > 0);

  environment.document.hidden = true;
  environment.document.dispatch("visibilitychange");
  assert.equal(environment.frames.size, 0);
});
