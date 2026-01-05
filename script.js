/* ================================
   GLOBAL ELEMENTS & VARIABLES
================================ */
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;
let lastKnownScroll = 0;
let ticking = false;

/* ================================
   SKILLS (CIRCULAR PROGRESS)
================================ */
const skillSection = document.querySelector('#about');
const progressBars = document.querySelectorAll('.progress-ring__bar');
const counters = document.querySelectorAll('.counter');
let skillsAnimated = false;

/* ================================
   SMART HEADER + SCROLL LOGIC
================================ */
if (navbar) {
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateNavbar(lastScrollY);
                animateSkills(lastScrollY);
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateNavbar(scrollY) {
    // 1. Sticky / Glass Effect
    if (scrollY > 20) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }

    // 2. Hide on scroll down, show on scroll up
    if (scrollY > lastKnownScroll && scrollY > 100) {
        navbar.classList.add('navbar-hidden');
    } else {
        navbar.classList.remove('navbar-hidden');
    }

    lastKnownScroll = scrollY;
}

/* ================================
   CIRCULAR PROGRESS ANIMATION
================================ */
function animateSkills() {
    if (!skillSection || skillsAnimated) return;

    const sectionPos = skillSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;

    if (sectionPos < screenPos) {
        // Animate Circles
        progressBars.forEach(bar => {
            const percent = bar.getAttribute('data-percent');
            const circumference = 326; // 2 * π * r (r=52)
            const offset = circumference - (percent / 100) * circumference;
            bar.style.strokeDashoffset = offset;
        });

        // Animate Numbers
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const speed = 200;
            let count = 0;

            const updateCount = () => {
                const inc = target / speed;
                if (count < target) {
                    count += inc;
                    counter.innerText = Math.ceil(count);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });

        skillsAnimated = true; // Run only once
    }
}

/* ================================
   AOS INITIALIZATION (SAFE)
================================ */
if (typeof AOS !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AOS.init({
            duration: 1000,
            offset: 100,
            easing: 'ease-out',
            once: true
        });
    });
}

/* ================================
   TYPEWRITER EFFECT (ES6)
================================ */
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.isDeleting = false;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        this.txt = this.isDeleting
            ? fullTxt.substring(0, this.txt.length - 1)
            : fullTxt.substring(0, this.txt.length + 1);

        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        let typeSpeed = this.isDeleting ? 100 : 200;

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

/* ================================
   INIT TYPEWRITER ON LOAD
================================ */
document.addEventListener('DOMContentLoaded', () => {
    const txtElement = document.querySelector('.txt-type');
    if (txtElement) {
        const words = JSON.parse(txtElement.getAttribute('data-words'));
        const wait = txtElement.getAttribute('data-wait');
        new TypeWriter(txtElement, words, wait);
    }
});

/* --- CONTACT FORM HANDLING (AJAX) --- */
const form = document.getElementById("my-form");

async function handleSubmit(event) {
    event.preventDefault(); // 1. Stop the page from reloading/redirecting
    
    const status = document.getElementById("my-form-status");
    const data = new FormData(event.target);
    
    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            // 2. Success: Clear form and show message
            status.innerHTML = "Message Transmitted Successfully! ✅";
            status.style.color = "#10b981"; // Green color
            form.reset(); // This CLEARS the inputs
        } else {
            // Error handling
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                } else {
                    status.innerHTML = "Transmission Failed. Please try again.";
                }
                status.style.color = "#ef4444"; // Red color
            })
        }
    }).catch(error => {
        status.innerHTML = "Network Error. Check connection.";
        status.style.color = "#ef4444";
    });
}

form.addEventListener("submit", handleSubmit);

/* --- SCROLL TO TOP BUTTON --- */
const scrollTopBtn = document.getElementById("scroll-top");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add("active");
    } else {
        scrollTopBtn.classList.remove("active");
    }
});


