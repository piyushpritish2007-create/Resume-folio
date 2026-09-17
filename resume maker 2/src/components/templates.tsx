import type { ReactNode } from "react";
import type { ResumeData } from "../types";
import {
  absUrl,
  contactItems,
  filled,
  formatRange,
  initials,
  prettyUrl,
  showAchievements,
  showCerts,
  showEducation,
  showExperience,
  showLanguages,
  showProjects,
  splitBullets,
} from "../utils/resume";

function Linkish({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <span>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function Classic({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contacts = contactItems(p);
  const extra = showCerts(data.certifications) || showLanguages(data.languages);

  return (
    <div className="template-classic">
      <header className="tc-header">
        <div>
          {filled(p.fullName) ? <h1 className="tc-name">{p.fullName.trim()}</h1> : null}
          {filled(p.jobTitle) ? <p className="tc-title">{p.jobTitle.trim()}</p> : null}
          {contacts.length > 0 ? (
            <p className="tc-contact">
              {contacts.map((c, i) => (
                <span key={`${c.text}-${i}`}>
                  {i > 0 ? <span className="tc-dot">·</span> : null}
                  <Linkish href={c.href}>{c.text}</Linkish>
                </span>
              ))}
            </p>
          ) : null}
        </div>
        {filled(p.photo) ? <img className="tc-photo" src={p.photo} alt="" /> : null}
      </header>

      {filled(data.summary) ? (
        <section className="tc-section">
          <h2 className="tc-h">Professional Summary</h2>
          <p className="tc-summary">{data.summary.trim()}</p>
        </section>
      ) : null}

      {showExperience(data.experience) ? (
        <section className="tc-section">
          <h2 className="tc-h">Work Experience</h2>
          {data.experience.map((item) => {
            if (!filled(item.company) && !filled(item.position)) return null;
            const bullets = splitBullets(item.responsibilities);
            return (
              <div className="tc-item" key={item.id}>
                <div className="tc-row">
                  <h3 className="tc-role">{item.position.trim() || item.company.trim()}</h3>
                  <span className="tc-date">
                    {formatRange(item.startDate, item.endDate, item.current)}
                  </span>
                </div>
                {filled(item.company) && filled(item.position) ? (
                  <p className="tc-sub">{item.company.trim()}</p>
                ) : null}
                {bullets.length > 0 ? (
                  <ul className="tc-bullets">
                    {bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {showEducation(data.education) ? (
        <section className="tc-section">
          <h2 className="tc-h">Education</h2>
          {data.education.map((item) => {
            if (!filled(item.degree) && !filled(item.institution)) return null;
            return (
              <div className="tc-item" key={item.id}>
                <div className="tc-row">
                  <h3 className="tc-role">{item.degree.trim() || item.institution.trim()}</h3>
                  {filled(item.year) ? <span className="tc-date">{item.year.trim()}</span> : null}
                </div>
                <p className="tc-sub">
                  {item.institution.trim()}
                  {filled(item.score) ? `  ·  ${item.score.trim()}` : ""}
                </p>
              </div>
            );
          })}
        </section>
      ) : null}

      {data.skills.length > 0 ? (
        <section className="tc-section">
          <h2 className="tc-h">Skills</h2>
          <p className="tc-skills">{data.skills.join("  ·  ")}</p>
        </section>
      ) : null}

      {showProjects(data.projects) ? (
        <section className="tc-section">
          <h2 className="tc-h">Projects</h2>
          {data.projects.map((item) => {
            if (!filled(item.name) && !filled(item.description)) return null;
            return (
              <div className="tc-item" key={item.id}>
                {filled(item.name) ? <h3 className="tc-role">{item.name.trim()}</h3> : null}
                {filled(item.description) ? (
                  <p className="tc-muted">{item.description.trim()}</p>
                ) : null}
                {filled(item.technologies) ? (
                  <p className="tc-sub">Technologies: {item.technologies.trim()}</p>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {extra ? (
        <div className="tc-two">
          {showCerts(data.certifications) ? (
            <section className="tc-section">
              <h2 className="tc-h">Certifications</h2>
              {data.certifications.map((item) => {
                if (!filled(item.name) && !filled(item.issuer)) return null;
                return (
                  <div className="tc-item" key={item.id}>
                    <h3 className="tc-role">{item.name.trim()}</h3>
                    <p className="tc-sub">
                      {[item.issuer.trim(), item.year.trim()].filter(Boolean).join("  ·  ")}
                    </p>
                  </div>
                );
              })}
            </section>
          ) : null}
          {showLanguages(data.languages) ? (
            <section className="tc-section">
              <h2 className="tc-h">Languages</h2>
              {data.languages.map((item) => {
                if (!filled(item.name)) return null;
                return (
                  <div className="tc-lang" key={item.id}>
                    <span>{item.name.trim()}</span>
                    <span>{item.proficiency}</span>
                  </div>
                );
              })}
            </section>
          ) : null}
        </div>
      ) : null}

      {showAchievements(data.achievements) ? (
        <section className="tc-section">
          <h2 className="tc-h">Achievements</h2>
          <ul className="tc-bullets">
            {data.achievements.map((item) =>
              filled(item.description) ? <li key={item.id}>{item.description.trim()}</li> : null,
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Modern({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contacts = contactItems(p);
  const mono = initials(p.fullName);

  return (
    <div className="template-modern">
      <aside className="tm-side">
        <div className="tm-photo-wrap">
          {filled(p.photo) ? (
            <img className="tm-photo" src={p.photo} alt="" />
          ) : mono ? (
            <div className="tm-mono">{mono}</div>
          ) : null}
        </div>
        {filled(p.fullName) ? <p className="tm-side-name">{p.fullName.trim()}</p> : null}
        {filled(p.jobTitle) ? <p className="tm-side-job">{p.jobTitle.trim()}</p> : null}

        {contacts.length > 0 ? (
          <>
            <h2 className="tm-side-h">Contact</h2>
            {filled(p.phone) ? (
              <p className="tm-contact-item">
                <span className="tm-contact-label">Phone</span>
                <Linkish href={`tel:${p.phone.trim()}`}>{p.phone.trim()}</Linkish>
              </p>
            ) : null}
            {filled(p.email) ? (
              <p className="tm-contact-item">
                <span className="tm-contact-label">Email</span>
                <Linkish href={`mailto:${p.email.trim()}`}>{p.email.trim()}</Linkish>
              </p>
            ) : null}
            {filled(p.location) ? (
              <p className="tm-contact-item">
                <span className="tm-contact-label">Location</span>
                {p.location.trim()}
              </p>
            ) : null}
            {filled(p.linkedin) ? (
              <p className="tm-contact-item">
                <span className="tm-contact-label">LinkedIn</span>
                <Linkish href={absUrl(p.linkedin)}>{prettyUrl(p.linkedin)}</Linkish>
              </p>
            ) : null}
            {filled(p.website) ? (
              <p className="tm-contact-item">
                <span className="tm-contact-label">Website</span>
                <Linkish href={absUrl(p.website)}>{prettyUrl(p.website)}</Linkish>
              </p>
            ) : null}
          </>
        ) : null}

        {data.skills.length > 0 ? (
          <>
            <h2 className="tm-side-h">Skills</h2>
            <div>
              {data.skills.map((s) => (
                <span className="tm-skill" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </>
        ) : null}

        {showLanguages(data.languages) ? (
          <>
            <h2 className="tm-side-h">Languages</h2>
            {data.languages.map((item) =>
              filled(item.name) ? (
                <div className="tm-lang" key={item.id}>
                  <div className="tm-lang-name">{item.name.trim()}</div>
                  <div className="tm-lang-level">{item.proficiency}</div>
                </div>
              ) : null,
            )}
          </>
        ) : null}

        {showCerts(data.certifications) ? (
          <>
            <h2 className="tm-side-h">Certifications</h2>
            {data.certifications.map((item) =>
              filled(item.name) || filled(item.issuer) ? (
                <div className="tm-cert" key={item.id}>
                  <strong>{item.name.trim()}</strong>
                  {[item.issuer.trim(), item.year.trim()].filter(Boolean).join(" · ")}
                </div>
              ) : null,
            )}
          </>
        ) : null}
      </aside>

      <div className="tm-main">
        {filled(data.summary) ? (
          <section>
            <h2 className="tm-h">Profile</h2>
            <p className="tm-summary">{data.summary.trim()}</p>
          </section>
        ) : null}

        {showExperience(data.experience) ? (
          <section>
            <h2 className="tm-h">Experience</h2>
            {data.experience.map((item) => {
              if (!filled(item.company) && !filled(item.position)) return null;
              const bullets = splitBullets(item.responsibilities);
              return (
                <div className="tm-item" key={item.id}>
                  <div className="tm-row">
                    <h3 className="tm-role">{item.position.trim() || item.company.trim()}</h3>
                    <span className="tm-date">
                      {formatRange(item.startDate, item.endDate, item.current)}
                    </span>
                  </div>
                  {filled(item.company) && filled(item.position) ? (
                    <p className="tm-sub">{item.company.trim()}</p>
                  ) : null}
                  {bullets.length > 0 ? (
                    <ul className="tm-bullets">
                      {bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </section>
        ) : null}

        {showEducation(data.education) ? (
          <section>
            <h2 className="tm-h">Education</h2>
            {data.education.map((item) => {
              if (!filled(item.degree) && !filled(item.institution)) return null;
              return (
                <div className="tm-item" key={item.id}>
                  <div className="tm-row">
                    <h3 className="tm-role">{item.degree.trim() || item.institution.trim()}</h3>
                    {filled(item.year) ? <span className="tm-date">{item.year.trim()}</span> : null}
                  </div>
                  <p className="tm-sub">
                    {item.institution.trim()}
                    {filled(item.score) ? ` · ${item.score.trim()}` : ""}
                  </p>
                </div>
              );
            })}
          </section>
        ) : null}

        {showProjects(data.projects) ? (
          <section>
            <h2 className="tm-h">Projects</h2>
            {data.projects.map((item) => {
                if (!filled(item.name) && !filled(item.description)) return null;
                return (
                  <div className="tm-item" key={item.id}>
                    {filled(item.name) ? <h3 className="tm-role">{item.name.trim()}</h3> : null}
                    {filled(item.description) ? (
                      <p className="tm-sub">{item.description.trim()}</p>
                    ) : null}
                    {filled(item.technologies) ? (
                      <p className="tm-tech">{item.technologies.trim()}</p>
                    ) : null}
                  </div>
                );
              })}
          </section>
        ) : null}

        {showAchievements(data.achievements) ? (
          <section>
            <h2 className="tm-h">Achievements</h2>
            <ul className="tm-bullets">
              {data.achievements.map((item) =>
                filled(item.description) ? <li key={item.id}>{item.description.trim()}</li> : null,
              )}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Executive({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contacts = contactItems(p);

  return (
    <div className="template-executive">
      <header className="te-top">
        {filled(p.photo) ? <img className="te-photo" src={p.photo} alt="" /> : null}
        {filled(p.fullName) ? <h1 className="te-name">{p.fullName.trim()}</h1> : null}
        {filled(p.jobTitle) ? <p className="te-title">{p.jobTitle.trim()}</p> : null}
        {contacts.length > 0 ? (
          <p className="te-contact">
            {contacts.map((c, i) => (
              <span key={`${c.text}-${i}`}>
                {i > 0 ? "  ·  " : ""}
                <Linkish href={c.href}>{c.text}</Linkish>
              </span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="te-rule" aria-hidden="true">
        <span className="te-rule-line" />
        <span className="te-diamond" />
        <span className="te-rule-line" />
      </div>

      {filled(data.summary) ? (
        <section>
          <h2 className="te-h">Summary</h2>
          <p className="te-summary">{data.summary.trim()}</p>
        </section>
      ) : null}

      {showExperience(data.experience) ? (
        <section>
          <h2 className="te-h">Experience</h2>
          {data.experience.map((item) => {
            if (!filled(item.company) && !filled(item.position)) return null;
            const bullets = splitBullets(item.responsibilities);
            return (
              <div className="te-item" key={item.id}>
                <div className="te-row">
                  <h3 className="te-role">{item.position.trim() || item.company.trim()}</h3>
                  <span className="te-date">
                    {formatRange(item.startDate, item.endDate, item.current)}
                  </span>
                </div>
                {filled(item.company) && filled(item.position) ? (
                  <p className="te-sub">{item.company.trim()}</p>
                ) : null}
                {bullets.length > 0 ? (
                  <ul className="te-bullets">
                    {bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {showEducation(data.education) ? (
        <section>
          <h2 className="te-h">Education</h2>
          {data.education.map((item) => {
            if (!filled(item.degree) && !filled(item.institution)) return null;
            return (
              <div className="te-item" key={item.id}>
                <div className="te-row">
                  <h3 className="te-role">{item.degree.trim() || item.institution.trim()}</h3>
                  {filled(item.year) ? <span className="te-date">{item.year.trim()}</span> : null}
                </div>
                <p className="te-sub">
                  {item.institution.trim()}
                  {filled(item.score) ? `  ·  ${item.score.trim()}` : ""}
                </p>
              </div>
            );
          })}
        </section>
      ) : null}

      {data.skills.length > 0 ? (
        <section>
          <h2 className="te-h">Expertise</h2>
          <p className="te-skills">{data.skills.join("   ·   ")}</p>
        </section>
      ) : null}

      {showProjects(data.projects) ? (
        <section>
          <h2 className="te-h">Projects</h2>
          {data.projects.map((item) => {
            if (!filled(item.name) && !filled(item.description)) return null;
            return (
              <div className="te-item" key={item.id}>
                {filled(item.name) ? <h3 className="te-role">{item.name.trim()}</h3> : null}
                {filled(item.description) ? (
                  <p className="te-muted">{item.description.trim()}</p>
                ) : null}
                {filled(item.technologies) ? (
                  <p className="te-sub">{item.technologies.trim()}</p>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {showCerts(data.certifications) || showLanguages(data.languages) ? (
        <div className="te-grid">
          {showCerts(data.certifications) ? (
            <section>
              <h2 className="te-h">Certifications</h2>
              {data.certifications.map((item) =>
                filled(item.name) || filled(item.issuer) ? (
                  <div className="te-item" key={item.id}>
                    <h3 className="te-role">{item.name.trim()}</h3>
                    <p className="te-sub">
                      {[item.issuer.trim(), item.year.trim()].filter(Boolean).join("  ·  ")}
                    </p>
                  </div>
                ) : null,
              )}
            </section>
          ) : null}
          {showLanguages(data.languages) ? (
            <section>
              <h2 className="te-h">Languages</h2>
              {data.languages.map((item) =>
                filled(item.name) ? (
                  <div className="te-lang" key={item.id}>
                    <span>{item.name.trim()}</span>
                    <span>{item.proficiency}</span>
                  </div>
                ) : null,
              )}
            </section>
          ) : null}
        </div>
      ) : null}

      {showAchievements(data.achievements) ? (
        <section>
          <h2 className="te-h">Achievements</h2>
          <ul className="te-bullets">
            {data.achievements.map((item) =>
              filled(item.description) ? <li key={item.id}>{item.description.trim()}</li> : null,
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function ResumePaper({ data }: { data: ResumeData }) {
  return (
    <div className="resume-paper">
      {data.template === "modern" ? (
        <Modern data={data} />
      ) : data.template === "executive" ? (
        <Executive data={data} />
      ) : (
        <Classic data={data} />
      )}
    </div>
  );
}
