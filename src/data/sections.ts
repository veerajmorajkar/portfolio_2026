import type { SectionData, SectionId } from "../types";

// Helper to get asset path with correct base URL
const getAssetPath = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
};

export const SECTIONS: SectionData[] = [
  {
    id: "experience",
    title: "Experience",
    discColor: "#EE4B2B",
    discImage: getAssetPath("assets/images/section_disks_1.png"),
    audioSrc: getAssetPath("assets/audio/experience_audio.mp3"),
    songName: "Fred again.. - Angie (I've Been Lost)",
    content: {
      type: "experience",
      entries: [
        {
          company: "Investza",
          role: "Lead Frontend Developer",
          description: "Built 3 production websites with React, TypeScript, and Vite. Integrated REST APIs for mutual fund data, managed 4 interns, and translated Figma designs into polished UI with smooth animations.",
          dateRange: "Nov 2025 – Present",
        },
        {
          company: "Juggie's Coffer",
          role: "Management Intern (Remote)",
          description: "Managed social media content and community engagement. Organized marketing events and pop-ups. Supported SEO optimization and coordinated with website developers to improve brand visibility.",
          dateRange: "Aug 2023 – Feb 2024",
        },
      ],
    },
  },
  {
    id: "skills",
    title: "Skills",
    discColor: "#ca2c92",
    discImage: getAssetPath("assets/images/section_disks_3.png"),
    audioSrc: getAssetPath("assets/audio/skills_audio.mp3"),
    songName: "RICK OWENS - Ufo361 feat. Ken Carson",
    content: {
      type: "skills",
      entries: [
        {
          category: "Languages",
          skills: ["HTML", "JavaScript", "TypeScript", "CSS", "Python", "Java", "C++", "C"],
        },
        {
          category: "Tools & Frameworks",
          skills: ["React", "React Native", "Node.js", "Django", "REST API", "Next.js", "Spring Boot"],
        },
        {
          category: "Databases",
          skills: ["MongoDB", "PostgreSQL"],
        },
        {
          category: "Other Skills",
          skills: ["Leadership", "Problem Solving", "Critical Thinking", "Communication"],
        },
      ],
    },
  },
  {
    id: "education",
    title: "Education",
    discColor: "#624CAB",
    discImage: getAssetPath("assets/images/section_disks_4.png"),
    audioSrc: getAssetPath("assets/audio/education_audio.mp3"),
    songName: "Jaded - Drake",
    content: {
      type: "education",
      entries: [
        {
          institution: "Vidyalankar Institute of Technology",
          degree: "B.Tech in Electronics and Telecommunication",
          dateRange: "June 2021 – Jul 2025",
        },
        {
          institution: "Lakshya Institute",
          degree: "HSC, Junior College",
          dateRange: "2019 – 2021",
        },
        {
          institution: "IES Manik Vidyamandir",
          degree: "ICSE, Schooling",
          dateRange: "2007 – 2019",
        },
      ],
    },
  },
  {
    id: "projects",
    title: "Projects",
    discColor: "#5CF64A",
    discImage: getAssetPath("assets/images/section_disks_5.png"),
    audioSrc: getAssetPath("assets/audio/projects_audio.mp3"),
    songName: "Pink + White - Frank Ocean",
    content: {
      type: "projects",
      entries: [
        {
          name: "Login/Logout System",
          description: "Built a secure Python authentication module with login/logout flows, session handling, and activity logging for auditability and security monitoring.",
          links: [
            { label: "GitHub", url: "https://github.com/veerajmorajkar/register-system" },
            { label: "Preview", url: "#preview" },
          ],
          previewImage: getAssetPath("assets/images/login_logout_preview.png"),
        },
        {
          name: "Twitter Data Pipeline",
          description: "Designed an ETL pipeline using Apache Airflow with Twitter API integration. Built Python transformations for data cleansing and validation to produce analysis-ready datasets.",
          links: [
            { label: "Preview", url: "#preview" },
          ],
          previewImage: getAssetPath("assets/images/twitter_pipeline_preview.jpg"),
        },
        {
          name: "Brick Breaker Game",
          description: "Developed a Java-based game using OOP principles with real-time game loop, collision detection, scoring system, and difficulty progression for smooth gameplay.",
          links: [
            { label: "Preview", url: "#preview" },
          ],
          previewImage: getAssetPath("assets/images/ball_break_preview.png"),
        },
      ],
    },
  },
  {
    id: "about",
    title: "The Introduction",
    discColor: "#30D5C8",
    discImage: getAssetPath("assets/images/section_disks_2.png"),
    audioSrc: getAssetPath("assets/audio/aboutme_audio.mp3"),
    songName: "Sober to Death - Car Seat Headrest",
    content: {
      type: "about",
      avatar: "/images/avatar.png",
      name: "VEERAJ MORAJKAR",
      title: "Frontend-Focused Full-Stack Developer",
      links: [
        { label: "→ RESUME", url: "#" },
        { label: "→ OLD PORTFOLIO", url: "https://veerajmorajkar.github.io/veeraj-portfolio/" },
        { label: "→ YOUTUBE", url: "https://www.youtube.com/@nemo8467" },
      ],
      bio: "Frontend-focused Full-Stack Developer specializing in React, TypeScript, JavaScript, React Native, and Python. Experienced in building finance/portfolio management products with strong UI/UX implementation, REST API integration, and web performance optimization. Uses AI development tools to accelerate delivery and ship scalable, user-centric interfaces.",
    },
  },
];

/** The 5th disc image is used as the main vinyl record on the platter */
export const VINYL_RECORD_IMAGE = getAssetPath("assets/images/section_disks_5.png");

export function getSectionById(id: SectionId): SectionData {
  const section = SECTIONS.find((s) => s.id === id);
  if (!section) {
    throw new Error(`Section not found: ${id}`);
  }
  return section;
}
