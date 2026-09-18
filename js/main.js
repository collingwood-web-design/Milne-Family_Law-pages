(() => {
  const dateEl = document.querySelector("[data-copyright-date]");
  if (dateEl) {
    dateEl.textContent = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const onScroll = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 480);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const revealEls = [...document.querySelectorAll(".reveal")];
  if (revealEls.length) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => revealIo.observe(el));
    }
  }

  const streamVideo = document.querySelector("video[data-stream-src]");
  if (streamVideo) {
    const videoWrap = streamVideo.closest(".video");
    const playBtn = videoWrap?.querySelector(".video__play");
    const src = streamVideo.getAttribute("data-stream-src");
    let loaded = false;

    const setPlaying = (playing) => {
      videoWrap?.classList.toggle("is-playing", playing);
    };

    const loadStream = () =>
      new Promise((resolve) => {
        if (loaded || !src) {
          resolve();
          return;
        }
        loaded = true;

        if (streamVideo.canPlayType("application/vnd.apple.mpegurl")) {
          streamVideo.src = src;
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
        script.onload = () => {
          if (!window.Hls || !window.Hls.isSupported()) {
            resolve();
            return;
          }
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(streamVideo);
          resolve();
        };
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });

    const playVideo = async () => {
      await loadStream();
      try {
        await streamVideo.play();
        setPlaying(true);
      } catch (_) {
        setPlaying(false);
      }
    };

    playBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      playVideo();
    });

    streamVideo.addEventListener("play", () => setPlaying(true));
    streamVideo.addEventListener("playing", () => setPlaying(true));
    streamVideo.addEventListener("pause", () => setPlaying(false));
    streamVideo.addEventListener("ended", () => setPlaying(false));

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadStream();
            io.disconnect();
          }
        },
        { rootMargin: "200px" }
      );
      io.observe(streamVideo);
    } else {
      loadStream();
    }
  }

  const root = document.querySelector("[data-slider]");
  if (!root) return;

  const slides = [...root.querySelectorAll(".testimonial")];
  const dotsWrap = root.querySelector(".testimonial-slider__dots");
  const prev = root.querySelector(".testimonial-slider__arrow--prev");
  const next = root.querySelector(".testimonial-slider__arrow--next");
  let index = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));
  const EXCERPT_LIMIT = 220;

  slides.forEach((slide) => {
    const textEl = slide.querySelector("blockquote p");
    if (!textEl) return;
    const full = textEl.textContent.trim();
    if (full.length <= EXCERPT_LIMIT) return;

    let cut = full.lastIndexOf(" ", EXCERPT_LIMIT);
    if (cut < 80) cut = EXCERPT_LIMIT;
    const excerpt = full.slice(0, cut).trimEnd() + "…";
    textEl.textContent = excerpt;

    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "testimonial__more";
    moreBtn.textContent = "Read more";
    moreBtn.addEventListener("click", () => {
      const open = moreBtn.getAttribute("aria-expanded") === "true";
      textEl.textContent = open ? excerpt : full;
      moreBtn.textContent = open ? "Read more" : "Read less";
      moreBtn.setAttribute("aria-expanded", String(!open));
    });
    moreBtn.setAttribute("aria-expanded", "false");
    textEl.parentElement.insertAdjacentElement("afterend", moreBtn);
  });

  const dots = slides.map((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    btn.addEventListener("click", () => go(i));
    dotsWrap.appendChild(btn);
    return btn;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => slide.classList.toggle("is-active", n === index));
    dots.forEach((dot, n) => dot.classList.toggle("is-active", n === index));
  }

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  go(index);
})();
