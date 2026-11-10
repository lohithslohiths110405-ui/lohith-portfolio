const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("#primary-menu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navMenu.classList.toggle("is-open", !isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      navMenu.classList.remove("is-open");
    });
  });
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const visibleProjectCount = document.querySelector("#visible-project-count");
const filterEmpty = document.querySelector(".filter-empty");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const categories = card.dataset.categories?.split(" ") ?? [];
      const shouldShow = selectedFilter === "all" || categories.includes(selectedFilter);
      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (visibleProjectCount) {
      visibleProjectCount.textContent = String(visibleCount).padStart(2, "0");
    }

    if (filterEmpty) {
      filterEmpty.hidden = visibleCount !== 0;
    }
  });
});

const revealItems = document.querySelectorAll("[data-reveal]");

if (revealItems.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const visualizationCanvas = document.querySelector("#data-visualization");

if (visualizationCanvas) {
  const context = visualizationCanvas.getContext("2d");
  const visualizationPanel = visualizationCanvas.closest(".about-visual");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const points = [
    [-0.75, -0.5, 0.6], [0.7, -0.55, 0.35], [0.8, 0.55, 0.58],
    [-0.65, 0.68, 0.32], [-0.15, -0.18, 0.92], [0.24, 0.4, 0.75],
    [-0.46, 0.1, 0.52], [0.55, 0.06, 0.2], [-0.05, 0.74, 0.22],
  ];
  const connections = [[0, 4], [1, 4], [2, 5], [3, 5], [4, 5], [4, 6], [4, 7], [5, 8], [6, 8]];
  const cubeVertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  const cubeEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  let width = 0;
  let height = 0;
  let rotationX = -0.28;
  let rotationY = 0.52;
  let targetRotationX = rotationX;
  let targetRotationY = rotationY;
  let animationFrame;

  const resizeCanvas = () => {
    const bounds = visualizationCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    visualizationCanvas.width = width * pixelRatio;
    visualizationCanvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const rotatePoint = ([x, y, z], xRotation, yRotation) => {
    const cosX = Math.cos(xRotation);
    const sinX = Math.sin(xRotation);
    const cosY = Math.cos(yRotation);
    const sinY = Math.sin(yRotation);
    const rotatedY = y * cosX - z * sinX;
    const rotatedZ = y * sinX + z * cosX;
    return [x * cosY - rotatedZ * sinY, rotatedY, x * sinY + rotatedZ * cosY];
  };

  const projectPoint = (point, scale) => {
    const depth = 4.4 + point[2];
    return [width / 2 + (point[0] * scale * 4.4) / depth, height / 2 + (point[1] * scale * 4.4) / depth];
  };

  const drawVisualization = (time = 0) => {
    rotationX += (targetRotationX - rotationX) * 0.06;
    rotationY += (targetRotationY - rotationY) * 0.06;
    context.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * 0.22;
    const projectedCube = cubeVertices.map((point) => projectPoint(rotatePoint(point, rotationX, rotationY), scale));
    const projectedData = points.map((point) => projectPoint(rotatePoint(point, rotationX, rotationY), scale * 1.05));

    context.lineWidth = 1;
    cubeEdges.forEach(([start, end]) => {
      context.beginPath();
      context.moveTo(...projectedCube[start]);
      context.lineTo(...projectedCube[end]);
      context.strokeStyle = "rgba(200, 255, 54, 0.56)";
      context.shadowColor = "rgba(200, 255, 54, 0.28)";
      context.shadowBlur = 8;
      context.stroke();
    });

    connections.forEach(([start, end]) => {
      context.beginPath();
      context.moveTo(...projectedData[start]);
      context.lineTo(...projectedData[end]);
      context.strokeStyle = "rgba(200, 255, 54, 0.3)";
      context.shadowBlur = 0;
      context.stroke();
    });

    projectedData.forEach(([x, y], index) => {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time / 650 + index) * 0.18;
      context.beginPath();
      context.arc(x, y, (index === 4 ? 5 : 3.2) * pulse, 0, Math.PI * 2);
      context.fillStyle = index === 4 ? "#f5f7f2" : "#c8ff36";
      context.shadowColor = "#c8ff36";
      context.shadowBlur = index === 4 ? 24 : 13;
      context.fill();
    });

    context.beginPath();
    context.arc(width / 2, height / 2, 54, 0, Math.PI * 2);
    context.strokeStyle = "rgba(200, 255, 54, 0.12)";
    context.shadowColor = "rgba(200, 255, 54, 0.35)";
    context.shadowBlur = 22;
    context.stroke();
    context.shadowBlur = 0;
    if (!reducedMotion) {
      targetRotationY += 0.0015;
      animationFrame = requestAnimationFrame(drawVisualization);
    }
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  visualizationPanel?.addEventListener("pointermove", (event) => {
    const bounds = visualizationPanel.getBoundingClientRect();
    targetRotationY = 0.52 + ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.9;
    targetRotationX = -0.28 + ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.6;
  });
  visualizationPanel?.addEventListener("pointerleave", () => {
    targetRotationX = -0.28;
    targetRotationY = 0.52;
  });
  drawVisualization();
}

const certifications = [
  { title: "Data Analysis with Python", issuer: "IBM", verificationUrl: "https://coursera.org/verify/ZU07VA3L2U9T" },
  { title: "Applied Statistics for Data Analytics", issuer: "DeepLearning.AI", verificationUrl: "https://coursera.org/verify/SR3F97BTE9N3" },
  { title: "Machine Learning with Python & Statistics", issuer: "EDUCBA", verificationUrl: "https://coursera.org/verify/LHZT9K3P940W" },
  { title: "Data Analysis and Visualization with Power BI", issuer: "Microsoft", verificationUrl: "https://coursera.org/verify/XHYGHFU4KPZO" },
  { title: "Introduction to Databases", issuer: "Meta", verificationUrl: "https://coursera.org/verify/2ARPUXFKJWE7" },
  { title: "Hadoop Platform and Application Framework", issuer: "UC San Diego", verificationUrl: "https://coursera.org/verify/98XVY91XP7KU" },
  { title: "Neural Networks and Deep Learning", issuer: "DeepLearning.AI", verificationUrl: "https://coursera.org/verify/QF4YBXFKMW1L" },
  { title: "Natural Language Processing with Classification and Vector Spaces", issuer: "DeepLearning.AI", verificationUrl: "https://coursera.org/verify/AKROOEMS038M" },
  { title: "Computer Networks and Network Security", issuer: "IBM", verificationUrl: "https://coursera.org/verify/SLPQT4Y5ESEH" },
  { title: "Software Testing Fundamentals and Methodologies", issuer: "Microsoft", verificationUrl: "https://coursera.org/verify/ICWMH9GBL5WY" },
];

const certificationGrid = document.querySelector("#certification-grid");

if (certificationGrid) {
  certificationGrid.innerHTML = certifications
    .map(
      (certificate, index) => {
        const verificationControl = `<a class="certificate-button certificate-button-active" href="${certificate.verificationUrl}" target="_blank" rel="noopener noreferrer">VIEW CERTIFICATE <span>↗</span></a>`;

        return `
        <article class="certification-card is-visible" data-reveal>
          <div class="certification-card-topline">
            <span class="certification-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="certificate-icon" aria-hidden="true">✦</span>
          </div>
          <h3>${certificate.title}</h3>
          <p>${certificate.issuer}</p>
          <div class="certification-card-footer">
            <span class="certificate-pending">VERIFIED CREDENTIAL</span>
            ${verificationControl}
          </div>
        </article>
      `;
      }
    )
    .join("");
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const formStatus = contactForm.querySelector(".contact-form-status");
  const submitButton = contactForm.querySelector(".contact-submit");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (!formStatus || !submitButton) {
      return;
    }

    formStatus.hidden = false;
    formStatus.className = "contact-form-status is-loading";
    formStatus.textContent = "TRANSMITTING INQUIRY...";
    submitButton.disabled = true;

    try {
      const response = await fetch(contactForm.action || window.location.pathname, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(contactForm)).toString(),
      });

      if (!response.ok) {
        throw new Error(`Contact form submission failed with status ${response.status}.`);
      }

      formStatus.className = "contact-form-status is-success";
      formStatus.textContent = "INQUIRY TRANSMITTED SUCCESSFULLY.";
      contactForm.reset();
    } catch (error) {
      formStatus.className = "contact-form-status is-error";
      formStatus.textContent = "TRANSMISSION FAILED. Please deploy this site with Netlify Forms enabled and try again.";
      console.error(error);
    } finally {
      submitButton.disabled = false;
    }
  });
}

const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const feedbackTargets = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[tabindex]",
  ".project-card",
  ".capability-card",
  ".skill-card",
  ".profile-card",
  ".about-visual",
  ".education-card",
  ".internship-card",
  ".certification-card",
  ".english-credential",
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
];

const createTouchFeedback = (event) => {
  if (reducedMotionPreference.matches) {
    return;
  }

  const target = event.target.closest(feedbackTargets.join(","));
  const feedback = document.createElement("span");
  feedback.className = target ? "touch-feedback" : "touch-feedback touch-feedback-page";
  feedback.style.left = `${event.clientX}px`;
  feedback.style.top = `${event.clientY}px`;
  document.body.append(feedback);

  if (target) {
    target.classList.remove("is-touch-feedback");
    void target.offsetWidth;
    target.classList.add("is-touch-feedback");
    window.setTimeout(() => target.classList.remove("is-touch-feedback"), 560);
  }

  window.setTimeout(() => feedback.remove(), 600);
};

document.addEventListener("pointerdown", createTouchFeedback, { passive: true });
