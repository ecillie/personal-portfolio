import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { experience, type ExperienceItem } from '@/data/experience';
import { otherProjects, projects, type Project } from '@/data/projects';
import { resumes } from '@/data/resumes';
import { profileLinks, siteContent } from '@/data/site';

const homeNavigation = [
  { label: 'Experience', hash: '#experience' },
  { label: 'Projects', hash: '#projects' },
  { label: 'Skills', hash: '#skills' },
  { label: 'About', hash: '#about' },
  { label: 'Contact', hash: '#contact' },
];

function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="Evan Cillie, home">
        EC<span>.</span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {homeNavigation.map((item) => (
          <Link
            to={`/${item.hash}`}
            aria-current={location.pathname === '/' && location.hash === item.hash ? 'location' : undefined}
            key={item.hash}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className="nav-resume" to={profileLinks.resume}>
        Resume <span aria-hidden="true">↗</span>
      </Link>
      <button
        className="mobile-menu-trigger"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
        <i aria-hidden="true" />
      </button>
      {menuOpen ? (
        <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
          {homeNavigation.map((item) => (
            <Link to={`/${item.hash}`} key={item.hash}>{item.label}</Link>
          ))}
          <Link className="mobile-resume" to={profileLinks.resume}>Resume ↗</Link>
        </nav>
      ) : null}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <p>© {new Date().getFullYear()} {siteContent.name}</p>
      <nav aria-label="Footer navigation">
        <Link to={profileLinks.resume}>Resume</Link>
        <a href={profileLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href={profileLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href={profileLinks.email}>Contact</a>
      </nav>
    </footer>
  );
}

function PageFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`page-frame ${className}`.trim()}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader />
      <main className="page-main" id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </div>
  );
}

function PageIntro({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="page-intro shell">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <div className="page-lede">{children}</div>
    </section>
  );
}

function SectionHeading({
  kicker,
  title,
  intro,
  action,
}: {
  kicker: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <header className="section-heading">
      <div>
        <p className="kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {intro ? <p className="section-intro">{intro}</p> : null}
      {action ? <div className="section-action">{action}</div> : null}
    </header>
  );
}

function ProjectVisual({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div className={`${large ? 'case-visual' : 'project-visual'} ${project.accent}`} aria-hidden="true">
      <span>{project.number}</span>
      <div className={large ? 'case-chart' : 'data-lines'}>
        <i /><i /><i /><i /><i />{large ? <i /> : null}
      </div>
    </div>
  );
}

