export type Course = {
  slug: string
  title: string
  summary: string
  audience: string
  category: "Young people" | "Parents & families" | "Professionals"
  image: string
  imageAlt: string
  overview: string
  outcomes: string[]
}

export type Service = {
  title: string
  description: string
  group: "Individuals & Families" | "Schools & Education" | "Organisations"
  icon: string
}

export const photos = {
  hero: "https://images.unsplash.com/photo-1739302750691-59c12d251139?auto=format&fit=crop&w=1400&q=85",
  about:
    "https://images.unsplash.com/photo-1620237181627-6a433bb1538e?auto=format&fit=crop&w=1200&q=85",
  community:
    "https://images.unsplash.com/photo-1668965450046-99635e96a608?auto=format&fit=crop&w=1400&q=85",
  learning:
    "https://images.unsplash.com/photo-1761370981247-1dfd749ec96b?auto=format&fit=crop&w=1200&q=85",
}

export const courses: Course[] = [
  {
    slug: "mastering-self-leadership",
    title:
      "Mastering Self-Leadership for Academic Success and Career Readiness",
    summary:
      "A guided programme exploring self-awareness, personal responsibility and purposeful preparation for learning and work.",
    audience: "Learners and young adults",
    category: "Young people",
    image: photos.learning,
    imageAlt: "Three learners reviewing notes together",
    overview:
      "This programme title has been provided for development. Its final format, schedule, facilitator and delivery details will be published after confirmation.",
    outcomes: [
      "Explore the foundations of self-awareness and self-leadership",
      "Reflect on personal habits, choices and learning goals",
      "Connect academic decisions with longer-term career readiness",
    ],
  },
  {
    slug: "strengths-adapt-and-thrive",
    title: "Aligning Natural Strengths with the Tools to Adapt and Thrive",
    summary:
      "A strengths-led learning experience designed to encourage adaptability, reflection and confident personal growth.",
    audience: "Young people and professionals",
    category: "Professionals",
    image:
      "https://images.unsplash.com/photo-1778824717987-7a135889e928?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A learning group celebrating around a table",
    overview:
      "The programme supports structured reflection on natural strengths and the practical tools people can use when navigating change. Operational details are awaiting confirmation.",
    outcomes: [
      "Recognise and articulate individual strengths",
      "Consider constructive responses to change",
      "Build a practical personal growth framework",
    ],
  },
  {
    slug: "raising-confident-pre-teens",
    title: "Raising Confident, Self-Aware, and Values-Driven Pre-Teens",
    summary:
      "A thoughtful programme for caregivers seeking to support pre-teens through a formative stage of life.",
    audience: "Parents and caregivers",
    category: "Parents & families",
    image:
      "https://images.unsplash.com/photo-1791357775814-24088f555824?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A parent carrying a joyful child on his shoulders",
    overview:
      "This parent-focused programme creates space to explore connection, values and age-appropriate support. Final session structure and delivery format will be confirmed before publication.",
    outcomes: [
      "Reflect on connection and communication at home",
      "Explore ways to encourage healthy self-awareness",
      "Consider how family values can guide everyday choices",
    ],
  },
  {
    slug: "personality-science-and-growth",
    title:
      "Understanding Personality, Science, and Growth Across the Life Cycle",
    summary:
      "An accessible introduction to personality and development, framed for learning rather than diagnosis.",
    audience: "Parents, educators and professionals",
    category: "Professionals",
    image:
      "https://images.unsplash.com/photo-1757085242669-076c35ff9397?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "People learning creatively around a shared table",
    overview:
      "This educational programme examines broad ideas about personality and growth. It does not provide clinical assessment or diagnosis. Full curriculum details are awaiting confirmation.",
    outcomes: [
      "Build a practical vocabulary for discussing personality",
      "Consider growth through different life stages",
      "Apply reflective learning to everyday relationships",
    ],
  },
]

export const services: Service[] = [
  {
    title: "Children, Teens & Youth Life Coaching",
    description:
      "Age-aware coaching conversations that encourage reflection, responsibility and purposeful growth.",
    group: "Individuals & Families",
    icon: "spark",
  },
  {
    title: "Parenting Consultations",
    description:
      "A supportive space for parents and caregivers to consider family needs, communication and next steps.",
    group: "Individuals & Families",
    icon: "home",
  },
  {
    title: "Psychological Counselling",
    description:
      "Confidential, person-centred support delivered within confirmed professional scope and appropriate referral pathways.",
    group: "Individuals & Families",
    icon: "heart",
  },
  {
    title: "Leadership Training",
    description:
      "Practical learning experiences focused on self-leadership, communication and responsible influence.",
    group: "Organisations",
    icon: "compass",
  },
  {
    title: "Team Building & Coaching",
    description:
      "Facilitated experiences designed to strengthen shared understanding, collaboration and team reflection.",
    group: "Organisations",
    icon: "people",
  },
  {
    title: "Organisational Consultancy",
    description:
      "Context-led consultation to help organisations clarify people-development needs and suitable interventions.",
    group: "Organisations",
    icon: "building",
  },
  {
    title: "Career Coaching",
    description:
      "Structured guidance to help individuals explore strengths, direction and informed career decisions.",
    group: "Individuals & Families",
    icon: "path",
  },
  {
    title: "Peer-to-Peer School Mentorship",
    description:
      "Mentorship frameworks that can help schools cultivate peer support, responsibility and positive participation.",
    group: "Schools & Education",
    icon: "school",
  },
  {
    title: "Mental Health Clubs Establishment",
    description:
      "Guidance for schools exploring safe, educational wellbeing clubs with appropriate oversight and safeguarding.",
    group: "Schools & Education",
    icon: "leaf",
  },
]

export const generalFaqs = [
  {
    question: "Who can take part in Edified programmes?",
    answer:
      "The current programme themes are intended for young people, parents and caregivers, educators, professionals and organisations. Suitability for a specific programme is confirmed during an enquiry.",
  },
  {
    question: "Are courses available online or in person?",
    answer:
      "Delivery formats have not yet been confirmed for publication. Please enquire about the programme that interests you and the team can share the currently available options.",
  },
  {
    question: "How do I enquire about a service?",
    answer:
      "Choose a service or course and use the enquiry link. Contact details are awaiting organisational confirmation, so this development version does not submit or store personal information.",
  },
  {
    question: "Is counselling the same as coaching?",
    answer:
      "No. Coaching, counselling, training and consultancy have different purposes and professional boundaries. Edified will help clarify which type of support may be appropriate, without promising a particular outcome.",
  },
]
