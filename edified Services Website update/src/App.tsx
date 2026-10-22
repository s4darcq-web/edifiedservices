import { useEffect, useMemo, useState, type ReactNode } from "react"
import { courses, generalFaqs, photos, services, type Course } from "./data"

type IconName = "arrow" | "building" | "check" | "chevron" | "compass" | "heart" | "home" | "leaf" | "menu" | "people" | "path" | "school" | "search" | "spark" | "x"

const iconPaths: Record<IconName, ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </>
  ),
  building: (
    <>
      <path d="M4 21h16" />
      <path d="M6 21V5l6-3 6 3v16" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 4-4 2 2-4 4-2Z" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c-8 0-14 4-14 10 0 3 2 5 5 5 6 0 9-7 9-15Z" />
      <path d="M4 21c2-5 6-8 12-11" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  path: (
    <>
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M8.5 16.5c1.5-1 2-2 2-4s1-3 3-4l2-1" />
    </>
  ),
  school: (
    <>
      <path d="m3 10 9-5 9 5-9 5-9-5Z" />
      <path d="M7 13v4c3 2 7 2 10 0v-4M21 10v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function navigate(href: string) {
  window.history.pushState({}, "", href)
  window.dispatchEvent(new PopStateEvent("popstate"))
  const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : ""
  if (hash) {
    window.setTimeout(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

function Link({
  href,
  className = "",
  children,
  onClick,
}: {
  href: string
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          href.startsWith("http")
        )
          return
        event.preventDefault()
        navigate(href)
        onClick?.()
      }}
    >
      {children}
    </a>
  )
}

function ButtonLink({
  href,
  children,
  variant = "primary",
  icon = true,
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary" | "teal" | "light"
  icon?: boolean
}) {
  return (
    <Link href={href} className={`button button--${variant}`}>
      {children}
      {icon && <Icon name="arrow" size={18} />}
    </Link>
  )
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Our Services", href: "/our-services/" },
]

function Wordmark() {
  return (
    <span className="wordmark" aria-label="Edified Services">
      <span className="wordmark__mark">E</span>
      <span>
        <strong>EDIFIED</strong>
        <small>SERVICES</small>
      </span>
    </span>
  )
}

function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const close = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="logo-link" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                path === item.href ||
                (item.href !== "/" && path.startsWith(item.href))
                  ? "active"
                  : ""
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="login-button">
          Login
        </Link>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "x" : "menu"} size={24} />
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          <div className="container">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  path === item.href ||
                  (item.href !== "/" && path.startsWith(item.href))
                    ? "active"
                    : ""
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mobile-login"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}

function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs container" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <span>/</span>
      {items.map((item, index) => (
        <span key={item.label}>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
          {index < items.length - 1 && <i>/</i>}
        </span>
      ))}
    </nav>
  )
}

function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow: string
  title: string
  text?: string
  align?: "left" | "center"
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

