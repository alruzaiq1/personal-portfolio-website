const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

function updateActiveNavLink() {
  let currentSectionId = "";
  const scrollPosition = window.scrollY + 160;

  const isAtPageBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  if (isAtPageBottom) {
    currentSectionId = sections[sections.length - 1].getAttribute("id");
  } else {
    sections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        currentSectionId = section.getAttribute("id");
      }
    });
  }

  navLinks.forEach((link) => {
    const linkTarget = link.getAttribute("href").replace("#", "");

    link.classList.toggle("is-active", linkTarget === currentSectionId);
  });
}

window.addEventListener("scroll", updateActiveNavLink);
window.addEventListener("resize", updateActiveNavLink);

updateActiveNavLink();

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");

    const menuIsOpen = navMenu.classList.contains("is-open");
    navToggle.setAttribute("aria-expanded", String(menuIsOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}