function TechList({ items, label = 'Technologies', className = '' }: { items: string[]; label?: string; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={`tech-block ${className}`.trim()}>
      <p className="tech-label">{label}</p>
      <ul className="tech-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="project-links">
      <Link className="text-link" to={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
        Case study <span aria-hidden="true">→</span>
      </Link>
      {project.github ? (
        <a className="text-link" href={project.github} target="_blank" rel="noreferrer" aria-label={`${project.title} on GitHub`}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      ) : null}
      {project.demo ? (
        <a className="text-link" href={project.demo} target="_blank" rel="noreferrer" aria-label={`${project.title} live demo`}>
          Live demo <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}

function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <article className="featured-project-card" data-log-section={project.title}>
      <Link className="project-visual-link" to={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
        <ProjectVisual project={project} />
      </Link>
      <div className="featured-project-copy">
        <div className="project-focus" aria-label="Project focus">
          {project.focus.map((item) => <span key={item}>{item}</span>)}
        </div>
        <h3><Link to={`/projects/${project.slug}`}>{project.title}</Link></h3>
        <p className="project-summary">{project.shortDescription}</p>
        <dl className="project-brief">
          <div>
            <dt>Why it exists</dt>
            <dd>{project.problemSummary}</dd>
          </div>
          <div>
            <dt>What I built</dt>
            <dd>{project.buildSummary}</dd>
          </div>
        </dl>
        <div className="project-takeaway">
          <span>{project.takeaway.label}</span>
          <strong>{project.takeaway.value}</strong>
          <p>{project.takeaway.detail}</p>
        </div>
        <TechList items={project.technologies} label={project.technologyLabel ?? 'Technologies'} className="project-technologies" />
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}

function ExperienceEntry({
  item,
  index,
  headingLevel = 'h3',
  compact = false,
}: {
  item: ExperienceItem;
  index: number;
  headingLevel?: 'h2' | 'h3';
  compact?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <article className={`experience-entry ${item.current ? 'is-current' : ''} ${compact ? 'is-compact' : ''}`.trim()}>
      <div className="experience-meta">
        <span className="experience-number">{String(index + 1).padStart(2, '0')}</span>
        <p>{item.period}</p>
      </div>
      <div className="experience-heading">
        <Heading>{item.role}</Heading>
        <p className="organization">{item.organization}</p>
        {item.location ? <p className="experience-location">{item.location}</p> : null}
      </div>
      <p className="experience-context">{item.context}</p>
      {item.bullets.length > 0 ? (
        <ul className="experience-bullets">
          {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
      ) : null}
      <TechList items={item.technologies} label="Tools & context" className="experience-technologies" />
    </article>
  );
}

function HomePage() {
  const featuredExperience = experience.filter((item) => item.featured);
  return (
    <PageFrame>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" />{siteContent.eyebrow}</p>
          <h1 id="hero-title">{siteContent.heroTitle}</h1>
          <p className="hero-role">{siteContent.heroRole}</p>
          <p className="hero-summary">{siteContent.shortBio}</p>
          <div className="hero-actions" aria-label="Professional links">
            <Link className="button button-dark" to={profileLinks.resume}>Resume <span aria-hidden="true">↗</span></Link>
            <a className="button button-outline" href={profileLinks.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
            <a className="button button-outline" href={profileLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a className="button button-quiet" href={profileLinks.email}>Contact <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <aside className="hero-current" aria-label="Current role">
          <div className="orbit-art" aria-hidden="true">
            <span className="orbit orbit-one" /><span className="orbit orbit-two" />
            <span className="orbit-core">EC</span>
            <span className="orbit-label label-build">BUILD</span>
            <span className="orbit-label label-learn">LEARN</span>
            <span className="orbit-label label-repeat">ITERATE</span>
          </div>
          <div className="current-role-card">
            <p className="kicker">Currently</p>
            <strong>{siteContent.role}</strong>
            <span>{siteContent.company}</span>
            <small>{siteContent.location}</small>
          </div>
        </aside>
      </section>

      <section className="at-a-glance" aria-labelledby="glance-title">
        <div className="shell">
          <header className="glance-heading">
            <p className="kicker">Professional overview</p>
            <h2 id="glance-title">At a glance.</h2>
          </header>
          <div className="glance-grid">
            {siteContent.atAGlance.map((item, index) => (
              <article key={item.label}>
                <span>{String(index + 1).padStart(2, '0')} · {item.label}</span>
                <h3>{item.value}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-experience shell" id="experience">
        <SectionHeading
          kicker="Experience"
          title="Building in production—and learning from operations."
          intro="Software delivery, aviation operations, and an interdisciplinary education all shape how I approach systems."
          action={<Link className="text-link" to="/experience">Full experience <span aria-hidden="true">→</span></Link>}
        />
        <div className="home-experience-grid">
          {featuredExperience.map((item, index) => (
            <ExperienceEntry item={item} index={index} compact key={`${item.organization}-${item.role}`} />
          ))}
        </div>
      </section>

      <section className="home-section home-projects shell" id="projects">
        <SectionHeading
          kicker="Featured projects"
          title="The question, the system, and the result."
          intro="Four projects spanning machine learning, economics research, full-stack systems, aviation, and hockey analytics."
          action={<Link className="text-link" to="/projects">All projects <span aria-hidden="true">→</span></Link>}
        />
        <div className="featured-project-grid">
          {projects.map((project) => <FeaturedProjectCard project={project} key={project.slug} />)}
        </div>
      </section>

      <section className="home-section skills-section shell" id="skills">
        <SectionHeading
          kicker="Skills & technologies"
          title="A stack for shipping and investigating."
          intro="Grouped by how I use the tools—not presented as one undifferentiated keyword list."
        />
        <div className="skills-grid">
          {siteContent.skillGroups.map((group, index) => (
            <article key={group.label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{group.label}</h3>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section about-home shell" id="about">
        <div className="about-home-heading">
          <p className="kicker">About</p>
          <h2>{siteContent.aboutTitle}</h2>
          <Link className="text-link" to="/about">Read the longer story <span aria-hidden="true">→</span></Link>
        </div>
        <div className="about-home-copy">
          {siteContent.homeAboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="contact-home" id="contact">
        <div className="shell contact-home-inner">
          <div>
            <p className="kicker">Contact</p>
            <h2>Let’s talk about useful software and hard questions.</h2>
          </div>
          <div className="contact-home-copy">
            <p>For engineering opportunities, aviation work, research, or hockey analytics, email is the most direct way to reach me.</p>
            <a className="contact-email" href={profileLinks.email}>{profileLinks.emailLabel} <span aria-hidden="true">↗</span></a>
            <div className="contact-actions">
              <a href={profileLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href={profileLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <Link to={profileLinks.resume}>Resume ↗</Link>
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function AboutPage() {
  return (
    <PageFrame>
      <PageIntro kicker="About" title={siteContent.aboutTitle}><p>{siteContent.aboutIntro}</p></PageIntro>
      <section className="about-grid shell">
        <div className="about-statement"><span>01</span><h2>Building with data, technology, and curiosity.</h2></div>
        <div className="prose-stack">{siteContent.bioParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>
      <section className="interest-band shell" aria-label="Areas of interest">
        {siteContent.interests.map((interest, index) => <div key={interest}><span>0{index + 1}</span><h3>{interest}</h3></div>)}
      </section>
      <section className="next-cta shell">
        <p className="kicker">Keep exploring</p>
        <h2>See how those interests turn into work.</h2>
        <Link className="button button-dark" to="/#projects">View featured projects <span aria-hidden="true">→</span></Link>
      </section>
    </PageFrame>
  );
}

function ProjectsPage() {
  return (
    <PageFrame>
      <PageIntro kicker="Projects" title="Work built to answer real questions.">
        <p>Each overview explains the problem, what I built, and the most useful result. Open a case study for implementation detail.</p>
      </PageIntro>
      <section className="projects-page-grid shell" aria-label="Project case studies">
        <h2 className="sr-only">Featured case studies</h2>
        {projects.map((project) => <FeaturedProjectCard project={project} key={project.slug} />)}
      </section>
      <section className="other-projects shell">
        <SectionHeading
          kicker="Additional work"
          title="Research, automation, and experiments."
          intro="Smaller projects and completed studies that round out the work above."
        />
        <div className="other-project-grid">
          {otherProjects.map((project, index) => (
            <article className="other-project-card" key={project.title}>
              <span className="other-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>
                {project.link ? (
                  <a href={project.link} target="_blank" rel="noreferrer">
                    {project.title}<span className="other-arrow" aria-hidden="true">↗</span>
                  </a>
                ) : project.title}
              </h3>
              <p>{project.description}</p>
              <div className="other-status"><span>Status</span><strong>{project.status}</strong></div>
              {project.technologies.length > 0 ? <ul>{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul> : null}
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function ProjectPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <Navigate to="/404" replace />;

  return (
    <PageFrame>
      <section className="case-hero shell">
        <div className="case-heading">
          <Link className="back-link" to="/projects">← Back to Projects</Link>
          <p className="kicker">Case study {project.number}</p>
          <div className="project-focus">{project.focus.map((item) => <span key={item}>{item}</span>)}</div>
          <h1>{project.title}</h1>
          <p className="case-summary">{project.shortDescription}</p>
          <div className="case-actions">
            {project.github ? <a className="button button-dark" href={project.github} target="_blank" rel="noreferrer">View GitHub <span aria-hidden="true">↗</span></a> : null}
            {project.demo ? <a className="button button-outline" href={project.demo} target="_blank" rel="noreferrer">Live demo <span aria-hidden="true">↗</span></a> : null}
          </div>
        </div>
        <aside className="case-fast-facts" aria-label={`${project.title} key facts`}>
          <div className="case-status">
            <p className="fact-label"><span className="status-dot" />Current status</p>
            <p>{project.status}</p>
          </div>
          <div className="case-result">
            <p className="fact-label">{project.takeaway.label}</p>
            <strong>{project.takeaway.value}</strong>
            <p>{project.takeaway.detail}</p>
          </div>
          <TechList items={project.technologies} label={project.technologyLabel ?? 'Technologies'} className="case-technologies" />
        </aside>
      </section>
      <ProjectVisual project={project} large />
      <section className="case-body shell">
        <aside className="case-index">
          <p className="kicker">Inside the project</p>
          <nav aria-label="Case study sections">
            <a href="#overview">Overview</a>
            <a href="#problem">Problem</a>
            <a href="#approach">Approach</a>
            <a href="#implementation">Implementation</a>
            <a href="#results">Results</a>
            <a href="#next-steps">Next steps</a>
          </nav>
        </aside>
        <div className="case-story">
          <section id="overview"><p className="section-number">01</p><div><h2>Overview</h2><p>{project.overview}</p></div></section>
          <section id="problem"><p className="section-number">02</p><div><h2>Problem</h2><p>{project.problem}</p></div></section>
          <section id="approach"><p className="section-number">03</p><div><h2>Approach</h2><p>{project.approach}</p></div></section>
          <section id="implementation">
            <p className="section-number">04</p>
            <div><h2>Architecture & implementation</h2><ul>{project.implementation.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </section>
          <section id="results"><p className="section-number">05</p><div><h2>Results & takeaway</h2><p>{project.results}</p></div></section>
          <section id="next-steps"><p className="section-number">06</p><div><h2>Current status & next steps</h2><p>{project.status}</p></div></section>
        </div>
      </section>
      <nav className="case-next shell" aria-label="Project navigation">
        <p className="kicker">Keep exploring</p>
        <Link to="/projects">Back to all projects <span aria-hidden="true">→</span></Link>
      </nav>
    </PageFrame>
  );
}

function ExperiencePage() {
  return (
    <PageFrame>
      <PageIntro kicker="Experience" title="Responsibility across software and operations.">
        <p>Professional engineering, safety-critical aviation work, and an interdisciplinary education—all in one timeline.</p>
      </PageIntro>
      <section className="experience-page-list shell">
        {experience.map((item, index) => (
          <ExperienceEntry item={item} index={index} headingLevel="h2" key={`${item.organization}-${item.role}`} />
        ))}
      </section>
      <section className="principles-band shell">
        <p className="kicker">What I bring</p>
        <div>{['Systems thinking', 'Clear communication', 'Operational detail'].map((item, index) => <p key={item}><span>0{index + 1}</span>{item}</p>)}</div>
      </section>
    </PageFrame>
  );
}

function ResumePage() {
  const [selectedFilename, setSelectedFilename] = useState(resumes[0]?.filename);
  const preview = resumes.find((resume) => resume.filename === selectedFilename) ?? resumes[0];
  return (
    <PageFrame className="resume-page">
      <section className="resume-intro shell">
        <div><p className="kicker">Resumes</p><h1>Find the right version.</h1></div>
        <p>Choose a resume to preview it here, or download a copy when you&apos;re ready to share.</p>
      </section>
      <section className="resume-panel shell" data-log-section="Resume preview">
        <div className="resume-controls">
          <div className="resume-controls-label"><span className="status-dot" /><span>Viewing <strong>{preview?.label ?? 'Resume'}</strong></span></div>
          <nav className="resume-options" aria-label="Choose a resume to preview">
            {resumes.map((resume, index) => (
              <button
                className={`resume-select ${preview?.filename === resume.filename ? 'is-selected' : ''}`}
                type="button"
                aria-pressed={preview?.filename === resume.filename}
                data-log-label={resume.label}
                data-log-action="select resume preview"
                onClick={() => setSelectedFilename(resume.filename)}
                key={resume.filename}
              >
                <span className="resume-option-number">0{index + 1}</span><span>{resume.label}</span><span className="resume-option-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </nav>
          {preview ? <a className="resume-download" href={`/resumes/${preview.filename}`} data-log-label={`Download ${preview.label} PDF`} download>Download PDF <span aria-hidden="true">↓</span></a> : null}
        </div>
        <div className="resume-preview">{preview ? <iframe className="resume-frame" src={`/resumes/${preview.filename}`} title={`${preview.name} — ${preview.label}`} /> : null}</div>
      </section>
    </PageFrame>
  );
}

function ContactPage() {
  const links = [
    { label: 'Email', value: profileLinks.emailLabel, href: profileLinks.email, internal: false },
    { label: 'LinkedIn', value: 'in/evan-cillie', href: profileLinks.linkedin, internal: false, external: true },
    { label: 'GitHub', value: '@ecillie', href: profileLinks.github, internal: false, external: true },
    { label: 'Resume', value: 'View or download', href: profileLinks.resume, internal: true },
  ];
  return (
    <PageFrame>
      <PageIntro kicker="Contact" title="Good ideas start with a conversation.">
        <p>Have an engineering opportunity, an interesting problem, or want to compare notes on software, aviation, analytics, or hockey? I&apos;d be glad to connect.</p>
      </PageIntro>
      <section className="contact-layout shell">
        <div className="contact-card">
          <p className="kicker">Contact & profiles</p>
          {links.map((link) => {
            const content = <><span>{link.label}</span><strong>{link.value}</strong><i aria-hidden="true">↗</i></>;
            return link.internal ? (
              <Link to={link.href} key={link.label}>{content}</Link>
            ) : (
              <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined} key={link.label}>{content}</a>
            );
          })}
        </div>
        <div className="contact-note"><span className="big-dot" /><h2>Open to thoughtful conversations and ambitious work.</h2><p>Email is the most direct way to reach me; LinkedIn works well too.</p></div>
      </section>
    </PageFrame>
  );
}

function NotFoundPage() {
  return (
    <PageFrame>
      <section className="not-found shell"><p className="kicker">404</p><h1>That page left the map.</h1><p>The link may be out of date, but the rest of the site is right where you left it.</p><Link className="button button-dark" to="/">Back home →</Link></section>
    </PageFrame>
  );
}

function RouteEffects() {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    const pathnameChanged = previousPathname.current !== location.pathname;
    previousPathname.current = location.pathname;
    const project = projects.find((item) => location.pathname === `/projects/${item.slug}`);
    const labels: Record<string, string> = {
      '/': `${siteContent.name} — ${siteContent.heroRole}`,
      '/about': `About — ${siteContent.name}`,
      '/projects': `Projects — ${siteContent.name}`,
      '/experience': `Experience — ${siteContent.name}`,
      '/resume': `Resumes — ${siteContent.name}`,
      '/contact': `Contact — ${siteContent.name}`,
    };
    const descriptions: Record<string, string> = {
      '/': siteContent.shortBio,
      '/about': siteContent.aboutIntro,
      '/projects': 'Software engineering, aviation, economics research, machine learning, and hockey analytics projects by Evan Cillie.',
      '/experience': 'Evan Cillie’s software engineering, aviation operations, and interdisciplinary academic experience.',
      '/resume': 'View and download Evan Cillie’s general and aviation resumes.',
      '/contact': `Contact ${siteContent.name} and find his GitHub, LinkedIn, and resume.`,
    };
    const title = project ? `${project.title} — ${siteContent.name}` : labels[location.pathname] ?? `Page not found — ${siteContent.name}`;
    const description = project?.shortDescription ?? descriptions[location.pathname] ?? siteContent.shortBio;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);

    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
        if (pathnameChanged) document.getElementById('main-content')?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  return null;
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