function ServiceCard({
  service,
  index,
}: {
  service: typeof services[number]
  index: number
}) {
  return (
    <article className="service-card">
      <div className="card-number">0{index + 1}</div>
      <div className="icon-disc">
        <Icon name={service.icon as IconName} size={24} />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link
        href={`/our-services/#${service.title.toLowerCase().replace(/\s+/g, "-")}`}
        className="text-link"
      >
        Learn more <Icon name="arrow" size={17} />
      </Link>
    </article>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <article className="course-card">
      <Link href={`/courses/${course.slug}/`} className="course-card__image">
        <img src={course.image} alt={course.imageAlt} loading="lazy" />
      </Link>
      <div className="course-card__body">
        <span className="tag">{course.category}</span>
        <h3>
          <Link href={`/courses/${course.slug}/`}>{course.title}</Link>
        </h3>
        <p>{course.summary}</p>
        <div className="course-card__footer">
          <span>{course.audience}</span>
          <Link
            href={`/courses/${course.slug}/`}
            aria-label={`View ${course.title}`}
          >
            <Icon name="arrow" size={20} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function Accordion({
  items = generalFaqs,
}: {
  items?: { question: string; answer: string }[]
}) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div className="accordion-item" key={item.question}>
          <h3>
            <button
              type="button"
              aria-expanded={open === index}
              onClick={() => setOpen(open === index ? null : index)}
            >
              <span>{item.question}</span>
              <span className={open === index ? "rotate" : ""}>
                <Icon name="chevron" />
              </span>
            </button>
          </h3>
          {open === index && (
            <div className="accordion-content">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container final-cta__inner">
        <div>
          <span className="eyebrow eyebrow--light">Your next step</span>
          <h2>Growth begins with the right conversation.</h2>
          <p>
            Explore a programme or find the kind of support that fits your
            current needs.
          </p>
        </div>
        <div className="button-row">
          <ButtonLink href="/courses/" variant="light">
            Explore courses
          </ButtonLink>
          <ButtonLink href="/our-services/" variant="secondary">
            View services
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact-details" className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Wordmark />
          <p>
            Coaching, counselling, education and mentorship designed to support
            purposeful growth.
          </p>
          <small>Social profiles will be added after verification.</small>
        </div>
        <div>
          <h3>Explore</h3>
          {[...navItems, { label: "Login", href: "/dashboard" }].map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Services</h3>
          <Link href="/our-services/#individuals">Individuals & families</Link>
          <Link href="/our-services/#schools">Schools & education</Link>
          <Link href="/our-services/#organisations">Organisations</Link>
          <Link href="/courses/">Learning programmes</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <p>
            Official phone, email and location details are awaiting
            confirmation.
          </p>
          <Link href="/our-services/#enquire" className="footer-action">
            Enquiry information <Icon name="arrow" size={17} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Edified Services. All rights reserved.
        </span>
        <span>Development preview · Privacy information to follow</span>
      </div>
    </footer>
  )
}

function HomePage() {
  const audiences = [
    [
      "01",
      "Children, teens & young adults",
      "Coaching, mentorship and learning designed around formative life stages.",
      "spark",
    ],
    [
      "02",
      "Parents & families",
      "Supportive consultation and learning for stronger relationships and confident caregiving.",
      "home",
    ],
    [
      "03",
      "Schools & educational institutions",
      "Programmes that contribute to learner wellbeing, leadership and positive school culture.",
      "school",
    ],
    [
      "04",
      "Corporates, CBOs & NGOs",
      "People-centred training, coaching and consultation for teams and community organisations.",
      "building",
    ],
  ]
  return (
    <main id="main">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Purpose-led growth, together</span>
            <h1>
              Empowering people.
              <br />
              <em>Strengthening families.</em>
              <br />
              Building purposeful futures.
            </h1>
            <p>
              Edified Services supports young people, parents, learners and
              organisations through thoughtful coaching, counselling, training
              and mentorship.
            </p>
            <div className="button-row">
              <ButtonLink href="/our-services/">
                Explore our services
              </ButtonLink>
              <ButtonLink href="/courses/" variant="secondary">
                Discover our courses
              </ButtonLink>
            </div>
            <div className="hero-note">
              <span>
                <Icon name="check" size={18} />
              </span>
              Support shaped around people, context and responsible practice.
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image">
              <img
                src={photos.hero}
                alt="A small group learning together from a shared book"
              />
            </div>
            <div className="hero-stamp">
              <span>Learn</span>
              <i>·</i>
              <span>Grow</span>
              <i>·</i>
              <span>Lead</span>
            </div>
            <div className="hero-quote">
              <span>“</span>
              <p>Every person carries the capacity to grow with purpose.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="approach-strip">
        <div className="container">
          <span>Our approach</span>
          <div>
            <strong>Listen deeply</strong>
            <i />
            <strong>Build understanding</strong>
            <i />
            <strong>Move with purpose</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Who we serve"
            title="Support that meets people where they are."
            text="Our work spans the key environments where people learn, relate, lead and grow."
          />
          <div className="audience-grid">
            {audiences.map(([number, title, text, icon]) => (
              <article className="audience-card" key={title}>
                <div>
                  <span>{number}</span>
                  <Icon name={icon as IconName} size={25} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link
                  href="/our-services/"
                  aria-label={`Explore services for ${title}`}
                >
                  <Icon name="arrow" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container editorial-grid">
          <div className="editorial-image">
            <img
              src={photos.about}
              alt="Two people in a supportive conversation"
              loading="lazy"
            />
            <div className="image-caption">
              Connection is at the heart of meaningful development.
            </div>
          </div>
          <div className="editorial-copy">
            <SectionHeading
              eyebrow="About Edified"
              title="Human development with warmth, clarity and purpose."
            />
            <p className="lead">
              Edified Services brings together education, reflection and
              relationship-centred support for individuals, families and
              organisations.
            </p>
            <p>
              This development site intentionally avoids unverified claims about
              the organisation’s history, registration or impact. Confirmed
              background information will be added before publication.
            </p>
            <div className="principles">
              <span>
                <Icon name="check" size={18} /> Person-centred
              </span>
              <span>
                <Icon name="check" size={18} /> Context-aware
              </span>
              <span>
                <Icon name="check" size={18} /> Growth-focused
              </span>
            </div>
            <ButtonLink href="/about-us/" variant="secondary">
              Learn more about us
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-top">
            <SectionHeading
              eyebrow="Ways we can help"
              title="Practical support for life, learning and leadership."
              text="Each service has a distinct purpose, while sharing a commitment to considered and responsible development."
            />
            <ButtonLink href="/our-services/" variant="secondary">
              View all services
            </ButtonLink>
          </div>
          <div className="services-grid">
            {services.slice(0, 6).map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--teal">
        <div className="container">
          <div className="section-top">
            <SectionHeading
              eyebrow="Featured programmes"
              title="Programmes designed for real-life growth."
              text="Explore current programme themes. Dates, delivery formats and fees will be displayed only after organisational confirmation."
            />
            <ButtonLink href="/courses/" variant="light">
              Explore all courses
            </ButtonLink>
          </div>
          <div className="courses-grid">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="section community-section">
        <div className="container community-grid">
          <div>
            <SectionHeading
              eyebrow="Community & social impact"
              title="Strengthening the circles around every person."
            />
            <p className="lead">
              Edified’s service themes extend into community development through
              education, youth mentorship, life skills, family support and
              mental wellness.
            </p>
            <p>
              Specific initiatives, partnerships and outcomes will be published
              once verified. Proposed work will always be clearly distinguished
              from established activity.
            </p>
            <ButtonLink href="/about-us/#community" variant="teal">
              Our community approach
            </ButtonLink>
          </div>
          <div className="community-image">
            <img
              src={photos.community}
              alt="A community group spending time together outdoors"
              loading="lazy"
            />
            <div>
              <strong>Community is a practice.</strong>
              <span>
                It grows through listening, participation and shared
                responsibility.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <SectionHeading
            eyebrow="Begin with clarity"
            title="A simple way to get started."
            align="center"
          />
          <div className="steps">
            {[
              [
                "01",
                "Explore",
                "Browse services and learning programmes to find a relevant starting point.",
              ],
              [
                "02",
                "Make an enquiry",
                "Share what you are looking for once verified contact channels are published.",
              ],
              [
                "03",
                "Discuss next steps",
                "The organisation can clarify suitability, format and practical arrangements.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className="verification-note">
            This proposed journey will be confirmed with the organisation before
            publication.
          </p>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container faq-grid">
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Helpful answers, without assumptions."
            text="We have clearly marked details that still require confirmation, so you always know what is established and what is still to come."
          />
          <Accordion />
        </div>
      </section>
      <FinalCta />
    </main>
  )
}

function PageHero({
  eyebrow,
  title,
  text,
  image,
}: {
  eyebrow: string
  title: string
  text: string
  image?: string
}) {
  return (
    <section className="page-hero">
      <div className="container page-hero__grid">
        <div>
          <span className="eyebrow eyebrow--light">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        {image && <img src={image} alt="" />}
      </div>
    </section>
  )
}

function CoursesPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          (category === "All" || course.category === category) &&
          `${course.title} ${course.summary} ${course.audience}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, category],
  )
  return (
    <main id="main">
      <Breadcrumbs items={[{ label: "Courses" }]} />
      <PageHero
        eyebrow="Learning for life"
        title="Programmes for purposeful, real-world growth."
        text="Discover educational experiences for young people, caregivers and professionals. Programme content shown here is introductory; operational details await confirmation."
      />
      <section className="section catalogue">
        <div className="container">
          <div className="catalogue-head">
            <div>
              <span className="eyebrow">Course catalogue</span>
              <h2>Find a programme</h2>
            </div>
            <span>
              {filtered.length}{" "}
              {filtered.length === 1 ? "programme" : "programmes"}
            </span>
          </div>
          <div className="filters">
            <label className="search-field">
              <span className="sr-only">Search courses</span>
              <Icon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, topic or audience"
              />
            </label>
            <div
              className="filter-buttons"
              aria-label="Filter courses by audience"
            >
              {[
                "All",
                "Young people",
                "Parents & families",
                "Professionals",
              ].map((item) => (
                <button
                  type="button"
                  className={category === item ? "active" : ""}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {filtered.length ? (
            <div className="courses-grid courses-grid--light">
              {filtered.map((course) => (
                <CourseCard course={course} key={course.slug} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="search" size={34} />
              <h3>No programmes match those filters.</h3>
              <p>Try a broader search or reset the catalogue.</p>
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  setQuery("")
                  setCategory("All")
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="section section--warm">
        <div className="container learning-approach">
          <SectionHeading
            eyebrow="The learning approach"
            title="Reflective. Practical. Connected to life."
            text="Programme themes combine guided learning with space for reflection and application. Final methods, facilitators and formats will be confirmed for each course."
          />
          <div>
            {[
              "Clear, accessible ideas",
              "Guided personal reflection",
              "Practical application",
              "Responsible boundaries",
            ].map((item) => (
              <span key={item}>
                <Icon name="check" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container faq-grid">
          <SectionHeading
            eyebrow="Course questions"
            title="Before you choose a programme."
          />
          <Accordion items={generalFaqs.slice(0, 3)} />
        </div>
      </section>
      <FinalCta />
    </main>
  )
}

function CourseDetailPage({ course }: { course: Course }) {
  const related = courses
    .filter((item) => item.slug !== course.slug)
    .slice(0, 3)
  return (
    <main id="main">
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses/" },
          { label: course.title },
        ]}
      />
      <section className="course-detail-hero">
        <div className="container detail-grid">
          <div>
            <span className="tag">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="lead">{course.summary}</p>
            <div className="detail-facts">
              <span>
                <small>Intended audience</small>
                <strong>{course.audience}</strong>
              </span>
              <span>
                <small>Format & duration</small>
                <strong>Awaiting confirmation</strong>
              </span>
              <span>
                <small>Published fee</small>
                <strong>Awaiting confirmation</strong>
              </span>
            </div>
            <ButtonLink href="#enquire">Enquire about this course</ButtonLink>
          </div>
          <img src={course.image} alt={course.imageAlt} />
        </div>
      </section>
      <section className="section">
        <div className="container detail-content">
          <article>
            <span className="eyebrow">Course overview</span>
            <h2>About this programme</h2>
            <p>{course.overview}</p>
            <h2>Indicative learning themes</h2>
            <ul>
              {course.outcomes.map((outcome) => (
                <li key={outcome}>
                  <Icon name="check" />
                  {outcome}
                </li>
              ))}
            </ul>
            <div className="notice">
              <strong>Please note</strong>
              <p>
                Learning outcomes are indicative and require organisational
                approval. This programme is educational and does not replace
                clinical assessment, therapy or professional advice.
              </p>
            </div>
          </article>
          <aside>
            <span className="eyebrow">Programme status</span>
            <h3>Details being confirmed</h3>
            <p>
              Dates, venue or online format, facilitator information and fees
              will be added only when verified.
            </p>
            <Link href="/courses/" className="text-link">
              Back to all courses <Icon name="arrow" />
            </Link>
          </aside>
        </div>
      </section>
      <section id="enquire" className="section section--soft">
        <div className="container compact-cta">
          <div>
            <span className="eyebrow">Interested in this programme?</span>
            <h2>Start with an enquiry.</h2>
            <p>
              Secure contact details are awaiting confirmation. This preview
              does not collect or store your information.
            </p>
          </div>
          <ButtonLink href="/our-services/#enquire" variant="secondary">
            View enquiry information
          </ButtonLink>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Continue exploring"
            title="Related programmes"
          />
          <div className="courses-grid courses-grid--light">
            {related.map((item) => (
              <CourseCard course={item} key={item.slug} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function AboutPage() {
  return (
    <main id="main">
      <Breadcrumbs items={[{ label: "About Us" }]} />
      <PageHero
        eyebrow="About Edified"
        title="Growth becomes meaningful when it is understood, supported and shared."
        text="Edified Services is presented as a people-development organisation serving individuals, families, learning communities and organisations."
        image={photos.about}
      />
      <section className="section">
        <div className="container editorial-grid editorial-grid--reverse">
          <div className="editorial-copy">
            <SectionHeading
              eyebrow="Who we are"
              title="A thoughtful space for learning and development."
            />
            <p className="lead">
              The Edified offering brings coaching, counselling, training,
              mentorship and consultation into one connected ecosystem of
              support.
            </p>
            <p>
              Official organisational history, location, legal status, mission
              and vision have not been supplied. These details are intentionally
              omitted rather than inferred, and can be added through the same
              content model once verified.
            </p>
          </div>
          <div className="values-panel">
            <span>Our current design principles</span>
            {[
              ["01", "See the whole person"],
              ["02", "Respect context"],
              ["03", "Support informed choice"],
              ["04", "Grow with purpose"],
            ].map(([n, text]) => (
              <div key={n}>
                <small>{n}</small>
                <strong>{text}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--warm">
        <div className="container">
          <SectionHeading
            eyebrow="Our approach"
            title="Distinct practices, connected by care."
            align="center"
          />
          <div className="approach-grid">
            {[
              [
                "Coaching",
                "Future-focused conversations that support reflection, agency and personal goals.",
                "compass",
              ],
              [
                "Counselling",
                "Confidential support held within appropriate professional scope and ethical boundaries.",
                "heart",
              ],
              [
                "Mentorship",
                "Guided learning through relationship, perspective and shared experience.",
                "people",
              ],
              [
                "Training",
                "Structured learning that builds understanding and practical capability.",
                "spark",
              ],
            ].map(([title, text, icon]) => (
              <article key={title}>
                <Icon name={icon as IconName} size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="team" className="section">
        <div className="container empty-profile">
          <SectionHeading
            eyebrow="Leadership & team"
            title="Meet the people behind the work."
            text="Team names, photographs, qualifications and biographies have not yet been provided. No fictional profiles have been created for this development preview."
          />
          <div>
            <Icon name="people" size={34} />
            <strong>Verified profiles coming soon</strong>
            <span>
              Approved team information can be added here without changing the
              page design.
            </span>
          </div>
        </div>
      </section>
      <section id="community" className="section community-about">
        <div className="container community-grid">
          <div className="community-image">
            <img
              src={photos.community}
              alt="People gathered together in a green outdoor setting"
              loading="lazy"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Community development"
              title="Building supportive environments around people."
            />
            <p className="lead">
              The organisation’s supplied themes include education support,
              youth mentorship, life skills, mental wellness, family support and
              child protection.
            </p>
            <p>
              These are presented as areas of interest rather than claimed
              achievements. Verified initiatives, safeguarding approaches and
              impact evidence can be published here as they become available.
            </p>
            <ButtonLink href="/courses/" variant="teal">
              Explore programmes
            </ButtonLink>
          </div>
        </div>
      </section>
      <FinalCta />
    </main>
  )
}

function ServicesPage() {
  const groups = [
    {
      id: "individuals",
      title: "Individuals & Families",
      text: "Support for personal development, family relationships, life transitions and informed next steps.",
      icon: "home",
    },
    {
      id: "schools",
      title: "Schools & Educational Institutions",
      text: "Learning and mentorship frameworks that can complement student development and school wellbeing.",
      icon: "school",
    },
    {
      id: "organisations",
      title: "Corporates, CBOs & NGOs",
      text: "Training, coaching and consultation shaped around people, leadership and organisational context.",
      icon: "building",
    },
  ]
  return (
    <main id="main">
      <Breadcrumbs items={[{ label: "Our Services" }]} />
      <PageHero
        eyebrow="Our services"
        title="Support for the places where people live, learn and lead."
        text="Explore distinct coaching, counselling, training and consultancy services, each described without unsupported promises or one-size-fits-all outcomes."
      />
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Find your starting point"
            title="Who are you looking to support?"
          />
          <div className="group-grid">
            {groups.map((group) => (
              <Link href={`#${group.id}`} key={group.id}>
                <Icon name={group.icon as IconName} size={28} />
                <h3>{group.title}</h3>
                <p>{group.text}</p>
                <span>
                  Explore this area <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {groups.map((group, groupIndex) => {
        const selected = services.filter(
          (service) => service.group === group.title,
        )
        return (
          <section
            id={group.id}
            className={`section service-group ${
              groupIndex % 2 === 0 ? "section--warm" : ""
            }`}
            key={group.id}
          >
            <div className="container">
              <div className="service-group__head">
                <span>0{groupIndex + 1}</span>
                <div>
                  <h2>{group.title}</h2>
                  <p>{group.text}</p>
                </div>
              </div>
              <div className="services-grid">
                {selected.map((service, index) => (
                  <ServiceCard
                    key={service.title}
                    service={service}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="A considered process"
            title="From enquiry to a clear next step."
            align="center"
          />
          <div className="steps">
            {[
              [
                "01",
                "Share the context",
                "Start with the person, group or organisational need you want to explore.",
              ],
              [
                "02",
                "Clarify suitability",
                "Discuss scope, professional boundaries and the most relevant kind of support.",
              ],
              [
                "03",
                "Agree the way forward",
                "Confirm format, practical arrangements and expectations before beginning.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className="verification-note">
            This process is indicative and awaiting organisational confirmation.
          </p>
        </div>
      </section>
      <section className="section section--soft">
        <div className="container faq-grid">
          <SectionHeading
            eyebrow="Service questions"
            title="Understand the options."
          />
          <Accordion items={generalFaqs} />
        </div>
      </section>
      <section id="enquire" className="enquiry-section">
        <div className="container compact-cta">
          <div>
            <span className="eyebrow eyebrow--light">Make an enquiry</span>
            <h2>Let’s identify a suitable next step.</h2>
            <p>
              Official contact channels have not yet been verified. This preview
              does not collect, submit or store personal information.
            </p>
          </div>
          <ButtonLink href="#contact-details" variant="light">
            Contact details status
          </ButtonLink>
        </div>
      </section>
    </main>
  )
}

function DashboardPage() {
  return (
    <main id="main" className="placeholder-page">
      <div>
        <Wordmark />
        <span className="eyebrow">Development placeholder</span>
        <h1>Client login is not connected yet.</h1>
        <p>
          Authentication is outside this frontend phase. This page is clearly
          identified as a placeholder and does not request or store credentials.
        </p>
        <ButtonLink href="/" variant="secondary">
          Return home
        </ButtonLink>
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main id="main" className="placeholder-page">
      <div>
        <span className="error-code">404</span>
        <h1>That page could not be found.</h1>
        <p>The address may have changed, or the page may not exist yet.</p>
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </main>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname)
    window.addEventListener("popstate", updatePath)
    return () => window.removeEventListener("popstate", updatePath)
  }, [])
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Edified Services | Purpose-led growth",
      "/courses/": "Courses | Edified Services",
      "/about-us/": "About Us | Edified Services",
      "/our-services/": "Our Services | Edified Services",
      "/dashboard": "Login | Edified Services",
    }
    document.title =
      titles[path] ??
      (path.startsWith("/courses/")
        ? "Course | Edified Services"
        : "Page not found | Edified Services")
  }, [path])

  const normalized =
    path !== "/" && !path.startsWith("/courses/") && path.endsWith("/")
      ? path
      : path
  let page: ReactNode
  if (normalized === "/") page = <HomePage />
  else if (normalized === "/courses" || normalized === "/courses/")
    page = <CoursesPage />
  else if (normalized.startsWith("/courses/")) {
    const slug = normalized.split("/").filter(Boolean)[1]
    const course = courses.find((item) => item.slug === slug)
    page = course ? <CourseDetailPage course={course} /> : <NotFoundPage />
  } else if (normalized === "/about-us" || normalized === "/about-us/")
    page = <AboutPage />
  else if (normalized === "/our-services" || normalized === "/our-services/")
    page = <ServicesPage />
  else if (normalized === "/dashboard") page = <DashboardPage />
  else page = <NotFoundPage />

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header path={path.endsWith("/") ? path : `${path}/`} />
      {page}
      {!["/dashboard"].includes(path) && <Footer />}
    </>
  )
}

export default App
