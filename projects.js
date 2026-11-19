/* ==================================================================
   THE RECORD LIBRARY
   Add one object to PROJECTS to add a record. Everything else updates:
   • cover art is generated from the project's id + cover colours
   • genre filters and counts are rebuilt
   • catalog numbers follow the order of this list (first = SG-001)
   • featured: true puts a project in the big spot at the top
   • every project gets a shareable link: yoursite.com/#<id>
   • leave out any link (demo, repo, video, deck) and its button hides

   Fields
     id, title, year, genre, short          required
     stack            tech used, shown as credits
     sideA / sideB    two short lists; titles via sideATitle / sideBTitle
     notes            liner notes: the story of the project
     team             collaborators [{ name, url }]; you are added automatically
     award            short sticker text on the sleeve, e.g. "Top score"
     context          small line at the bottom of the back cover
     clip             path to a 10–20s muted MP4 shown on the back cover
     video, videoLength  full YouTube walkthrough + its duration
     links            { demo, repo, video, deck }
     cover            { style: rings|dots|stripes|waves, bg, ink, accent }
   ================================================================== */

const SITE = {
  artist: "Shardul Gupta",
  aka: "Sherry",
  catalogPrefix: "SG",
  tools: ["Python", "pandas", "scikit-learn", "SQL", "Tableau", "Power BI"],
  github: "https://github.com/shardulg2002",
  linkedin: "https://www.linkedin.com/in/shardul-gupta-2002",
  email: "collegeshardul@gmail.com"
};

const PROJECTS = [
  {
    id: "feedbackgameify",
    title: "FeedbackGameify",
    year: 2025,
    genre: "UX Research",
    short: "A student feedback platform that turns course surveys into a game, with points, badges and leaderboards, plus analytics dashboards for faculty.",
    stack: ["React", "Supabase", "Tailwind CSS", "Recharts", "Vite"],
    sideATitle: "Features",
    sideA: [
      "Gamified surveys with progress tracking",
      "Points, streak bonuses, badges and leaderboards",
      "Faculty dashboard with response rates and satisfaction scores"
    ],
    sideBTitle: "My role",
    sideB: [
      "Designed and ran an A/B survey comparing a gamified feedback form with a traditional one",
      "Used the findings to shape the gamification design: points, badges and leaderboards"
    ],
    notes: "FeedbackGameify was a team class project built around one question: does turning a feedback form into a game actually get more people to respond? My part was the research behind the app. I designed and ran an A/B survey comparing a gamified form with a traditional one, then used what we learned to shape the points, badges and leaderboard design. The project received the highest score in the class.",
    team: [{ name: "samichi-rungta", url: "https://github.com/samichi-rungta" }],
    award: "Top score",
    context: "Class project · Highest score in the class",
    links: { repo: "https://github.com/samichi-rungta/gamified_feedback_platform" },
    cover: { style: "dots", bg: "#2b1f3a", ink: "#f0c9a0", accent: "#7fd1b9" }
  },
  {
    id: "yieldvest",
    featured: true,
    title: "YieldVest",
    year: 2026,
    genre: "Fintech",
    short: "A marketplace that makes alternative investments like P2P lending, invoice discounting and structured debt accessible to retail investors.",
    stack: ["React", "Supabase", "Tailwind CSS", "Recharts", "Vite"],
    sideATitle: "Features",
    sideA: [
      "Curated P2P lending, invoice discounting and structured debt opportunities",
      "Onboarding quiz that profiles investors and recommends opportunities",
      "Portfolio dashboard with allocation and performance charts",
      "Investor community feed and a staff console for clients and support tickets"
    ],
    sideBTitle: "My role",
    sideB: [
      "Researched real alternative-investment products, including P2P platforms such as LenDenClub, and how their returns and risks work",
      "Built the marketplace product cards for P2P lending, invoice discounting and structured debt",
      "Wrote the business case and pitch for the class presentation"
    ],
    notes: "YieldVest was a team class project to design an investment marketplace for asset classes most retail investors never see. I focused on the finance and business side: researching how real P2P lending, invoice discounting and structured debt products work, turning that research into the product cards investors browse, and building the business case we pitched. The project received the highest score in the class.",
    team: [
      { name: "kunthshah21", url: "https://github.com/kunthshah21" },
      { name: "MaanyaDN", url: "https://github.com/MaanyaDN" }
    ],
    award: "Top score",
    context: "Class project · Highest score in the class",
    links: {
      demo: "https://fintech-platform-seven.vercel.app",
      repo: "https://github.com/kunthshah21/Fintech-Platform"
    },
    cover: { style: "rings", bg: "#13302a", ink: "#e9dcb4", accent: "#d9a441" }
  }
];
