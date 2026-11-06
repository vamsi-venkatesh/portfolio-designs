/*
  Shared Conxfolio resume bridge for the selected career portfolio library.

  The host product may define window.CONXFOLIO_RESUME before this script loads.
  Supported inputs: Conxfolio's normalized resume object, JSON Resume-like data,
  and the legacy sample shapes used by the individual portfolio designs.
*/
(() => {
  const script = document.currentScript;
  const target = script?.dataset.conxfolioTarget || "PORTFOLIO_DATA";
  const own = (value) => value && typeof value === "object" ? value : {};
  const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
  const text = (...values) => values.find(value => typeof value === "string" && value.trim())?.trim() || "";
  const year = (value) => text(value).match(/\b(?:19|20)\d{2}\b/)?.[0] || text(value);
  /* 2026-09-10 — DATES CAME BACK. Every authored design lost role and education
     dates because this reader knew only `period`/`date`/`startDate`/`endDate`,
     while the editor sheet and most imported résumés write `from`/`to`,
     `start`/`end` or a single `dates` string. All of them are read now, and an
     open-ended role says "Present" — either because `current: true` or because
     the end value literally says so. */
  const PRESENT = /^(present|current|now|ongoing|to date|today)$/i;
  const period = (item) => {
    const entry = item && typeof item === "object" ? item : {};
    const explicit = text(entry.period, entry.dates, entry.date);
    if (explicit) return explicit;
    const rawStart = text(entry.startDate, entry.start_date, entry.from, entry.start, entry.since);
    const rawEnd = text(entry.endDate, entry.end_date, entry.to, entry.end, entry.until);
    const start = year(rawStart);
    const ongoing = entry.current === true
      || (Boolean(rawEnd) && PRESENT.test(rawEnd))
      || (!rawEnd && Boolean(start) && entry.current !== false);
    const end = ongoing ? "Present" : year(rawEnd);
    return [start, end].filter(Boolean).join(" — ");
  };
  const strings = (value) => list(value).map(item => typeof item === "string" ? item : text(item.name, item.title, item.label, item.summary)).filter(Boolean);

  function normalizeLinks(profile, source) {
    const direct = list(profile.links).concat(list(source.links));
    const profiles = list(profile.profiles).map(item => ({ label: text(item.network, item.label, item.username), url: text(item.url) }));
    const links = direct.concat(profiles).map(item => typeof item === "string"
      ? { label: item, url: item, href: item }
      : { ...item, label: text(item.label, item.network, item.name), url: text(item.url, item.href), href: text(item.href, item.url) })
      .filter(item => item.label && (item.url || item.href));
    /* 2026-09-25 · the app sends the same links as profile.links AND links, so
       every design printed each one twice. One link per address. */
    const seen = new Set();
    return links.filter(item => {
      const key = String(item.url || item.href).toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function normalizeSkills(source) {
    const raw = list(source.skills);
    if (!raw.length) return [];
    /* 2026-09-10 — NOTHING IS NAMED FOR THE PERSON. A flat list of skills has no
       group name, so it is given none: "Capabilities" was this adapter's word,
       not the résumé's, and it printed as a heading the visitor never wrote.
       The same for "Capability N" over an unnamed group. */
    if (raw.every(item => typeof item === "string")) return [{ group: "", title: "", items: raw, detail: raw.join(" · "), description: raw.join(" · ") }];
    return raw.map((item) => {
      const entry = typeof item === "string" ? { name: item } : own(item);
      /* A `{ title, group }` skill — one named skill filed under a group — used
         to lose its own name entirely: the group won the heading and `items`
         came back empty. The name is the item when no explicit list is given. */
      const explicit = strings(entry.items || entry.keywords || entry.skills || entry.values);
      const own_name = text(entry.title, entry.name, entry.label);
      const items = explicit.length ? explicit : (own_name ? [own_name] : []);
      const group = text(entry.group, entry.category, entry.title, entry.name, entry.label);
      return { ...entry, group, title: group, items, detail: text(entry.detail, entry.description, items.join(" · ")), description: text(entry.description, entry.detail, items.join(" · ")) };
    }).filter(item => item.group || item.items.length);
  }

  function normalizeProjects(source) {
    /* `include === false` is the editor's own "leave this out". The app filters
       upstream, but a raw spine (import, API, harness) does not — so it is
       honoured here for every design at once. */
    return list(source.projects).filter(item => own(item).include !== false).map((item) => {
      const project = own(item);
      const title = text(project.title, project.name);
      const summary = text(project.summary, project.description, project.tagline, project.highlights?.[0]);
      const skills = strings(project.skills || project.tags || project.keywords || project.technologies || project.stack);
      const outcomes = strings(project.outcomes || project.proof || project.results || (project.outcome ? [project.outcome] : []));
      const highlights = strings(project.highlights || project.bullets || project.achievements);
      const evidence = strings(project.evidence || project.proof);
      const results = strings(project.results || project.outcomes);
      const projectYear = text(project.year, year(project.period), year(project.date), year(project.startDate));
      const links = list(project.links).map(link => typeof link === "string" ? { label: "Project", url: link } : link);
      return {
        ...project,
        name: title,
        title,
        /* A project's TYPE is a thing the author writes, not the job they hold.
           Falling back to the person's role printed "Product designer" as the
           kind of the work, and "Selected project" was pure chrome. Empty when
           unauthored — the designs hide an empty bound field. */
        type: text(project.type, project.category),
        year: projectYear,
        period: text(project.period, projectYear),
        role: text(project.role, project.position),
        summary,
        description: text(project.description, summary),
        tagline: text(project.tagline),
        context: text(project.context, project.challenge, summary),
        challenge: text(project.challenge, project.context),
        process: text(project.process, project.approach),
        approach: text(project.approach, project.process),
        decisions: text(project.decisions, project.decision),
        decision: text(project.decision, project.contribution, highlights[0]),
        contribution: text(project.contribution, project.decision, highlights.join(" ")),
        outcome: text(project.outcome, outcomes[0]),
        outcomes,
        proof: outcomes,
        highlights,
        evidence,
        results,
        caseStudy: text(project.caseStudy, project.case_study, [project.challenge, project.process, project.decisions].filter(Boolean).join("\n\n")),
        credits: text(project.credits, project.collaborators),
        skills,
        tags: skills,
        methods: skills,
        status: text(project.status, projectYear),
        url: text(project.url, project.link),
        links
      };
    }).filter(item => item.title || item.summary || item.outcome || item.highlights.length || item.url);
  }

  function normalizeExperience(source) {
    return list(source.experience || source.workExperience || source.work).filter(item => own(item).include !== false).map((item) => {
      const role = own(item);
      const company = text(role.company, role.organisation, role.organization, role.name);
      const highlights = strings(role.highlights || role.bullets || role.achievements);
      const skills = strings(role.skills || role.keywords);
      return {
        ...role,
        role: text(role.role, role.position, role.title),
        position: text(role.position, role.role, role.title),
        company,
        organisation: company,
        organization: company,
        period: period(role),
        location: text(role.location),
        summary: text(role.summary, role.description),
        scope: text(role.scope, role.summary, role.description),
        highlights,
        skills
      };
    }).filter(item => item.role || item.company);
  }

  function normalizeEducation(source) {
    return list(source.education).map((item) => {
      const entry = own(item);
      const degree = text(entry.degree, entry.qualification, entry.title, [entry.studyType, entry.area].filter(Boolean).join(", "));
      const school = text(entry.school, entry.institution, entry.organization);
      const detail = text(entry.detail, entry.note, entry.area, entry.summary);
      return { ...entry, degree, qualification: degree, title: degree, school, institution: school, period: period(entry), detail, note: detail };
    }).filter(item => item.degree || item.school);
  }

  /* DESIGN BUG, DOCUMENTED ONCE HERE: `credentials || education` is always the
     credentials array, because this adapter always returns one — an empty array
     is truthy. A design that wants "certifications, and otherwise the degrees"
     must write `credentials.length ? credentials : education`. `education` is
     returned untouched alongside `credentials` for exactly that reason.
     (Design 17 already carries the fix.) */
  function normalizeCredentials(source) {
    return list(source.credentials || source.certifications || source.certificates).map((item) => {
      const entry = own(item);
      const title = text(entry.title, entry.name);
      return { ...entry, title, name: title, issuer: text(entry.issuer, entry.organization), year: text(entry.year, year(entry.date)) };
    }).filter(item => item.title);
  }

  function normalize(sourceInput) {
    const source = own(sourceInput);
    const profileSource = own(source.profile || source.person || source.basics);
    /* PHASE C · 2026-09-07 — TRUTH. An empty field is empty. This adapter used
       to invent an identity for anyone whose résumé did not carry one: a name
       ("Candidate Name"), a job ("Professional"), a place ("Available
       globally") and an availability ("Open to opportunities"). Those read on
       the published page as the person's own words about themselves. Every one
       of them is now an empty contract; the shared page-support layer hides the
       label that announced it. */
    const name = text(profileSource.name, source.name);
    const role = text(
      profileSource.role, profileSource.title, profileSource.headline, profileSource.label,
      source.role, source.title, source.headline
    );
    const summary = text(profileSource.summary, profileSource.about, profileSource.intro, source.summary, source.about);
    const locationObject = own(profileSource.location);
    const location = typeof profileSource.location === "string"
      ? profileSource.location
      : text([locationObject.city, locationObject.region, locationObject.countryCode].filter(Boolean).join(", "), source.location);
    const links = normalizeLinks(profileSource, source);
    const profile = {
      ...profileSource,
      name,
      initials: text(profileSource.initials, name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase()),
      role,
      title: role,
      /* A HEADLINE IS NOT A JOB TITLE. Falling the headline back to `role`
         printed the job twice on the designs that show both, and made a
         "headline" out of a word the person never chose. `role` stays available
         separately; `headlineIsRole` tells a design whose art direction wants a
         line under the name that it may use `role` for it. */
      headline: text(profileSource.headline, profileSource.introTitle),
      headlineIsRole: !text(profileSource.headline, profileSource.introTitle) && Boolean(role),
      introTitle: text(profileSource.introTitle, profileSource.headline),
      summary,
      about: text(profileSource.about, summary),
      intro: text(profileSource.intro, summary),
      aboutTitle: text(profileSource.aboutTitle),
      location: text(location),
      availability: text(profileSource.availability, profileSource.status, source.availability, source.status),
      status: text(profileSource.status, profileSource.availability, source.status, source.availability),
      email: text(profileSource.email, source.email),
      phone: text(profileSource.phone, source.phone),
      /* 2026-09-10 — "Let's talk." was this adapter's invented line, not
         anything the résumé wrote. A design prints its own contact heading as
         chrome; this default only ever masked a design that forgot to. */
      contactTitle: text(profileSource.contactTitle),
      contactCopy: text(profileSource.contactCopy, profileSource.availability, profileSource.status, source.availability, source.status),
      contactNote: text(profileSource.contactNote, profileSource.availability, profileSource.status, source.availability, source.status),
      focus: text(profileSource.focus),
      experience: text(profileSource.experience),
      links,
      profiles: links
    };
    const projects = normalizeProjects(source);
    const experience = normalizeExperience(source);
    const skills = normalizeSkills(source);
    const education = normalizeEducation(source);
    const credentials = normalizeCredentials(source);
    const recognition = list(source.recognition || source.awards || source.publications);
    const factsInput = list(source.facts || profileSource.facts || source.proof || source.metrics);
    const facts = factsInput.length ? factsInput.map(item => ({ ...own(item), label: text(item.label, item.name), value: text(item.value, item.summary) })).filter(item => item.label || item.value) : [
      experience.length && { label: "Experience", value: `${experience.length} role${experience.length === 1 ? "" : "s"}` },
      projects.length && { label: "Projects", value: `${projects.length} selected` },
      skills.length && { label: "Skills", value: `${skills.reduce((sum, group) => sum + group.items.length, 0)} mapped` }
    ].filter(Boolean);
    const proof = facts.map(item => ({ value: item.value, label: item.label }));
    const person = {
      ...profile,
      title: role,
      role,
      thesis: text(profileSource.thesis, summary),
      links: links.map(link => ({ ...link, href: link.href || link.url }))
    };
    const mandates = list(source.mandates).length ? list(source.mandates) : projects.map(project => ({
      period: project.period,
      title: project.title,
      organization: text(project.organization, project.organisation, project.company),
      brief: project.summary,
      remit: project.skills.join(", "),
      action: text(project.contribution, project.decision),
      outcome: project.outcome,
      url: project.url,
      image: project.image
    }));
    return {
      ...source,
      profile,
      person,
      basics: profile,
      /* Several designs read the phone off the root rather than the profile.
         It is mirrored here so the number exists wherever a design looks. */
      email: profile.email,
      phone: profile.phone,
      about: text(source.about, profile.about),
      projects,
      experience,
      work: experience,
      skills,
      education,
      credentials,
      certifications: credentials,
      recognition,
      awards: recognition,
      facts,
      proof,
      metrics: list(source.metrics).length ? list(source.metrics) : proof,
      mandates,
      links,
      languages: list(source.languages),
      openSource: list(source.openSource || source.publications)
    };
  }

  const source = window.CONXFOLIO_RESUME || window[target] || {};
  const normalized = normalize(source);
  window.CONXFOLIO_RESUME = source;
  window[target] = normalized;
  if (normalized.profile.name) {
    const currentTitle = document.title || "Career Portfolio";
    const brand = currentTitle.includes("·")
      ? currentTitle.split("·").pop().trim()
      : currentTitle.split("—")[0].trim();
    document.title = `${normalized.profile.name} — ${brand || "Career Portfolio"}`;
  }
  window.ConxfolioResumeAdapter = Object.assign(window.ConxfolioResumeAdapter || {}, {
    schema: "conxfolio-resume-v1 | jsonresume-v1",
    normalize,
    prepare(resume, targetName = target) {
      const value = normalize(resume);
      window.CONXFOLIO_RESUME = resume;
      window[targetName] = value;
      return value;
    }
  });
  document.documentElement.dataset.resumeAdapter = "ready";
})();
