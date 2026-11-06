/*
  29 · PAPER TOWN — the authored specimen.

  EXAMPLE DATA for the design catalogue: an invented person, so the town can be
  walked at full strength before anyone connects a résumé. The page prints
  "Example portfolio" whenever this is the data on the surface.

  The host injects the visitor's own résumé as window.CONXFOLIO_RESUME before
  this file runs, so the `||` below keeps real data and never overwrites it.
*/
window.CONXFOLIO_RESUME = window.CONXFOLIO_RESUME || {
  profile: {
    name: 'Noor Haddad',
    headline: 'Builds the quiet parts of software: latency, reliability, and the tools that prove it',
    summary: 'Twelve years on systems that other teams depend on — payment rails, a booking engine, an internal platform three hundred engineers ship through. The work is nearly always the same shape: measure the thing everyone argues about, make the slow path visible, then take it away.\n\nThis page is the record: eight pieces of work, three roles, and the number each one moved.',
    location: 'Lisbon, Portugal',
    availability: 'Open to a platform or reliability role from April',
    email: 'noor@example.dev',
    phone: '+351 21 000 0000',
    links: [
      { label: 'LinkedIn', url: 'https://example.com/in/noor-haddad' },
      { label: 'Writing', url: 'https://example.dev/notes' }
    ]
  },
  experience: [
    {
      role: 'Principal engineer, platform',
      organisation: 'Corvina Payments',
      from: '2021',
      to: 'Present',
      location: 'Lisbon',
      summary: 'Owns the shared runtime the payment teams deploy on, and the service-level work that decides what "healthy" means.',
      highlights: [
        'Cut median deploy time from 34 minutes to 6 by moving builds off the shared runner and caching at the layer boundary.',
        'Wrote the error-budget policy the four payment teams now plan against; page volume fell 62% in the first two quarters.'
      ]
    },
    {
      role: 'Staff software engineer',
      organisation: 'Halden Rail',
      from: '2018',
      to: '2021',
      location: 'Porto',
      summary: 'Booking engine for a regional rail operator: seats, fares, refunds, and the seasonal load that arrives in one hour.',
      highlights: [
        'Rebuilt seat allocation around a single write path; oversold bookings went from 400 a month to zero.',
        'Held the July peak — 11× normal traffic — with no downtime for the first time in the product’s history.'
      ]
    },
    {
      role: 'Backend engineer',
      organisation: 'Meridian Health Tools',
      from: '2014',
      to: '2018',
      location: 'Coimbra',
      summary: 'Clinical scheduling used by eleven hospitals; the first place the reliability habit came from.',
      highlights: [
        'Reduced the nightly sync from 5 hours to 40 minutes, which put the roster on screens before the morning shift.'
      ]
    }
  ],
  projects: [
    {
      title: 'Deploy path rebuild',
      role: 'Lead',
      year: '2024',
      outcome: 'Median deploy 34 min → 6 min across 40 services.',
      summary: 'Split the monolithic build into cached layers and moved the slow path to a warm pool, so a rollback is now the same six minutes as a release.',
      tags: ['Build systems', 'Caching', 'CI'],
      url: 'https://example.dev/work/deploy-path'
    },
    {
      title: 'Error budget policy',
      role: 'Author',
      year: '2023',
      outcome: 'Paging volume down 62% in two quarters.',
      summary: 'One page that says what each service promises, what happens when it misses, and who decides. The arguments stopped being about opinions.',
      tags: ['SRE', 'Service levels']
    },
    {
      title: 'Seat allocation write path',
      role: 'Lead',
      year: '2020',
      outcome: 'Oversold bookings 400/month → 0.',
      summary: 'Every seat change funnelled through one ordered writer; the three racing code paths that caused the double-sells were deleted.',
      tags: ['Distributed systems', 'Postgres']
    },
    {
      title: 'Peak season load plan',
      role: 'Lead',
      year: '2020',
      outcome: 'Held 11× traffic with no downtime.',
      summary: 'Load-shaping, a queue in front of payments, and a rehearsal week in which the team practised failing on purpose.',
      tags: ['Load testing', 'Capacity']
    },
    {
      title: 'Nightly roster sync',
      role: 'Engineer',
      year: '2017',
      outcome: 'Sync 5 h → 40 min for eleven hospitals.',
      summary: 'Replaced a full nightly export with a change feed; the roster reached the ward screens before the morning shift instead of during it.',
      tags: ['Data pipelines']
    },
    {
      title: 'Latency budget dashboard',
      role: 'Lead',
      year: '2022',
      outcome: 'One number per team, updated hourly.',
      summary: 'A board that shows where each request actually spent its time, so the slow part is chosen by evidence rather than by seniority.',
      tags: ['Observability'],
      url: 'https://example.dev/work/latency-budget'
    },
    {
      title: 'Refund reconciliation',
      role: 'Engineer',
      year: '2019',
      outcome: 'Manual reconciliation 9 h/week → 20 min.',
      summary: 'Matched refunds to settlements automatically and left the finance team a queue of only the genuine exceptions.',
      tags: ['Payments', 'Reconciliation']
    },
    {
      title: 'On-call handbook',
      role: 'Author',
      year: '2023',
      outcome: 'New engineers take their first shift in week three.',
      summary: 'Every alert with the question it answers, the graph that shows it, and the last time it fired for a real reason.',
      tags: ['On-call', 'Documentation']
    }
  ],
  skills: [
    { group: 'Systems', items: ['Go', 'Rust', 'Postgres', 'Kafka'] },
    { group: 'Reliability', items: ['Service levels', 'Load testing', 'Incident review'] },
    { group: 'Platform', items: ['Kubernetes', 'Terraform', 'Build caching'] }
  ],
  education: [
    { degree: 'MSc, Distributed Systems', school: 'University of Porto', period: '2012 — 2014' },
    { degree: 'BSc, Computer Science', school: 'University of Coimbra', period: '2009 — 2012' }
  ],
  languages: ['Portuguese — native', 'English — fluent', 'Arabic — conversational']
};
